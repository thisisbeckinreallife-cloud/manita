import {
  RailwayAdapterError,
  type RailwayAdapter,
  type RailwayErrorCode,
  type TriggerDeployInput,
  type TriggerDeployResult,
} from "./adapter";

/**
 * Production Railway adapter using the native fetch client against the
 * Railway GraphQL Public API v2. Requires a Railway team token exposed
 * via the RAILWAY_TOKEN environment variable. When the token is missing,
 * every call throws RAILWAY_TOKEN_NOT_CONFIGURED — the server layer
 * surfaces that as a FAILED deploy run and the RightPane renders it
 * honestly.
 *
 * MVP scope: triggers an instance redeploy via `serviceInstanceRedeploy`.
 * The mutation returns the deployment id; the current status is read
 * from the latest deployment via a follow-up query. We do NOT poll —
 * whatever Railway reports on the first fetch is what we persist. A
 * background reconcile slice will replace this with proper polling.
 *
 * Nothing outside src/lib/railway/** may import this file directly; the
 * entry point is src/server/deploy-runs.ts via the adapter interface.
 */
export class RailwayHttpClient implements RailwayAdapter {
  private readonly token: string | undefined;
  private readonly endpoint: string;

  constructor(options: { token?: string; endpoint?: string } = {}) {
    this.token = options.token ?? process.env.RAILWAY_TOKEN;
    this.endpoint =
      options.endpoint ?? "https://backboard.railway.app/graphql/v2";
  }

  async triggerDeploy(input: TriggerDeployInput): Promise<TriggerDeployResult> {
    if (!this.token) {
      throw new RailwayAdapterError(
        "RAILWAY_TOKEN_NOT_CONFIGURED",
        "Set the RAILWAY_TOKEN environment variable on the server.",
      );
    }

    const mutation = /* GraphQL */ `
      mutation ServiceInstanceRedeploy(
        $serviceId: String!
        $environmentId: String!
      ) {
        serviceInstanceRedeploy(
          serviceId: $serviceId
          environmentId: $environmentId
        )
      }
    `;

    if (!input.railwayEnvironmentId) {
      throw new RailwayAdapterError(
        "RAILWAY_VALIDATION_FAILED",
        "Railway environment id is required to trigger a deploy.",
      );
    }

    const response = await this.graphql<{
      data?: { serviceInstanceRedeploy: boolean } | null;
      errors?: Array<{ message: string; extensions?: { code?: string } }>;
    }>(mutation, {
      serviceId: input.railwayServiceId,
      environmentId: input.railwayEnvironmentId,
    });

    if (response.errors && response.errors.length > 0) {
      const first = response.errors[0]!;
      throw new RailwayAdapterError(
        mapGraphqlErrorCode(first.extensions?.code),
        first.message,
      );
    }

    // The mutation itself returns a boolean. To get the real deployment
    // id, url, and status we issue a follow-up query. The MVP keeps this
    // minimal and defensive: if the follow-up fails, we still return a
    // REQUESTED result so the server can persist the transition.
    const status = await this.fetchLatestDeploymentStatus(
      input.railwayProjectId,
      input.railwayServiceId,
      input.railwayEnvironmentId,
    );

    return status;
  }

  private async fetchLatestDeploymentStatus(
    projectId: string,
    serviceId: string,
    environmentId: string,
  ): Promise<TriggerDeployResult> {
    const query = /* GraphQL */ `
      query LatestDeployment(
        $projectId: String!
        $serviceId: String!
        $environmentId: String!
      ) {
        deployments(
          first: 1
          input: {
            projectId: $projectId
            serviceId: $serviceId
            environmentId: $environmentId
          }
        ) {
          edges {
            node {
              id
              status
              staticUrl
              url
            }
          }
        }
      }
    `;
    try {
      const body = await this.graphql<{
        data?: {
          deployments: {
            edges: Array<{
              node: {
                id: string;
                status: string;
                staticUrl: string | null;
                url: string | null;
              };
            }>;
          };
        } | null;
        errors?: Array<{ message: string }>;
      }>(query, { projectId, serviceId, environmentId });

      const node = body.data?.deployments?.edges?.[0]?.node;
      if (!node) {
        return {
          externalId: "",
          status: "REQUESTED",
          previewUrl: null,
          logs: ["Railway accepted the redeploy but no deployment node is visible yet."],
        };
      }
      return {
        externalId: node.id,
        status: mapRailwayStatus(node.status),
        previewUrl: node.staticUrl ?? node.url ?? null,
        logs: [`Railway reports status=${node.status}`],
      };
    } catch {
      return {
        externalId: "",
        status: "REQUESTED",
        previewUrl: null,
        logs: [
          "Railway accepted the redeploy but the follow-up status query failed.",
        ],
      };
    }
  }

  private async graphql<T>(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "User-Agent": "vibe-workspace",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new RailwayAdapterError(
        mapStatusToCode(response.status),
        await safeReadErrorBody(response),
        response.status,
      );
    }

    return (await response.json()) as T;
  }
}

async function safeReadErrorBody(response: Response): Promise<string | null> {
  try {
    return (await response.text()).slice(0, 500);
  } catch {
    return null;
  }
}

function mapStatusToCode(status: number): RailwayErrorCode {
  if (status === 401) return "RAILWAY_UNAUTHORIZED";
  if (status === 403) return "RAILWAY_FORBIDDEN";
  if (status === 404) return "RAILWAY_NOT_FOUND";
  if (status === 422 || status === 400) return "RAILWAY_VALIDATION_FAILED";
  return "RAILWAY_UNKNOWN_ERROR";
}

function mapGraphqlErrorCode(code: string | undefined): RailwayErrorCode {
  if (code === "UNAUTHENTICATED") return "RAILWAY_UNAUTHORIZED";
  if (code === "FORBIDDEN") return "RAILWAY_FORBIDDEN";
  if (code === "NOT_FOUND") return "RAILWAY_NOT_FOUND";
  if (code === "BAD_USER_INPUT") return "RAILWAY_VALIDATION_FAILED";
  return "RAILWAY_UNKNOWN_ERROR";
}

function mapRailwayStatus(
  status: string,
): TriggerDeployResult["status"] {
  const upper = status.toUpperCase();
  if (upper === "SUCCESS" || upper === "SUCCESSFUL") return "LIVE";
  if (upper === "FAILED" || upper === "CRASHED") return "FAILED";
  if (upper === "BUILDING" || upper === "INITIALIZING") return "BUILDING";
  if (upper === "DEPLOYING") return "DEPLOYING";
  return "REQUESTED";
}
