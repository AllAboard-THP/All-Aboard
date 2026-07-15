export type SaveMessageMediaParams = {
  conversationId: string;
  messageId: string;
  buffer: Buffer;
  mimeType: string;
};

export interface MediaStorageProvider {
  save(params: SaveMessageMediaParams): Promise<string>;
  delete(key: string): Promise<void>;
}
