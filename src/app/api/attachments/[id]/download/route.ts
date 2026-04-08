import { NextResponse } from "next/server";
import { getAttachmentForDownload } from "@/server/attachments";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const found = await getAttachmentForDownload(id);
  if (!found) {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }
  const { record, bytes } = found;

  // Encode the filename per RFC 5987 so non-ASCII names survive transit.
  const encoded = encodeURIComponent(record.filename);

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      // Browser-supplied mime type, served as-is. Hardening (mime-type
      // allowlist + content sniff) lands in a future slice. Until then we
      // pair Content-Disposition: attachment with X-Content-Type-Options:
      // nosniff so cross-origin <script src> can't execute the blob even
      // if a future surface ever embeds the download URL that way.
      "Content-Type": record.mimeType,
      "Content-Length": String(record.sizeBytes),
      "Content-Disposition": `attachment; filename*=UTF-8''${encoded}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
