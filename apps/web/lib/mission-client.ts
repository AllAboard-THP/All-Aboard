/**
 * Browser calls to the missions BFF (`/api/missions/*`, #193).
 * Errors throw {@link ApiRequestError} so forms can map them to `errors.*`.
 */
import type {
  CreateMissionApplicationBody,
  CreateMissionBody,
  MissionApplicationDecisionBody,
  MissionApplicationResponse,
  MissionResponse,
  UpdateMissionApplicationBody,
  UpdateMissionBody,
  ValidateMissionApplicationBody,
} from "@allaboard/types";

import { throwFromApiResponse } from "@/lib/map-api-error";

function missionPath(id: string): string {
  return `/api/missions/${encodeURIComponent(id)}`;
}

function applicationPath(missionId: string, applicationId: string): string {
  return `${missionPath(missionId)}/applications/${encodeURIComponent(applicationId)}`;
}

async function sendJson<T>(
  url: string,
  method: "POST" | "PATCH",
  body: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throwFromApiResponse(res.status, text);
  }
  return JSON.parse(text) as T;
}

async function sendDelete(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE", credentials: "include" });
  if (!res.ok) {
    throwFromApiResponse(res.status, await res.text());
  }
}

export function createMission(body: CreateMissionBody): Promise<MissionResponse> {
  return sendJson("/api/missions", "POST", body);
}

export function updateMission(
  id: string,
  body: UpdateMissionBody,
): Promise<MissionResponse> {
  return sendJson(missionPath(id), "PATCH", body);
}

export function deleteMission(id: string): Promise<void> {
  return sendDelete(missionPath(id));
}

export function applyToMission(
  missionId: string,
  body: CreateMissionApplicationBody,
): Promise<MissionApplicationResponse> {
  return sendJson(`${missionPath(missionId)}/applications`, "POST", body);
}

export function withdrawMyApplication(missionId: string): Promise<void> {
  return sendDelete(`${missionPath(missionId)}/applications/mine`);
}

export function decideApplication(
  missionId: string,
  applicationId: string,
  body: MissionApplicationDecisionBody,
): Promise<MissionApplicationResponse> {
  return sendJson(`${applicationPath(missionId, applicationId)}/decision`, "POST", body);
}

export function updateApplication(
  missionId: string,
  applicationId: string,
  body: UpdateMissionApplicationBody,
): Promise<MissionApplicationResponse> {
  return sendJson(applicationPath(missionId, applicationId), "PATCH", body);
}

export function validateApplication(
  missionId: string,
  applicationId: string,
  body: ValidateMissionApplicationBody,
): Promise<MissionApplicationResponse> {
  return sendJson(`${applicationPath(missionId, applicationId)}/validate`, "POST", body);
}

export function withdrawValidation(
  missionId: string,
  applicationId: string,
): Promise<void> {
  return sendDelete(`${applicationPath(missionId, applicationId)}/validation`);
}
