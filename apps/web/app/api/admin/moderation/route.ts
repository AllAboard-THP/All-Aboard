import { relayAuthenticatedFetch } from "@/lib/bff-relay";

export async function GET() {
  return relayAuthenticatedFetch("/admin/moderation", { cache: "no-store" });
}
