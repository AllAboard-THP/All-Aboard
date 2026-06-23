import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Feed route — content only; stage bg lives on `AppShell` (`AppAbstractBackground`). */
export default function FeedLayout({ children }: Props) {
  return <div className="relative min-h-[60vh]">{children}</div>;
}
