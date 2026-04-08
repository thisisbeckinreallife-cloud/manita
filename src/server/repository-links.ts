import { db } from "@/lib/db";
import { getGithubAdapter, GithubAdapterError } from "@/lib/github";
import { requestBootstrapInput } from "@/lib/validation/repository-link";
import {
  assertRepositoryLinkStatus,
  type RepositoryLinkStatus,
} from "@/lib/domain/repository-link-status";

export type RepositoryLinkRecord = {
  id: string;
  projectId: string;
  provider: string;
  requestedOwner: string;
  requestedName: string;
  requestedPrivate: boolean;
  requestedAt: Date;
  observedOwner: string | null;
  observedName: string | null;
  observedUrl: string | null;
  observedAt: Date | null;
  status: RepositoryLinkStatus;
  errorCode: string | null;
  errorDetail: string | null;
};

const SELECT_LINK = {
  id: true,
  projectId: true,
  provider: true,
  requestedOwner: true,
  requestedName: true,
  requestedPrivate: true,
  requestedAt: true,
  observedOwner: true,
  observedName: true,
  observedUrl: true,
  observedAt: true,
  status: true,
  errorCode: true,
  errorDetail: true,
} as const;

function narrow(
  row: {
    id: string;
    projectId: string;
    provider: string;
    requestedOwner: string;
    requestedName: string;
    requestedPrivate: boolean;
    requestedAt: Date;
    observedOwner: string | null;
    observedName: string | null;
    observedUrl: string | null;
    observedAt: Date | null;
    status: string;
    errorCode: string | null;
    errorDetail: string | null;
  },
): RepositoryLinkRecord {
  return { ...row, status: assertRepositoryLinkStatus(row.status) };
}

export async function getRepositoryLinkForProject(
  projectId: string,
): Promise<RepositoryLinkRecord | null> {
  const row = await db.repositoryLink.findUnique({
    where: { projectId },
    select: SELECT_LINK,
  });
  return row ? narrow(row) : null;
}

/**
 * Kick off the GitHub bootstrap for a project. The flow is synchronous:
 *
 *   1. Validate input.
 *   2. Upsert a RepositoryLink row in REQUESTED state so the UI has
 *      something to render even if the provider call fails.
 *   3. Call the adapter.
 *   4. Update the row to OBSERVED (with the real owner/url) or FAILED
 *      (with the adapter error code + detail). Never throw past this
 *      boundary without persisting the FAILED state first.
 *
 * Returns the final persisted record. Callers decide how to surface the
 * terminal state — the API route maps FAILED to a 502, the server action
 * returns it as action state.
 */
export async function requestBootstrap(rawInput: unknown): Promise<RepositoryLinkRecord> {
  const input = requestBootstrapInput.parse(rawInput);

  const project = await db.project.findUnique({
    where: { id: input.projectId },
    select: { id: true },
  });
  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const requested = await db.repositoryLink.upsert({
    where: { projectId: input.projectId },
    create: {
      projectId: input.projectId,
      provider: "github",
      requestedOwner: input.owner,
      requestedName: input.name,
      requestedPrivate: input.private,
      status: "REQUESTED",
    },
    update: {
      requestedOwner: input.owner,
      requestedName: input.name,
      requestedPrivate: input.private,
      requestedAt: new Date(),
      status: "REQUESTED",
      observedOwner: null,
      observedName: null,
      observedUrl: null,
      observedAt: null,
      errorCode: null,
      errorDetail: null,
    },
    select: SELECT_LINK,
  });

  try {
    const created = await getGithubAdapter().createRepo({
      owner: input.owner,
      name: input.name,
      private: input.private,
    });
    const observed = await db.repositoryLink.update({
      where: { id: requested.id },
      data: {
        status: "OBSERVED",
        observedOwner: created.ownerLogin,
        observedName: created.repoName,
        observedUrl: created.htmlUrl,
        observedAt: new Date(),
        errorCode: null,
        errorDetail: null,
      },
      select: SELECT_LINK,
    });
    return narrow(observed);
  } catch (error) {
    const code =
      error instanceof GithubAdapterError ? error.code : "GITHUB_UNKNOWN_ERROR";
    const detail =
      error instanceof GithubAdapterError
        ? error.detail
        : error instanceof Error
          ? error.message
          : null;
    const failed = await db.repositoryLink.update({
      where: { id: requested.id },
      data: {
        status: "FAILED",
        errorCode: code,
        errorDetail: detail,
      },
      select: SELECT_LINK,
    });
    return narrow(failed);
  }
}
