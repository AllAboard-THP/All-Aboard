"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 6) {
      setError("Email requis et mot de passe d'au moins 6 caractères.");
      return;
    }
    setError(null);
    setDone(true);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <Card data-testid="auth-register-card">
        <CardHeader>
          <CardTitle>Inscription</CardTitle>
          <CardDescription>Créer un compte (démo locale).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Mot de passe</Label>
              <Input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" data-testid="auth-error" role="alert">
                {error}
              </p>
            ) : null}
            {done ? (
              <p className="text-sm text-emerald-300" data-testid="auth-register-done">
                Compte enregistré (démo).{" "}
                <Link href="/login" className="underline">
                  Se connecter
                </Link>
              </p>
            ) : (
              <Button type="submit" className="w-full">
                Créer le compte
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
