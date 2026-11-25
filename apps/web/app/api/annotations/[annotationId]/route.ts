import { relayAuthenticatedFetch } from "@/lib/bff-relay";

type RouteContext = { params: Promise<{ annotationId: string }> };

async function annotationPath(context: RouteContext): Promise<string> {
  const { annotationId } = await context.params;
  return `/annotations/${encodeURIComponent(annotationId)}`;
}

/** #197 — edit (author) or resolve / reopen (either participant). */
export async function PATCH(request: Request, context: RouteContext) {
  const body = await request.text();
  return relayAuthenticatedFetch(await annotationPath(context), {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: body.trim().length > 0 ? body : "{}",
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return relayAuthenticatedFetch(await annotationPath(context), {
    method: "DELETE",
  });
}
