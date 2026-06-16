import { Link } from "@/i18n/navigation";

export function resolveAuthorProfileHref(
  authorId: string,
  authorProfileId?: string,
): string {
  const profileId = authorProfileId ?? authorId;
  return `/users/${encodeURIComponent(profileId)}`;
}

export function AuthorProfileLink({
  authorId,
  authorProfileId,
  children,
  className,
}: {
  authorId: string;
  authorProfileId?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={resolveAuthorProfileHref(authorId, authorProfileId)}
      className={className ?? "text-foreground hover:text-primary hover:underline"}
    >
      {children}
    </Link>
  );
}
