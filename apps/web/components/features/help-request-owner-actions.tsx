"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthMeResponse, HelpRequestStatus } from "@allaboard/types";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@allaboard/ui/components/badge";
import { Button } from "@allaboard/ui/components/button";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ApiRequestError,
  mapApiError,
} from "@/lib/map-api-error";
import {
  deleteHelpRequest,
  requestMentorHelp,
  updateHelpRequest,
} from "@/lib/help-request-client";

type Props = {
  requestId: string;
  authorId: string;
  status?: HelpRequestStatus;
  mentorHelpRequested?: boolean;
};

async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Auth me ${res.status}`);
  return (await res.json()) as AuthMeResponse;
}

export function HelpRequestOwnerActions({
  requestId,
  authorId,
  status = "open",
  mentorHelpRequested = false,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("helpRequest");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mentorRequested, setMentorRequested] = useState(mentorHelpRequested);

  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const isAuthor =
    Boolean(authQuery.data) && authQuery.data!.userId === authorId;
  const isResolved = status === "resolved";

  const deleteMutation = useMutation({
    mutationFn: () => deleteHelpRequest(requestId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.push("/");
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () => updateHelpRequest(requestId, { status: "resolved" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["feed"] });
      await queryClient.invalidateQueries({ queryKey: ["help-request", requestId] });
      await queryClient.invalidateQueries({
        queryKey: ["help-request-ai-summary", requestId],
      });
      router.refresh();
    },
  });

  const mentorMutation = useMutation({
    mutationFn: () => requestMentorHelp(requestId),
    onSuccess: async () => {
      setMentorRequested(true);
      await queryClient.invalidateQueries({ queryKey: ["help-request", requestId] });
    },
  });

  if (!isAuthor) {
    return null;
  }

  const mutationError =
    deleteMutation.error instanceof ApiRequestError
      ? tErrors(
          mapApiError({
            status: deleteMutation.error.status,
            body: { error: deleteMutation.error.code },
          }),
        )
      : resolveMutation.error instanceof ApiRequestError
        ? tErrors(
            mapApiError({
              status: resolveMutation.error.status,
              body: { error: resolveMutation.error.code },
            }),
          )
        : mentorMutation.error instanceof ApiRequestError
          ? tErrors(
              mapApiError({
                status: mentorMutation.error.status,
                body: { error: mentorMutation.error.code },
              }),
            )
          : null;

  return (
    <div
      className="mb-6 flex flex-wrap items-center gap-2"
      data-testid="help-request-owner-actions"
    >
      {!isResolved ? (
        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={resolveMutation.isPending}
          onClick={() => resolveMutation.mutate()}
          data-testid="help-request-resolve-button"
        >
          {resolveMutation.isPending ? tCommon("updating") : t("markResolved")}
        </Button>
      ) : (
        <Badge variant="secondary" data-testid="help-request-resolved-badge">
          {t("statusResolved")}
        </Badge>
      )}

      {!mentorRequested ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={mentorMutation.isPending || isResolved}
          onClick={() => mentorMutation.mutate()}
          data-testid="help-request-mentor-button"
        >
          {mentorMutation.isPending ? tCommon("sending") : t("requestMentor")}
        </Button>
      ) : (
        <Badge variant="outline" data-testid="help-request-mentor-requested-badge">
          {t("mentorRequested")}
        </Badge>
      )}

      <Button variant="outline" size="sm" asChild>
        <Link href={`/requests/${requestId}/edit`}>{t("editLink")}</Link>
      </Button>
      {!confirmDelete ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={deleteMutation.isPending}
          onClick={() => setConfirmDelete(true)}
          data-testid="help-request-delete-button"
        >
          {t("delete")}
        </Button>
      ) : (
        <div
          className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2"
          data-testid="help-request-delete-confirm"
        >
          <span className="text-sm text-foreground">{t("deleteConfirm")}</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            data-testid="help-request-delete-confirm-button"
          >
            {deleteMutation.isPending ? tCommon("updating") : t("delete")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => setConfirmDelete(false)}
          >
            {t("editCancel")}
          </Button>
        </div>
      )}
      {mutationError ? (
        <p className="m-0 w-full text-sm text-destructive">{mutationError}</p>
      ) : null}
    </div>
  );
}
