/** Public URL prefix for stored message media files (no trailing slash). */
export function getMessageMediaPublicBaseUrl(): string {
  const configured = process.env.MESSAGE_MEDIA_PUBLIC_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  const port = process.env.PORT ?? 4000;
  return `http://127.0.0.1:${port}/uploads/messages`;
}

export function buildMessageMediaPublicUrl(attachmentKey: string): string {
  const normalizedKey = attachmentKey.replace(/^\/+/, "");
  return `${getMessageMediaPublicBaseUrl()}/${normalizedKey}`;
}
