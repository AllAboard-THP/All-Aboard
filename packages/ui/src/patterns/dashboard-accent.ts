import type { CSSProperties } from "react";

import type {
  DashboardActivityKind,
  DashboardShortcutId,
  DashboardTodoKind,
} from "./fixtures/student-dashboard";

/** Subject-tag tint — same contract as `SubjectTag` / `PostCard` / `SubjectCard`. */
export function accentSurfaceStyle(accentColor: string): CSSProperties {
  return {
    color: accentColor,
    borderColor: `${accentColor}33`,
    backgroundColor: `${accentColor}18`,
  };
}

/** Icon tile fill — same as `SubjectCard` icon wrapper. */
export function accentIconSurfaceStyle(accentColor: string): CSSProperties {
  return {
    color: accentColor,
    backgroundColor: `${accentColor}1F`,
    boxShadow: `inset 0 0 0 1px ${accentColor}33`,
  };
}

export const DASHBOARD_TODO_ACCENT: Record<DashboardTodoKind, string> = {
  helpRequest: "#a78bfa",
  message: "#22d3ee",
  resource: "#4ade80",
};

export const DASHBOARD_ACTIVITY_ACCENT: Record<DashboardActivityKind, string> = {
  reply: "#facc15",
  resource: "#60a5fa",
  event: "#ec4899",
};

export const DASHBOARD_SHORTCUT_ACCENT: Record<DashboardShortcutId, string> = {
  subjects: "#6366f1",
  resources: "#a78bfa",
  events: "#f472b6",
  profile: "#22d3ee",
};
