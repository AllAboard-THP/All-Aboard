"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email et mot de passe sont requis.");
      return;
    }
    setError(null);
    setSession(`demo:${email.trim()}`);
    document.cookie = `allaboard-session=demo; path=/; SameSite=Lax`;
    toast.success("Connexion réussie (démo)");
    router.push("/");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <Card data-testid="auth-login-card">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Parcours auth MVP (sans backend métier — voir plan Web/API).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? (
              <p
                className="text-sm text-destructive"
                data-testid="auth-error"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {session ? (
              <p
                className="text-sm text-emerald-300"
                data-testid="auth-session"
              >
                Connecté ({session})
              </p>
            ) : null}
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Pas de compte ?{" "}
            <Link href="/register" className="text-primary hover:underline">
              S&apos;inscrire
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
