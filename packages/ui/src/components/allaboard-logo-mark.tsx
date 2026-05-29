"use client";

import { useId } from "react";

import { cn } from "@allaboard/ui/lib/utils";

export function AllAboardLogoMark({
  className,
  title = "AllAboard",
}: {
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const gradId = `allaboard-logo-grad-${id}`;
  const grad2Id = `allaboard-logo-grad2-${id}`;

  return (
    <svg
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("size-10 shrink-0", className)}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id={grad2Id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#ec4899" stopOpacity={0.9} />
        </linearGradient>
      </defs>

      <polygon points="160,320 200,100 280,320" fill={`url(#${gradId})`} />
      <polygon points="240,320 310,130 390,320" fill={`url(#${grad2Id})`} />
      <rect x="175" y="245" width="90" height="14" rx="7" fill={`url(#${gradId})`} />
      <rect x="258" y="260" width="100" height="14" rx="7" fill={`url(#${grad2Id})`} />
      <rect x="246" y="95" width="12" height="230" rx="6" fill={`url(#${gradId})`} />
      <path
        d="M100,355 Q256,400 412,355 L400,380 Q256,430 112,380 Z"
        fill={`url(#${gradId})`}
      />
      <ellipse cx="256" cy="420" rx="160" ry="10" fill="#6366f1" opacity={0.2} />
    </svg>
  );
}
