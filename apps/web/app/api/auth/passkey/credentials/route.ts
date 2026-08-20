import { relayAuthenticatedFetch } from "@/lib/bff-relay";

export async function GET() {
  return relayAuthenticatedFetch("/auth/passkey/credentials", {
    cache: "no-store",
  });
}
