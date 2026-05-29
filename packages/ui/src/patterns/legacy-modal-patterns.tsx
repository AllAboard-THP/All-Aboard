"use client";

import { useState } from "react";
import { GraduationCap, Info } from "lucide-react";

import { Button } from "../components/button";
import { Checkbox } from "../components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/dialog";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Textarea } from "../components/textarea";
import {
  legacyLabelsFr,
  type LegacyLabels,
} from "../i18n/legacy-labels";
import { cn } from "@allaboard/ui/lib/utils";

type ModalShellProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
};

function LegacyDialogShell({
  open,
  defaultOpen = true,
  onOpenChange,
  children,
  className,
}: ModalShellProps) {
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "glass max-w-lg rounded-2xl border-white/10 bg-background/95 p-6 sm:max-w-lg",
          className,
        )}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function CreatePostModal({
  open,
  defaultOpen = true,
  onOpenChange,
  labels = legacyLabelsFr,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: LegacyLabels;
}) {
  const copy = labels.modals.createPost;

  return (
    <LegacyDialogShell
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <DialogHeader className="gap-1 text-left">
        <DialogTitle className="text-xl">{copy.title}</DialogTitle>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="create-post-title">{copy.requestTitle}</Label>
          <Input
            id="create-post-title"
            placeholder={copy.requestTitle}
            className="rounded-xl border-white/10 bg-white/5"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="create-post-subject">{copy.subject}</Label>
          <Input
            id="create-post-subject"
            placeholder={copy.subjectPlaceholder}
            className="rounded-xl border-white/10 bg-white/5"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="create-post-body">{copy.body}</Label>
          <Textarea
            id="create-post-body"
            rows={4}
            placeholder={copy.bodyPlaceholder}
            className="resize-none rounded-xl border-white/10 bg-white/5"
          />
        </div>
      </div>

      <DialogFooter className="pt-2 sm:justify-stretch">
        <Button className="w-full rounded-xl">{copy.submit}</Button>
      </DialogFooter>
    </LegacyDialogShell>
  );
}

export function SubjectRequestModal({
  open,
  defaultOpen = true,
  onOpenChange,
  labels = legacyLabelsFr,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  labels?: LegacyLabels;
}) {
  const copy = labels.modals.subjectRequest;

  return (
    <LegacyDialogShell
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <DialogHeader className="gap-1 text-left">
        <DialogTitle className="text-xl">{copy.title}</DialogTitle>
        <DialogDescription>{copy.subtitle}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="subject-request-name">{copy.nameLabel}</Label>
          <Input
            id="subject-request-name"
            placeholder={copy.namePlaceholder}
            className="rounded-xl border-white/10 bg-white/5"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="subject-request-why">{copy.whyLabel}</Label>
          <Textarea
            id="subject-request-why"
            rows={3}
            placeholder={copy.whyPlaceholder}
            className="resize-none rounded-xl border-white/10 bg-white/5 text-sm"
          />
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/10 p-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{copy.info}</span>
        </div>
      </div>

      <DialogFooter className="gap-3 pt-2 sm:justify-stretch">
        <Button variant="outline" className="flex-1 rounded-xl border-white/20">
          {copy.cancel}
        </Button>
        <Button className="flex-1 rounded-xl">{copy.submit}</Button>
      </DialogFooter>
    </LegacyDialogShell>
  );
}

export function CguAcceptanceModal({
  open,
  defaultOpen = true,
  onOpenChange,
  accepted = false,
  labels = legacyLabelsFr,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  accepted?: boolean;
  labels?: LegacyLabels;
}) {
  const copy = labels.modals.cgu;
  const [checked, setChecked] = useState(accepted);
  const canSubmit = accepted || checked;

  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="glass max-w-lg rounded-2xl border-primary/20 bg-background/95 p-8 shadow-2xl sm:max-w-lg"
      >
        <DialogHeader className="gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <GraduationCap className="size-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl">{copy.welcome}</DialogTitle>
              <DialogDescription>{copy.subtitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-muted-foreground">
          {copy.body}
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => setChecked(value === true)}
            className="mt-1"
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            {copy.checkbox}
          </span>
        </label>

        <Button
          type="button"
          disabled={!canSubmit}
          className={cn(
            "w-full rounded-xl",
            !canSubmit && "cursor-not-allowed opacity-50",
          )}
        >
          {copy.submit}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
