import type { ReactNode } from "react";

import { FeedConceptBackground } from "@allaboard/ui/patterns/feed-concept-background";

type Props = {
  children: ReactNode;
};

/** Feed route — illustrated tri-band stage (concept-feed-three-column-morning-illustrated). */
export default function FeedLayout({ children }: Props) {
  return (
    <div className="relative min-h-[60vh]">
      <FeedConceptBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
