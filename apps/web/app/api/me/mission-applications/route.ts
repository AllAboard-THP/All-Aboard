import { relayAuthenticatedFetch } from "@/lib/bff-relay";

export async function GET() {
  return relayAuthenticatedFetch("/me/mission-applications", { method: "GET" });
}
