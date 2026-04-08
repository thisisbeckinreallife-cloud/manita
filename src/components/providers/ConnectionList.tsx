import { getProvider } from "@/lib/domain/providers";
import type { ConnectionRecord } from "@/server/connections";

export function ConnectionList({ connections }: { connections: ConnectionRecord[] }) {
  if (connections.length === 0) {
    return (
      <p className="text-[11px] text-ink-500">
        No connections yet. Add one above to enable model selection on tasks.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {connections.map((connection) => {
        const provider = getProvider(connection.provider);
        return (
          <li
            key={connection.id}
            className="flex items-center justify-between rounded-md border border-ink-800 bg-ink-950 px-2.5 py-1.5 text-xs text-ink-200"
          >
            <span className="truncate font-medium">{connection.label}</span>
            <span className="ml-2 shrink-0 text-[10px] uppercase tracking-wider text-ink-400">
              {provider?.label ?? connection.provider}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
