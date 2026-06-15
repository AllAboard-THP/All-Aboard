"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import type { PasskeyCredentialSummary } from "@allaboard/types";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";

import {
  ApiRequestError,
  mapApiError,
} from "@/lib/map-api-error";
import {
  addPasskeyToAccount,
  fetchPasskeyCredentials,
  revokePasskeyCredential,
} from "@/lib/passkey-auth";
import { formatDateTime } from "@/lib/format-datetime";
import type { AppLocale } from "@/i18n/routing";

type Props = {
  locale: AppLocale;
};

export function PasskeyManager({ locale }: Props) {
  const queryClient = useQueryClient();
  const t = useTranslations("profile.passkeys");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");

  const credentialsQuery = useQuery({
    queryKey: ["passkey-credentials"],
    queryFn: fetchPasskeyCredentials,
  });

  const addMutation = useMutation({
    mutationFn: addPasskeyToAccount,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["passkey-credentials"] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokePasskeyCredential,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["passkey-credentials"] });
    },
  });

  const mutationError =
    addMutation.error instanceof ApiRequestError
      ? tErrors(
          mapApiError({
            status: addMutation.error.status,
            body: { error: addMutation.error.code },
          }),
        )
      : revokeMutation.error instanceof ApiRequestError
        ? tErrors(
            mapApiError({
              status: revokeMutation.error.status,
              body: { error: revokeMutation.error.code },
            }),
          )
        : addMutation.error instanceof Error &&
            addMutation.error.name !== "NotAllowedError"
          ? t("webauthnFailed")
          : null;

  const items = credentialsQuery.data?.items ?? [];

  return (
    <Card data-testid="passkey-manager">
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {credentialsQuery.isError ? (
          <p className="m-0 text-sm text-destructive" role="alert">
            {t("loadError")}
          </p>
        ) : null}

        {credentialsQuery.isSuccess && items.length === 0 ? (
          <p className="m-0 text-sm text-muted-foreground">{t("empty")}</p>
        ) : null}

        {items.length > 0 ? (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {items.map((item) => (
              <PasskeyCredentialRow
                key={item.id}
                item={item}
                locale={locale}
                onRevoke={() => revokeMutation.mutate(item.id)}
                revoking={
                  revokeMutation.isPending &&
                  revokeMutation.variables === item.id
                }
                revokeDisabled={revokeMutation.isPending || addMutation.isPending}
              />
            ))}
          </ul>
        ) : null}

        {mutationError ? (
          <p className="m-0 text-sm text-destructive" role="alert">
            {mutationError}
          </p>
        ) : null}

        <Button
          type="button"
          variant="outline"
          disabled={
            credentialsQuery.isPending ||
            addMutation.isPending ||
            revokeMutation.isPending
          }
          onClick={() => addMutation.mutate()}
          data-testid="passkey-add-button"
        >
          {addMutation.isPending ? tCommon("sending") : t("addDevice")}
        </Button>
      </CardContent>
    </Card>
  );
}

function PasskeyCredentialRow({
  item,
  locale,
  onRevoke,
  revoking,
  revokeDisabled,
}: {
  item: PasskeyCredentialSummary;
  locale: AppLocale;
  onRevoke: () => void;
  revoking: boolean;
  revokeDisabled: boolean;
}) {
  const t = useTranslations("profile.passkeys");
  const tCommon = useTranslations("common");

  const label =
    item.deviceType === "singleDevice"
      ? t("deviceSingle")
      : item.deviceType === "multiDevice"
        ? t("deviceMulti")
        : t("deviceUnknown");

  return (
    <li
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
      data-testid="passkey-credential-row"
    >
      <div className="min-w-0">
        <p className="m-0 text-sm font-medium text-foreground">{label}</p>
        <p className="m-0 text-xs text-muted-foreground">
          {t("createdAt", {
            date: formatDateTime(item.createdAt, locale),
          })}
          {item.lastUsedAt
            ? ` · ${t("lastUsedAt", {
                date: formatDateTime(item.lastUsedAt, locale),
              })}`
            : null}
          {item.backedUp ? ` · ${t("backedUp")}` : null}
        </p>
      </div>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={revokeDisabled}
        onClick={onRevoke}
      >
        {revoking ? tCommon("updating") : t("revoke")}
      </Button>
    </li>
  );
}
