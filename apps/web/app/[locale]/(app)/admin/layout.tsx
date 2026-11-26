import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";

import { AdminAccessDenied } from "@/components/features/admin-access-denied";
import { AdminSubNav } from "@/components/features/admin-sub-nav";
import { requireAdminSession } from "@/lib/require-admin-session";

export const dynamic = "force-dynamic";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await requireAdminSession();
  if (!session.ok) {
    return <AdminAccessDenied reason={session.reason} />;
  }

  return (
    <div className="relative min-h-[60vh] w-full">
      <AdminSubNav />
      {children}
    </div>
  );
}
