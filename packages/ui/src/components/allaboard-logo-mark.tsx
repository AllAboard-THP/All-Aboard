import { cn } from "@allaboard/ui/lib/utils";

/** Vector trace of logo-mark.png — keep in sync with scripts/branding/export-logo-mark-svg.py */
const LOGO_NAVY = "#052775";
const LOGO_MAGENTA = "#dd3465";

export function AllAboardLogoMark({
  className,
  title = "AllAboard",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={41}
      height={54}
      viewBox="0 0 41 54"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("block shrink-0", className)}
    >
      <polygon points="22,13 22,44 10,44" fill={LOGO_NAVY} />
      <polygon points="25,13 25,44 35,44" fill={LOGO_MAGENTA} />
      <path
        d="M9 45 L17 45 L17 46 L21 46 L30 46 L29 47 L16 47 Z M22 45 L23 45 L21 46 Z"
        fill={LOGO_NAVY}
      />
    </svg>
  );
}
