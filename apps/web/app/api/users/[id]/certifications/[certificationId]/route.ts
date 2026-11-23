import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = {
  params: Promise<{ id: string; certificationId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { id, certificationId } = await context.params;
  return relayAuthenticatedFetch(
    `/users/${encodeURIComponent(id)}/certifications/${encodeURIComponent(certificationId)}`,
    { method: "DELETE" },
  );
}
