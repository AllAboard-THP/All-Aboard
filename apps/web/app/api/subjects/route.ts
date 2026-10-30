import { relayPublicGet } from "@/lib/bff-relay";

export async function GET(request: Request) {
  return relayPublicGet(request, "/subjects");
}
