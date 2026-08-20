"use client";

import { useQuery } from "@tanstack/react-query";

export type AuthRole = "student" | "mentor" | "admin";

type AuthMeResponse = {
  role: AuthRole;
};

async function fetchAuthRole(): Promise<AuthRole> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) {
    return "student";
  }

  const data = (await res.json()) as AuthMeResponse;
  if (data.role === "mentor" || data.role === "admin") {
    return data.role;
  }

  return "student";
}

/** Session role for role-gated sidebar sections (mentor / admin). */
export function useAuthRole() {
  const query = useQuery({
    queryKey: ["auth", "me", "role"],
    queryFn: fetchAuthRole,
    staleTime: 60_000,
    retry: false,
  });

  const role = query.data ?? "student";

  return {
    role,
    isMentor: role === "mentor" || role === "admin",
    isAdmin: role === "admin",
    isLoading: query.isLoading,
  };
}
