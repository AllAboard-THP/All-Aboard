"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AuthMeResponse } from "@allaboard/types";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@allaboard/ui/components/button";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ApiRequestError,
  mapApiError,
} from "@/lib/map-api-error";
import { deleteResource } from "@/lib/resource-client";

type Props = {
  resourceId: string;
  authorId: string;
};

async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Auth me ${res.status}`);
  return (await res.json()) as AuthMeResponse;
}

export function ResourceOwnerActions({ resourceId, authorId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("resources");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const isAuthor =
    Boolean(authQuery.data) && authQuery.data!.userId === authorId;
  const isAdmin = authQuery.data?.role === "admin";
  const canManage = isAuthor || isAdmin;

  const deleteMutation = useMutation({
    mutationFn: () => deleteResource(resourceId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resources"] });
      router.push("/resources");
    },
  });

  if (!canManage) {
    return null;
  }

  const deleteError =
    deleteMutation.error instanceof ApiRequestError
      ? tErrors(
          mapApiError({
            status: deleteMutation.error.status,
            body: { error: deleteMutation.error.code },
          }),
        )
      : null;

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="resource-owner-actions"
    >
      <Button variant="outline" size="sm" asChild>
        <Link href={`/resources/${resourceId}/edit`}>{t("editLink")}</Link>
      </Button>
      {!confirmDelete ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={deleteMutation.isPending}
          onClick={() => setConfirmDelete(true)}
          data-testid="resource-delete-button"
        >
          {t("delete")}
        </Button>
      ) : (
        <div
          className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2"
          data-testid="resource-delete-confirm"
        >
          <span className="text-sm text-foreground">{t("deleteConfirm")}</span>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
            data-testid="resource-delete-confirm-button"
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
      {deleteError ? (
        <p className="m-0 w-full text-sm text-destructive">{deleteError}</p>
      ) : null}
    </div>
  );
}
