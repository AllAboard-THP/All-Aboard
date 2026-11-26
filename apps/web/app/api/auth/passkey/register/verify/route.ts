import { relayPostJsonWithCookies } from "@/lib/bff-relay";

export async function POST(request: Request) {
  const body = await request.text();
  return relayPostJsonWithCookies("/auth/passkey/register/verify", body);
}
