import type {
  CreateConversationBody,
  CreateConversationResponse,
  CreateMessageResponse,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

export async function createConversation(
  body: CreateConversationBody,
): Promise<CreateConversationResponse> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as CreateConversationResponse;
}

export async function sendChatMessage(
  conversationId: string,
  body: string,
): Promise<CreateMessageResponse> {
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as CreateMessageResponse;
}

export type ChatMediaUpload = {
  kind: "audio" | "video";
  blob: Blob;
  mimeType: string;
  durationMs: number;
  source: "microphone" | "camera" | "screen";
};

const MEDIA_FILE_EXTENSION: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "video/webm": "webm",
  "video/mp4": "mp4",
};

/** Multipart body expected by `POST /conversations/:id/messages`. */
export function buildChatMediaFormData(
  recording: ChatMediaUpload,
  caption?: string,
): FormData {
  const formData = new FormData();
  formData.append("kind", recording.kind);
  formData.append("durationMs", String(recording.durationMs));
  formData.append("source", recording.source);
  const extension = MEDIA_FILE_EXTENSION[recording.mimeType] ?? "webm";
  const file =
    recording.blob.type === recording.mimeType
      ? recording.blob
      : new Blob([recording.blob], { type: recording.mimeType });
  formData.append("file", file, `message.${extension}`);
  const trimmed = caption?.trim();
  if (trimmed) {
    formData.append("body", trimmed);
  }
  return formData;
}

export type SendChatMediaOptions = {
  onProgress?: (percent: number) => void;
};

/** Sends audio/video via multipart (kind, file, durationMs, source, optional body). */
export async function sendChatMediaMessage(
  conversationId: string,
  formData: FormData,
  options?: SendChatMediaOptions,
): Promise<CreateMessageResponse> {
  if (options?.onProgress) {
    return postChatMediaWithProgress(
      conversationId,
      formData,
      options.onProgress,
    );
  }

  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as CreateMessageResponse;
}

function postChatMediaWithProgress(
  conversationId: string,
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<CreateMessageResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `/api/conversations/${encodeURIComponent(conversationId)}/messages`,
    );
    xhr.withCredentials = true;
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) {
        return;
      }
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status < 200 || xhr.status >= 300) {
        try {
          throwFromApiResponse(xhr.status, xhr.responseText);
        } catch (error) {
          reject(error);
        }
        return;
      }
      try {
        onProgress(100);
        resolve(JSON.parse(xhr.responseText) as CreateMessageResponse);
      } catch (error) {
        reject(error);
      }
    };
    xhr.onerror = () => {
      try {
        throwFromApiResponse(0, "");
      } catch (error) {
        reject(error);
      }
    };
    xhr.send(formData);
  });
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/read`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throwFromApiResponse(res.status, text);
  }
}

export async function fetchConversationWsToken(
  conversationId: string,
): Promise<{ token: string; expiresIn: number }> {
  const res = await fetch(
    `/api/conversations/${encodeURIComponent(conversationId)}/ws-token`,
    { credentials: "include", cache: "no-store" },
  );
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as { token: string; expiresIn: number };
}
