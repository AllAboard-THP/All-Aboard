"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@allaboard/ui/components/button";

import { useRouter } from "@/i18n/navigation";
import { createConversation } from "@/lib/chat-client";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";

type Props = {
  recipientId: string;
  recipientName: string;
  helpRequestId?: string;
};

export function StartConversationButton({
  recipientId,
  recipientName,
  helpRequestId,
}: Props) {
  const t = useTranslations("messages");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createConversation({
        recipientId,
        helpRequestId,
      }),
    onSuccess: (data) => {
      setErrorKey(null);
      router.push(`/messages/${data.item.id}`);
    },
    onError: (err: unknown) => {
      const key =
        err instanceof ApiRequestError ?
          mapApiError({ status: err.status, body: { error: err.code } })
        : "unknown";
      setErrorKey(key);
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        size="sm"
        disabled={mutation.isPending}
        data-testid="start-conversation-button"
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ?
          t("startPending")
        : t("startWith", { name: recipientName })}
      </Button>
      {errorKey ?
        <p className="m-0 text-sm text-destructive" role="alert">
          {tErrors(errorKey)}
        </p>
      : null}
    </div>
  );
}
