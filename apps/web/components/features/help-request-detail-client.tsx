"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AuthMeResponse,
  CreateResponseResponse,
  HelpRequestDetailResponse,
  Response,
} from "@allaboard/types";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@allaboard/ui/components/alert";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { Label } from "@allaboard/ui/components/label";
import { Textarea } from "@allaboard/ui/components/textarea";
import { Link } from "@/i18n/navigation";
import {
  deleteResponse,
  updateResponse,
} from "@/lib/help-request-client";
import {
  ApiRequestError,
  mapApiError,
  throwFromApiResponse,
} from "@/lib/map-api-error";
type Props = {
  requestId: string;
  initialDetail: HelpRequestDetailResponse;
};

async function fetchAuthMe(): Promise<AuthMeResponse | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Auth me ${res.status}`);
  return (await res.json()) as AuthMeResponse;
}

async function fetchDetail(
  id: string,
  filterByCertifications: boolean,
): Promise<HelpRequestDetailResponse> {
  const qs = filterByCertifications ? "?filterByCertifications=true" : "";
  const res = await fetch(
    `/api/help-requests/${encodeURIComponent(id)}${qs}`,
    { credentials: "include" },
  );
  if (!res.ok) {
    throw new Error(`Detail ${res.status}`);
  }
  return (await res.json()) as HelpRequestDetailResponse;
}

async function createResponse(input: {
  body: string;
  requestId: string;
}): Promise<CreateResponseResponse> {
  const createRes = await fetch(
    `/api/help-requests/${encodeURIComponent(input.requestId)}/responses`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body: input.body }),
    },
  );
  const createText = await createRes.text();
  if (!createRes.ok) {
    throwFromApiResponse(createRes.status, createText);
  }
  return JSON.parse(createText) as CreateResponseResponse;
}

function ResponseItem({
  response,
  requestId,
  currentUserId,
}: {
  response: Response;
  requestId: string;
  currentUserId: string | undefined;
}) {
  const queryClient = useQueryClient();
  const t = useTranslations("helpRequest");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(response.body);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAuthor = Boolean(currentUserId) && currentUserId === response.authorId;

  const updateMutation = useMutation({
    mutationFn: (body: string) =>
      updateResponse(requestId, response.id, { body }),
    onSuccess: async () => {
      setEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["help-request", requestId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteResponse(requestId, response.id),
    onSuccess: async () => {
      setConfirmDelete(false);
      await queryClient.invalidateQueries({ queryKey: ["help-request", requestId] });
    },
  });

  const mutationError =
    updateMutation.error instanceof ApiRequestError
      ? tErrors(
          mapApiError({
            status: updateMutation.error.status,
            body: { error: updateMutation.error.code },
          }),
        )
      : deleteMutation.error instanceof ApiRequestError
        ? tErrors(
            mapApiError({
              status: deleteMutation.error.status,
              body: { error: deleteMutation.error.code },
            }),
          )
        : null;

  if (!isAuthor) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="m-0 text-sm text-foreground">{response.body}</p>
          <p className="mt-2 mb-0 text-xs text-muted-foreground">
            {response.authorId}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="response-item-owned">
      <CardContent className="grid gap-3 pt-6">
        {editing ? (
          <>
            <Label htmlFor={`response-edit-${response.id}`}>
              {t("replyBody")}
            </Label>
            <Textarea
              id={`response-edit-${response.id}`}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={4}
              data-testid="response-edit-textarea"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                disabled={updateMutation.isPending || !editBody.trim()}
                onClick={() => updateMutation.mutate(editBody)}
                data-testid="response-save-button"
              >
                {updateMutation.isPending ? tCommon("sending") : t("responseSave")}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => {
                  setEditing(false);
                  setEditBody(response.body);
                }}
              >
                {t("editCancel")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="m-0 text-sm text-foreground">{response.body}</p>
            <p className="m-0 text-xs text-muted-foreground">
              {response.authorId}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => setEditing(true)}
                data-testid="response-edit-button"
              >
                {t("responseEdit")}
              </Button>
              {!confirmDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => setConfirmDelete(true)}
                  data-testid="response-delete-button"
                >
                  {t("responseDelete")}
                </Button>
              ) : (
                <div
                  className="flex flex-wrap items-center gap-2"
                  data-testid="response-delete-confirm"
                >
                  <span className="text-sm text-foreground">
                    {t("responseDeleteConfirm")}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate()}
                    data-testid="response-delete-confirm-button"
                  >
                    {deleteMutation.isPending
                      ? tCommon("updating")
                      : t("responseDelete")}
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
            </div>
          </>
        )}
        {mutationError ? (
          <p className="m-0 text-sm text-destructive">{mutationError}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function HelpRequestDetailClient({ requestId, initialDetail }: Props) {
  const t = useTranslations("helpRequest");
  const tForm = useTranslations("helpForm");
  const tErrors = useTranslations("errors");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [filterByCertifications, setFilterByCertifications] = useState(false);

  const authQuery = useQuery({
    queryKey: ["auth-me"],
    queryFn: fetchAuthMe,
    staleTime: 60_000,
  });

  const isMentor = authQuery.data?.role === "mentor";
  const isAuthenticated = Boolean(authQuery.data);
  const loginHref = `/login?returnTo=${encodeURIComponent(`/requests/${requestId}`)}`;

  useEffect(() => {
    if (isMentor) {
      setFilterByCertifications(true);
    }
  }, [isMentor]);

  const q = useQuery({
    queryKey: ["help-request", requestId, filterByCertifications],
    queryFn: () => fetchDetail(requestId, filterByCertifications),
    initialData: filterByCertifications ? undefined : initialDetail,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: createResponse,
    onSuccess: async () => {
      setBody("");
      await queryClient.invalidateQueries({ queryKey: ["help-request", requestId] });
    },
  });

  const detail = q.data ?? initialDetail;
  const responses = detail.responses ?? [];
  const hiddenCount =
    detail.certificationFilter &&
    detail.certificationFilter.totalCount > detail.certificationFilter.visibleCount
      ? detail.certificationFilter.totalCount -
        detail.certificationFilter.visibleCount
      : 0;

  function submit() {
    if (!isAuthenticated) return;
    mutation.mutate({ body, requestId });
  }

  const errorMessage =
    mutation.error instanceof ApiRequestError
      ? tErrors(
          mapApiError({
            status: mutation.error.status,
            body: { error: mutation.error.code },
          }),
        )
      : null;

  return (
    <>
      {isMentor ? (
        <div
          className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/30 px-4 py-3"
          data-testid="mentor-cert-filter-panel"
        >
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={filterByCertifications}
              onChange={(e) => setFilterByCertifications(e.target.checked)}
              data-testid="mentor-cert-filter-toggle"
              className="size-4 rounded border-input"
            />
            {t("certFilter")}
          </label>
          {filterByCertifications && hiddenCount > 0 ? (
            <p
              className="m-0 text-sm text-muted-foreground"
              data-testid="mentor-cert-filter-hidden-count"
            >
              {t("certHidden", { count: hiddenCount })}
            </p>
          ) : null}
        </div>
      ) : null}

      {q.isFetching && !q.isPending ? (
        <p
          className="mb-3 text-sm text-muted-foreground"
          data-testid="help-request-refetching"
        >
          {tCommon("updating")}
        </p>
      ) : null}

      <section aria-label={t("responsesSection")} className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          {t("responsesSection")}
        </h2>
        {responses.length === 0 ? (
          <Card data-testid="responses-empty">
            <CardHeader>
              <CardTitle className="text-base">
                {t("responsesEmptyTitle")}
              </CardTitle>
              <CardDescription>
                {t("responsesEmptyDescription")}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul
            className="flex list-none flex-col gap-3 p-0"
            data-testid="responses-list"
          >
            {responses.map((r) => (
              <li key={r.id} data-testid="response-item">
                <ResponseItem
                  response={r}
                  requestId={requestId}
                  currentUserId={authQuery.data?.userId}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label={t("replySection")} className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          {t("replySection")}
        </h2>
        {!isAuthenticated && !authQuery.isPending ? (
          <Alert data-testid="reply-login-required">
            <AlertTitle>{tForm("loginRequiredTitle")}</AlertTitle>
            <AlertDescription>
              {tForm.rich("loginRequiredDescription", {
                link: () => (
                  <Link href={loginHref} className="text-primary underline">
                    {tForm("loginRequiredLink")}
                  </Link>
                ),
              })}
            </AlertDescription>
          </Alert>
        ) : (
          <Card data-testid="response-form">
            <CardContent className="grid gap-4 pt-6">
              <div className="grid gap-2">
                <Label htmlFor="response-body">{t("replyBody")}</Label>
                <Textarea
                  id="response-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                />
              </div>
              {errorMessage ? (
                <p className="m-0 text-sm text-destructive">{errorMessage}</p>
              ) : null}
              <Button
                type="button"
                disabled={mutation.isPending || !body.trim()}
                onClick={() => submit()}
              >
                {mutation.isPending ? tCommon("sending") : t("replySubmit")}
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );
}
