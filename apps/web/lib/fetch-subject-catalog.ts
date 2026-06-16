import type { SubjectsResponse } from "@allaboard/types";
import type { ProfileSubjectCatalogItem } from "@allaboard/ui/patterns/profile-types";

export async function fetchSubjectCatalog(): Promise<ProfileSubjectCatalogItem[]> {
  const res = await fetch("/api/subjects", { cache: "no-store" });
  if (!res.ok) {
    throw new Error("subjects_failed");
  }
  const data = (await res.json()) as SubjectsResponse;
  return data.items.map((item) => ({
    id: item.id,
    name: item.name,
    accentColor: item.accentColor,
  }));
}
