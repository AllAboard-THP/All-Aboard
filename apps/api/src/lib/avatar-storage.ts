import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

export function getAvatarStorageDir(): string {
  const configured = process.env.AVATAR_STORAGE_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(apiRoot, configured);
  }
  return path.join(apiRoot, "data", "uploads", "avatars");
}

type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
};

function headerValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Public URL prefix for stored avatar files (no trailing slash). */
export function resolveAvatarPublicBaseUrl(request: RequestLike): string {
  const configured = process.env.AVATAR_PUBLIC_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  const host =
    headerValue(request.headers.host) ??
    `127.0.0.1:${process.env.PORT ?? 4000}`;
  const proto = headerValue(request.headers["x-forwarded-proto"]) ?? "http";
  return `${proto}://${host}/uploads/avatars`;
}

export function avatarFileName(userId: string): string {
  return `${userId}.webp`;
}

export function avatarFilePath(userId: string): string {
  return path.join(getAvatarStorageDir(), avatarFileName(userId));
}

export function buildAvatarPublicUrl(
  baseUrl: string,
  userId: string,
  updatedAt?: Date | string,
): string {
  const url = `${baseUrl.replace(/\/$/, "")}/${avatarFileName(userId)}`;
  if (!updatedAt) {
    return url;
  }
  const version =
    typeof updatedAt === "string"
      ? Date.parse(updatedAt)
      : updatedAt.getTime();
  return `${url}?v=${version}`;
}

export function isManagedAvatarUrl(
  avatarUrl: string | null | undefined,
  publicBaseUrl: string,
): boolean {
  if (!avatarUrl) {
    return false;
  }
  const prefix = `${publicBaseUrl.replace(/\/$/, "")}/`;
  return avatarUrl.startsWith(prefix);
}

export async function ensureAvatarStorageDir(): Promise<void> {
  await fs.mkdir(getAvatarStorageDir(), { recursive: true });
}

export async function deleteAvatarFileIfExists(userId: string): Promise<void> {
  try {
    await fs.unlink(avatarFilePath(userId));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
