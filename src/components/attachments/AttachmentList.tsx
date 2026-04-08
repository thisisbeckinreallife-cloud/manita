import type { AttachmentRecord } from "@/server/attachments";

export function AttachmentList({ attachments }: { attachments: AttachmentRecord[] }) {
  if (attachments.length === 0) {
    return (
      <p className="text-[11px] text-ink-500">No attachments yet.</p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {attachments.map((attachment) => (
        <li key={attachment.id}>
          <a
            href={`/api/attachments/${attachment.id}/download`}
            download={attachment.filename}
            className="flex max-w-xs items-center gap-2 rounded-md border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-xs text-ink-200 transition hover:border-ink-500 hover:text-ink-100"
            title={`${attachment.filename} (${formatBytes(attachment.sizeBytes)})`}
          >
            <span className="truncate">{attachment.filename}</span>
            <span className="shrink-0 text-[10px] text-ink-500">
              {formatBytes(attachment.sizeBytes)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
