"use client";

import { LocaleSwitcher } from "@/components/features/locale-switcher";

/**
 * Floating locale switcher for public pages — does not modify landing chrome layout.
 */
export function PublicLocaleFab() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-[4.75rem] z-[60] flex justify-end px-4 sm:top-[5.25rem] sm:px-6"
      aria-hidden={false}
    >
      <div className="pointer-events-auto rounded-xl border border-white/10 bg-background/80 p-1 shadow-lg backdrop-blur-md">
        <LocaleSwitcher />
      </div>
    </div>
  );
}
