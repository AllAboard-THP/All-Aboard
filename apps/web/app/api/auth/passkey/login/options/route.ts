import { relayPostJson } from "@/lib/bff-relay";

export async function POST(request: Request) {
  const body = await request.text();
  return relayPostJson("/auth/passkey/login/options", body);
}
