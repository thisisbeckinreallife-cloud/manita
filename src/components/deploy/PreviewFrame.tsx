"use client";

import { useState } from "react";

/**
 * Live iframe preview of the deployed artifact. Renders inside the
 * right pane of the workspace as the hero surface — the point of the
 * pane is to let the operator see what is actually running on the
 * linked Railway deploy, not just a text hyperlink to it.
 *
 * The component is client-side because the viewport toggle and the
 * reload counter are ephemeral UI state; the persisted preview URL and
 * staleness are still resolved server-side and passed in as props.
 *
 * The iframe is sandboxed with `allow-scripts allow-same-origin
 * allow-forms` — the target is the user's own Railway deploy, so
 * same-origin is safe, and forms need to work for any login or submit
 * flow on the deployed app. `allow-popups` is intentionally omitted
 * so a misbehaving deploy cannot spawn windows from inside the
 * workspace chrome.
 */
export type PreviewFrameProps = {
  url: string;
  isStale: boolean;
  observedAt: Date;
};

type Viewport = "desktop" | "mobile";

// Mobile width matches the `mobile` preset used elsewhere in the
// toolchain (375 is the iPhone 12/13/14 logical width). Kept as a
// constant so it is easy to change later without hunting inline values.
const MOBILE_WIDTH_PX = 375;

export function PreviewFrame({ url, isStale, observedAt }: PreviewFrameProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  // Incrementing this counter remounts the iframe element via its
  // `key`, which forces a clean reload. Using `location.reload()`
  // inside the iframe would require cross-origin access which the
  // sandbox deliberately blocks.
  const [reloadNonce, setReloadNonce] = useState(0);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-ink-800 bg-ink-900 px-3 py-2">
        <ViewportToggle value={viewport} onChange={setViewport} />
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-ink-800 bg-ink-950 px-2 py-1">
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
              isStale ? "bg-warn/15 text-warn" : "bg-ok/15 text-ok"
            }`}
          >
            {isStale ? "stale" : "live"}
          </span>
          <span
            className="truncate text-[11px] text-ink-300"
            title={url}
          >
            {stripScheme(url)}
          </span>
        </div>
        <IconButton
          label="Reload preview"
          onClick={() => setReloadNonce((n) => n + 1)}
        >
          <ReloadIcon />
        </IconButton>
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          title="Open in new tab"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-ink-800 bg-ink-950 text-ink-300 hover:border-ink-700 hover:text-ink-100"
        >
          <ExternalIcon />
        </a>
      </div>
      <div className="flex flex-1 items-stretch justify-center overflow-auto bg-ink-950">
        <div
          className="h-full bg-ink-900"
          style={
            viewport === "mobile"
              ? { width: `${MOBILE_WIDTH_PX}px`, maxWidth: "100%" }
              : { width: "100%" }
          }
        >
          <iframe
            key={`${url}::${reloadNonce}`}
            src={url}
            title="Deployed artifact preview"
            className="h-full w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
      <div className="border-t border-ink-800 bg-ink-900 px-3 py-1.5">
        <p className="text-[10px] text-ink-500">
          Observed {formatDate(observedAt)}
        </p>
      </div>
    </div>
  );
}

function ViewportToggle({
  value,
  onChange,
}: {
  value: Viewport;
  onChange: (next: Viewport) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Preview viewport"
      className="flex items-center rounded-md border border-ink-800 bg-ink-950 p-0.5"
    >
      <ViewportButton
        active={value === "desktop"}
        onClick={() => onChange("desktop")}
        label="Desktop viewport"
      >
        <DesktopIcon />
      </ViewportButton>
      <ViewportButton
        active={value === "mobile"}
        onClick={() => onChange("mobile")}
        label="Mobile viewport"
      >
        <MobileIcon />
      </ViewportButton>
    </div>
  );
}

function ViewportButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-6 w-6 items-center justify-center rounded ${
        active
          ? "bg-ink-800 text-ink-100"
          : "text-ink-400 hover:text-ink-200"
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md border border-ink-800 bg-ink-950 text-ink-300 hover:border-ink-700 hover:text-ink-100"
    >
      {children}
    </button>
  );
}

function DesktopIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="12" height="8" rx="1" />
      <path d="M6 13h4M8 11v2" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="2" width="6" height="12" rx="1.2" />
      <path d="M7.5 12.5h1" />
    </svg>
  );
}

function ReloadIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89" />
      <path d="M13.5 3v3h-3" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3h4v4" />
      <path d="M13 3l-6 6" />
      <path d="M12 9v3.5A1.5 1.5 0 0 1 10.5 14h-7A1.5 1.5 0 0 1 2 12.5v-7A1.5 1.5 0 0 1 3.5 4H7" />
    </svg>
  );
}

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

function formatDate(value: Date): string {
  return value.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
