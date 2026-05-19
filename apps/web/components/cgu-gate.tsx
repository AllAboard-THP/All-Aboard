"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const STORAGE_KEY = "allaboard-cgu-accepted";

export function CguGate({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY) === "1";
    setOpen(!accepted);
    setHydrated(true);
  }, []);

  const accept = () => {
    if (!checked) return;
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  return (
    <>
      {hydrated ? (
        <span data-testid="cgu-hydrated" className="sr-only" aria-hidden />
      ) : null}
      {children}
      <Dialog open={hydrated && open} onOpenChange={() => {}}>
        <DialogContent
          data-testid="cgu-dialog"
          className="sm:max-w-md"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Conditions générales d&apos;utilisation</DialogTitle>
            <DialogDescription>
              Veuillez lire et accepter les CGU pour continuer sur All-Aboard.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-md border border-border p-3">
            <Checkbox
              id="cgu-accept"
              data-testid="cgu-checkbox"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
            />
            <Label htmlFor="cgu-accept" className="leading-snug">
              J&apos;accepte les conditions générales d&apos;utilisation
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              data-testid="cgu-submit"
              disabled={!checked}
              onClick={accept}
            >
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Réinitialise les CGU (tests E2E uniquement). */
export function resetCguForTests() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
