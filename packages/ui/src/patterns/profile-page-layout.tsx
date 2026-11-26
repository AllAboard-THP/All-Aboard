"use client";

import type { ReactNode } from "react";

import { cn } from "../lib/utils";

export function ProfilePageLayout({
  eyebrow,
  header,
  stats,
  identity,
  about,
  sidebar,
  activity,
  className,
}: {
  eyebrow?: ReactNode;
  header: ReactNode;
  stats: ReactNode;
  identity?: ReactNode;
  about: ReactNode;
  sidebar: ReactNode;
  activity: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-5xl animate-fade-in space-y-6 px-4 py-6 sm:px-0",
        className,
      )}
    >
      {eyebrow ? (
        <div className="m-0 text-xs font-bold tracking-widest text-primary uppercase">
          {eyebrow}
        </div>
      ) : null}

      {header}
      {stats}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {about}
          {identity ?? null}
        </div>
        <div className="space-y-6">{sidebar}</div>
      </div>

      {activity}
    </div>
  );
}
