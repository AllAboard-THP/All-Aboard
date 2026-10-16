export type SaveMessageMediaParams = {
  conversationId: string;
  messageId: string;
  buffer: Buffer;
  mimeType: string;
};

export interface MediaStorageProvider {
  /** Stores the object and returns the attachment key (without storage prefix). */
  save(params: SaveMessageMediaParams): Promise<string>;
  delete(key: string): Promise<void>;
  /** Playback URL: local public path, S3 public URL, or a presigned GET. */
  resolveUrl(attachmentKey: string): Promise<string>;
}
