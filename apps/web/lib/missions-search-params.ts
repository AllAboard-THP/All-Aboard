import type { MissionKind } from "@allaboard/types";

export const MISSION_KINDS: MissionKind[] = ["personal_project", "freelance", "hackathon"];

export type MissionsPageParams = {
  kind?: MissionKind;
  /** `completed` shows finished missions; default is open and in progress. */
  status?: "completed";
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseMissionsSearchParams(
  raw: Record<string, string | string[] | undefined>,
): MissionsPageParams {
  const kind = first(raw.kind);
  const status = first(raw.status);
  return {
    ...(MISSION_KINDS.includes(kind as MissionKind) ? { kind: kind as MissionKind } : {}),
    ...(status === "completed" ? { status: "completed" as const } : {}),
  };
}

/** Upstream query string for `GET /missions`, with a leading `?` when not empty. */
export function buildMissionsQuery(params: MissionsPageParams): string {
  const qs = new URLSearchParams();
  if (params.kind) qs.set("kind", params.kind);
  if (params.status) qs.set("status", params.status);
  const out = qs.toString();
  return out ? `?${out}` : "";
}

export function missionsHref(params: MissionsPageParams): string {
  return `/missions${buildMissionsQuery(params)}`;
}
