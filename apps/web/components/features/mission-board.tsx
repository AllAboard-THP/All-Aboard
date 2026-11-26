"use client";

import type {
  Mission,
  MissionApplication,
  MyMissionApplicationsResponse,
  MyMissionsResponse,
} from "@allaboard/types";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Alert, AlertDescription } from "@allaboard/ui/components/alert";
import { Badge } from "@allaboard/ui/components/badge";
import { Button } from "@allaboard/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@allaboard/ui/components/card";
import { Input } from "@allaboard/ui/components/input";
import { Textarea } from "@allaboard/ui/components/textarea";

import { Link, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { formatDateTime } from "@/lib/format-datetime";
import { certificationProofUrl } from "@/lib/intuition-proof";
import { ApiRequestError, mapApiError } from "@/lib/map-api-error";
import {
  decideApplication,
  deleteMission,
  updateApplication,
  updateMission,
  validateApplication,
  withdrawMyApplication,
  withdrawValidation,
} from "@/lib/mission-client";

const COMMENT_MAX = 280;

/** One mutation with refresh on success and a translated error. */
function useAction<TArgs extends unknown[]>(fn: (...args: TArgs) => Promise<unknown>) {
  const router = useRouter();
  const tErrors = useTranslations("errors");
  const mutation = useMutation({
    mutationFn: (args: TArgs) => fn(...args),
    onSuccess: () => router.refresh(),
  });
  const error =
    mutation.error instanceof ApiRequestError ?
      tErrors(mapApiError({ status: mutation.error.status, body: { error: mutation.error.code } }))
    : mutation.error ? tErrors("unknown")
    : null;
  return {
    run: (...args: TArgs) => mutation.mutate(args),
    pending: mutation.isPending,
    error,
  };
}

function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert variant="destructive" className="mt-2">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

function ProofLink({ application }: { application: MissionApplication }) {
  const t = useTranslations("missions.board");
  const proof = application.validation?.proof;
  if (!application.validation) return null;
  if (!proof) {
    return <span className="text-xs text-muted-foreground">{t("proofPending")}</span>;
  }
  const url = certificationProofUrl(proof);
  return url ?
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline"
      >
        {t("proofLink")}
      </a>
    : <span className="text-xs text-muted-foreground">{t("proofPublished")}</span>;
}

/** One applicant on the author's board: decide, validate, withdraw a validation. */
function ApplicantRow({
  mission,
  application,
}: {
  mission: Mission;
  application: MissionApplication;
}) {
  const t = useTranslations("missions.board");
  const tMissions = useTranslations("missions");
  const locale = useLocale() as AppLocale;
  const [validating, setValidating] = useState(false);
  const [comment, setComment] = useState("");

  const decide = useAction((decision: "accepted" | "rejected") =>
    decideApplication(mission.id, application.id, { decision }),
  );
  const validate = useAction(() =>
    validateApplication(mission.id, application.id, {
      ...(comment.trim() ? { comment: comment.trim() } : {}),
    }).then(() => {
      setValidating(false);
      setComment("");
    }),
  );
  const unvalidate = useAction(() => withdrawValidation(mission.id, application.id));
  const pending = decide.pending || validate.pending || unvalidate.pending;

  const closed = mission.status === "completed" || mission.status === "cancelled";
  const canValidate =
    application.status === "accepted" &&
    !application.validation &&
    (mission.status !== "cancelled" || Boolean(application.deliverableUrl));

  return (
    <li className="border-l border-border pl-3" data-testid="mission-applicant">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/users/${application.applicant.id}`}
          className="font-medium text-foreground hover:text-primary hover:underline"
        >
          {application.applicant.displayName}
        </Link>
        <Badge variant={application.status === "accepted" ? "default" : "outline"}>
          {tMissions(`applicationStatus.${application.status}`)}
        </Badge>
        {application.validation ?
          <Badge variant="secondary" data-testid="mission-applicant-validated">
            {t("validated")}
          </Badge>
        : null}
        <span className="text-xs text-muted-foreground">
          {formatDateTime(application.createdAt, locale)}
        </span>
      </div>
      <p className="mt-1 mb-0 text-sm whitespace-pre-line text-muted-foreground">
        {application.message}
      </p>
      {application.deliverableUrl ?
        <p className="mt-1 mb-0 text-sm">
          <a
            href={application.deliverableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-primary hover:underline"
          >
            {t("deliverable")}
          </a>
        </p>
      : null}
      {application.validation?.comment ?
        <p className="mt-1 mb-0 text-sm italic text-muted-foreground">
          “{application.validation.comment}”
        </p>
      : null}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {application.status === "pending" && !closed ?
          <Button size="sm" disabled={pending} onClick={() => decide.run("accepted")}>
            {t("accept")}
          </Button>
        : null}
        {(application.status === "pending" || application.status === "accepted") &&
        !application.validation ?
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => decide.run("rejected")}
          >
            {t("reject")}
          </Button>
        : null}
        {application.status === "rejected" && !closed ?
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => decide.run("accepted")}
          >
            {t("accept")}
          </Button>
        : null}
        {canValidate && !validating ?
          <Button
            size="sm"
            disabled={pending}
            onClick={() => setValidating(true)}
            data-testid="mission-validate-open"
          >
            {t("validate")}
          </Button>
        : null}
        {application.validation ?
          <>
            <ProofLink application={application} />
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => unvalidate.run()}
            >
              {t("withdrawValidation")}
            </Button>
          </>
        : null}
      </div>

      {validating ?
        <form
          className="mt-2 flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            validate.run();
          }}
        >
          <Textarea
            rows={2}
            maxLength={COMMENT_MAX}
            value={comment}
            placeholder={t("commentPlaceholder")}
            aria-label={t("commentLabel")}
            onChange={(event) => setComment(event.target.value)}
          />
          <p className="m-0 text-xs text-muted-foreground">{t("validateHint")}</p>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending} data-testid="mission-validate-confirm">
              {t("validateConfirm")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setValidating(false)}
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      : null}

      <ErrorLine message={decide.error ?? validate.error ?? unvalidate.error} />
    </li>
  );
}

function AuthoredMissionCard({
  mission,
  applications,
}: {
  mission: Mission;
  applications: MissionApplication[];
}) {
  const t = useTranslations("missions.board");
  const tMissions = useTranslations("missions");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const setStatus = useAction((status: "completed" | "cancelled") =>
    updateMission(mission.id, { status }),
  );
  const remove = useAction(() => deleteMission(mission.id));
  const closed = mission.status === "completed" || mission.status === "cancelled";
  const hasValidation = applications.some((a) => a.validation);

  return (
    <Card data-testid="mission-board-card">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{tMissions(`kind.${mission.kind}`)}</Badge>
          <Badge variant="outline">{tMissions(`status.${mission.status}`)}</Badge>
          <span className="text-sm text-muted-foreground">
            {tMissions("places", { accepted: mission.acceptedCount, places: mission.places })}
          </span>
        </div>
        <CardTitle className="text-lg">
          <Link href={`/missions/${mission.id}`} className="hover:text-primary hover:underline">
            {mission.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {applications.length === 0 ?
          <p className="m-0 text-sm text-muted-foreground">{t("noApplicants")}</p>
        : <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {applications.map((application) => (
              <ApplicantRow key={application.id} mission={mission} application={application} />
            ))}
          </ul>
        }

        {!closed ?
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/missions/${mission.id}/edit`}>{tMissions("editCta")}</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={setStatus.pending}
              onClick={() => setStatus.run("completed")}
            >
              {t("complete")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={setStatus.pending}
              onClick={() => setStatus.run("cancelled")}
            >
              {t("cancelMission")}
            </Button>
            {!hasValidation ?
              confirmDelete ?
                <>
                  <span className="self-center text-xs text-muted-foreground">
                    {t("deleteConfirm")}
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={remove.pending}
                    onClick={() => remove.run()}
                  >
                    {t("deleteYes")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>
                    {t("cancel")}
                  </Button>
                </>
              : <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
                  {t("delete")}
                </Button>
            : null}
          </div>
        : null}
        <ErrorLine message={setStatus.error ?? remove.error} />
      </CardContent>
    </Card>
  );
}

/** The applicant's side: status, deliverable link once accepted, withdraw. */
function MyApplicationCard({
  mission,
  application,
}: {
  mission: Mission;
  application: MissionApplication;
}) {
  const t = useTranslations("missions.board");
  const tMissions = useTranslations("missions");
  const [deliverable, setDeliverable] = useState(application.deliverableUrl ?? "");
  const save = useAction((url: string | null) =>
    updateApplication(mission.id, application.id, { deliverableUrl: url }),
  );
  const withdraw = useAction(() => withdrawMyApplication(mission.id));
  const canWithdraw =
    !application.validation &&
    (application.status === "pending" || application.status === "accepted");

  return (
    <Card data-testid="my-application-card">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{tMissions(`kind.${mission.kind}`)}</Badge>
          <Badge variant={application.status === "accepted" ? "default" : "outline"}>
            {tMissions(`applicationStatus.${application.status}`)}
          </Badge>
          {application.validation ?
            <Badge variant="secondary">{t("validated")}</Badge>
          : null}
        </div>
        <CardTitle className="text-lg">
          <Link href={`/missions/${mission.id}`} className="hover:text-primary hover:underline">
            {mission.title}
          </Link>
        </CardTitle>
        <CardDescription>
          {t("by", { author: mission.author.displayName })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {application.status === "accepted" && !application.validation ?
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              save.run(deliverable.trim() || null);
            }}
          >
            <Input
              type="url"
              className="min-w-0 flex-1"
              value={deliverable}
              placeholder={t("deliverablePlaceholder")}
              aria-label={t("deliverableLabel")}
              onChange={(event) => setDeliverable(event.target.value)}
            />
            <Button type="submit" size="sm" variant="outline" disabled={save.pending}>
              {t("saveDeliverable")}
            </Button>
          </form>
        : application.deliverableUrl ?
          <a
            href={application.deliverableUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm break-all text-primary hover:underline"
          >
            {t("deliverable")}
          </a>
        : null}
        {application.validation ?
          <div className="flex flex-col gap-1">
            {application.validation.comment ?
              <p className="m-0 text-sm italic text-muted-foreground">
                “{application.validation.comment}”
              </p>
            : null}
            <ProofLink application={application} />
          </div>
        : null}
        {canWithdraw ?
          <div>
            <Button
              size="sm"
              variant="ghost"
              disabled={withdraw.pending}
              onClick={() => withdraw.run()}
            >
              {tMissions("withdrawApplication")}
            </Button>
          </div>
        : null}
        <ErrorLine message={save.error ?? withdraw.error} />
      </CardContent>
    </Card>
  );
}

type Props = {
  authored: MyMissionsResponse["items"] | null;
  applications: MyMissionApplicationsResponse["items"] | null;
  canPost: boolean;
};

export function MissionBoard({ authored, applications, canPost }: Props) {
  const t = useTranslations("missions.board");
  const tMissions = useTranslations("missions");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-3xl font-semibold text-foreground">{t("title")}</h1>
          <p className="mt-2 mb-0 max-w-prose text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/missions">{t("browse")}</Link>
          </Button>
          {canPost ?
            <Button asChild>
              <Link href="/missions/new">{tMissions("newCta")}</Link>
            </Button>
          : null}
        </div>
      </header>

      {canPost || (authored && authored.length > 0) ?
        <section aria-labelledby="board-authored" className="flex flex-col gap-4">
          <h2 id="board-authored" className="m-0 text-xl font-semibold">
            {t("authoredTitle")}
          </h2>
          {authored === null ?
            <ErrorLine message={t("loadError")} />
          : authored.length === 0 ?
            <p className="m-0 text-sm text-muted-foreground">{t("authoredEmpty")}</p>
          : authored.map((entry) => (
              <AuthoredMissionCard
                key={entry.mission.id}
                mission={entry.mission}
                applications={entry.applications}
              />
            ))
          }
        </section>
      : null}

      <section aria-labelledby="board-applications" className="flex flex-col gap-4">
        <h2 id="board-applications" className="m-0 text-xl font-semibold">
          {t("applicationsTitle")}
        </h2>
        {applications === null ?
          <ErrorLine message={t("loadError")} />
        : applications.length === 0 ?
          <p className="m-0 text-sm text-muted-foreground">{t("applicationsEmpty")}</p>
        : applications.map((entry) => (
            <MyApplicationCard
              key={entry.application.id}
              mission={entry.mission}
              application={entry.application}
            />
          ))
        }
      </section>
    </div>
  );
}
