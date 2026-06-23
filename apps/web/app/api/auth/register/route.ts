import { postJsonWithCookies } from "@/lib/bff-upstream";

export async function POST(request: Request) {
  const body = await request.text();
  return postJsonWithCookies("/auth/register", body);
}
