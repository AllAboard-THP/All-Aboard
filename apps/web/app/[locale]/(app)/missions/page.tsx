import { cookies } from "next/headers";

import { MissionsListContent } from "@/components/features/missions-list-content";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { fetchAuthMe, fetchMissions } from "@/lib/api-server";
import {
  buildMissionsQuery,
  parseMissionsSearchParams,
} from "@/lib/missions-search-params";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MissionsPage({ searchParams }: Props) {
  const params = parseMissionsSearchParams(await searchParams);
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    const locale = await getLocale();
    redirect({ href: "/login?returnTo=%2Fmissions", locale });
  }

  const [result, me] = await Promise.all([
    fetchMissions(token!, buildMissionsQuery(params)),
    fetchAuthMe(token!),
  ]);

  return (
    <MissionsListContent
      items={result.ok ? result.data.items : []}
      error={result.ok ? null : result.error}
      params={params}
      canPost={me.ok && me.data.role === "mentor"}
    />
  );
}
