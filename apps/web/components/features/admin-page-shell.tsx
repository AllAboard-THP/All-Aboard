import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  testId?: string;
};

export function AdminPageShell({ children, testId }: Props) {
  return (
    <div
      className="mx-auto w-full max-w-5xl p-4 sm:p-6"
      data-testid={testId}
    >
      {children}
    </div>
  );
}
