"use client";

import { cn } from "../lib/utils";

type LegalCguButtonProps = {
  label: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

/** CGU text link — primary violet, aligned with auth inline links. */
export function LegalCguButton({
  label,
  onClick,
  className,
}: LegalCguButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-sm font-medium text-primary transition-colors hover:underline",
        className,
      )}
    >
      {label}
    </button>
  );
}
