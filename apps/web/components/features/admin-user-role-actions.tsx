"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { UserRole } from "@allaboard/types";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";

import { useRouter } from "@/i18n/navigation";
import { promoteAdminUser, toggleMentorUser } from "@/lib/admin-client";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";

type Props = {
  userId: string;
  role: UserRole;
};

export function AdminUserRoleActions({ userId, role }: Props) {
  const router = useRouter();
  const t = useTranslations("admin.users");
  const tErrors = useTranslations("errors");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const adminMutation = useMutation({
    mutationFn: (admin: boolean) => promoteAdminUser(userId, admin),
    onSuccess: () => {
      setErrorKey(null);
      router.refresh();
    },
    onError: (err: unknown) => {
      const key =
        err instanceof ApiRequestError ?
          mapApiError({ status: err.status, body: { error: err.code } })
        : "unknown";
      setErrorKey(key);
    },
  });

  const mentorMutation = useMutation({
    mutationFn: () => toggleMentorUser(userId),
    onSuccess: () => {
      setErrorKey(null);
      router.refresh();
    },
    onError: (err: unknown) => {
      const key =
        err instanceof ApiRequestError ?
          mapApiError({ status: err.status, body: { error: err.code } })
        : "unknown";
      setErrorKey(key);
    },
  });

  const pending = adminMutation.isPending || mentorMutation.isPending;
  const isAdmin = role === "admin";
  const isMentor = role === "mentor";

  function handleAdminToggle() {
    const message = isAdmin ? t("demoteAdminConfirm") : t("promoteAdminConfirm");
    if (!window.confirm(message)) return;
    adminMutation.mutate(!isAdmin);
  }

  return (
    <div className="flex flex-col gap-2">
      {errorKey ? (
        <Alert variant="destructive" data-testid="admin-user-action-error">
          <AlertTitle>{t("actionErrorTitle")}</AlertTitle>
          <AlertDescription>{tErrors(errorKey)}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-auto justify-start px-0 text-xs"
          disabled={pending}
          data-testid={`admin-user-admin-toggle-${userId}`}
          onClick={handleAdminToggle}
        >
          {pending ? t("actionPending") : isAdmin ? t("demoteAdmin") : t("promoteAdmin")}
        </Button>
        {!isAdmin ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-auto justify-start px-0 text-xs"
            disabled={pending}
            data-testid={`admin-user-mentor-toggle-${userId}`}
            onClick={() => mentorMutation.mutate()}
          >
            {isMentor ? t("demoteMentor") : t("promoteMentor")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
