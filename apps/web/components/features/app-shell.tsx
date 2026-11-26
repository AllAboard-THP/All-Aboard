import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import type { AuthMeResponse } from "@allaboard/types";

import { AppShellAuthActions } from "@/components/features/app-shell-auth-actions";
import { AppShellLayout } from "@/components/features/app-shell-layout";
import { AppShellUserMenu } from "@/components/features/app-shell-user-menu";
import { CguGate } from "@/components/features/cgu-gate";
import { LocaleSwitcher } from "@/components/features/locale-switcher";
import { fetchAuthMe } from "@/lib/api-server";
import { fetchSidebarBadgeCounts } from "@/lib/fetch-sidebar-badges";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const t = await getTranslations("studentDashboard");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  let requiresCguAcceptance = false;
  let currentUser: Pick<AuthMeResponse, "userId" | "role"> & {
    displayName: string;
    avatarUrl?: string;
  } | null = null;
  let isMentor = false;
  let isAdmin = false;
  let sidebarBadges = { messageCount: 0, feedCount: 0, dashboardCount: 0 };

  if (token) {
    const meResult = await fetchAuthMe(token);
    if (meResult.ok) {
      if (!meResult.data.cguAcceptedAt) {
        requiresCguAcceptance = true;
      }
      currentUser = {
        userId: meResult.data.userId,
        displayName:
          meResult.data.fullName?.trim() ||
          meResult.data.displayName?.trim() ||
          meResult.data.userId,
        avatarUrl: meResult.data.avatarUrl,
        role: meResult.data.role,
      };
      isMentor = meResult.data.role === "mentor" || meResult.data.role === "admin";
      isAdmin = meResult.data.role === "admin";
      sidebarBadges = await fetchSidebarBadgeCounts(token);
    }
  }

  const headerEnd = (
    <>
      <LocaleSwitcher />
      {currentUser ? (
        <AppShellUserMenu
          userId={currentUser.userId}
          displayName={currentUser.displayName}
          avatarUrl={currentUser.avatarUrl}
          role={currentUser.role}
        />
      ) : (
        <AppShellAuthActions />
      )}
    </>
  );

  return (
    <>
      <AppShellLayout
        brandName={t("brandName")}
        year={new Date().getFullYear()}
        headerEnd={headerEnd}
        sidebarBadges={sidebarBadges}
        isMentor={isMentor}
        isAdmin={isAdmin}
      >
        {children}
      </AppShellLayout>
      {requiresCguAcceptance ? <CguGate /> : null}
    </>
  );
}
