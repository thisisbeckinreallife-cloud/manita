import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * HTTP basic auth gate for the single-user Path B deploy posture.
 *
 * The Vibe Workspace has no real auth — every request hits
 * getOrCreateDefaultUser. Shipping it to a public Railway URL would be a
 * lie-by-omission against the honesty contract. This middleware is the
 * "basic-auth proxy" half of the Path B deploy-readiness plan: it turns
 * the raw Next.js runtime into a single-credential gated surface so the
 * URL can be parked publicly without exposing the workspace.
 *
 * Fail-closed invariant: if BASIC_AUTH_USER or BASIC_AUTH_PASS is
 * missing at request time, every request returns 503. We do NOT silently
 * allow traffic through when the env is misconfigured, because that is
 * exactly how public-URL leaks happen. The trade-off is that a forgotten
 * env var bricks the deploy until it is set — which is the safer failure
 * mode for this posture.
 *
 * This middleware runs in the Edge runtime, so it has access to
 * process.env but not to node:crypto.timingSafeEqual. The credential
 * comparison is a manual XOR fold: if the supplied and configured
 * strings have the same length, every code unit is XORed before the
 * result is checked, so an attacker cannot learn *which* byte first
 * diverged from response timing. It does, however, short-circuit on a
 * length mismatch — for a single-user basic-auth gate with a
 * fixed-length configured password, the length oracle is acceptable.
 * A real multi-user session auth would use node:crypto.timingSafeEqual
 * in a Node runtime instead.
 */

const REALM = "Vibe Workspace";

export function middleware(request: NextRequest): NextResponse {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (!user || !pass) {
    return new NextResponse(
      "Server misconfigured: BASIC_AUTH_USER and BASIC_AUTH_PASS must be set.",
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Basic ")) {
    return unauthorized();
  }

  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return unauthorized();
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) {
    return unauthorized();
  }

  const suppliedUser = decoded.slice(0, separator);
  const suppliedPass = decoded.slice(separator + 1);

  if (
    !constantTimeEqual(suppliedUser, user) ||
    !constantTimeEqual(suppliedPass, pass)
  ) {
    return unauthorized();
  }

  return NextResponse.next();
}

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Gate everything that carries user-visible content or mutates state.
// _next/static and _next/image are left unmatched because the browser
// auto-forwards the Authorization header from the parent document, and
// excluding them keeps the static asset path fast and the matcher list
// readable. /favicon.ico is excluded for the same reason.
//
// /api/health is intentionally unauthenticated: it is the probe used by
// Railway's HTTP healthcheck and by external uptime monitors, so it
// cannot depend on the single-credential Basic Auth gate. The endpoint
// itself only exposes {status, db, checkedAt} — no project data, no
// configuration, no secrets.
//
// The exemption is anchored with `$` so it matches ONLY the exact path
// `/api/health`, never a prefix. `/api/healthz`, `/api/health-debug`,
// and `/api/health/foo` all still hit the Basic Auth gate. If a future
// slice legitimately needs nested paths under /api/health/*, the
// matcher must be widened consciously, not accidentally.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health$).*)"],
};
