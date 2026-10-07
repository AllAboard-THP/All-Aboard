import type {
  DeleteAvatarResponse,
  UploadAvatarResponse,
} from "@allaboard/types";

export type UploadAvatarResult =
  | { ok: true; avatarUrl: string }
  | { ok: false; code: string };

export async function uploadAvatar(file: Blob): Promise<UploadAvatarResult> {
  const formData = new FormData();
  formData.append("file", file, "avatar.jpg");

  const res = await fetch("/api/users/me/avatar", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string;
    } | null;
    return { ok: false, code: body?.error ?? "upload_failed" };
  }

  const data = (await res.json()) as UploadAvatarResponse;
  return { ok: true, avatarUrl: data.avatarUrl };
}

export async function deleteAvatar(): Promise<boolean> {
  const res = await fetch("/api/users/me/avatar", {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    return false;
  }

  const data = (await res.json()) as DeleteAvatarResponse;
  return data.ok === true;
}
