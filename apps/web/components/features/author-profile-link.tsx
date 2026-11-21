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

/** Name to show for an author: display name when known, else the raw `authorId`. */
export function authorDisplayLabel(item: {
  authorId: string;
  authorDisplayName?: string;
}): string {
  return item.authorDisplayName?.trim() || item.authorId;
}

/**
 * Author name, linked to the public profile when the author is a registered
 * user (`authorProfileId` set). Otherwise plain text: no link to a missing page.
 */
export function AuthorName({
  item,
  className,
}: {
  item: { authorId: string; authorProfileId?: string; authorDisplayName?: string };
  className?: string;
}) {
  const label = authorDisplayLabel(item);
  if (!item.authorProfileId) {
    return <span className={className}>{label}</span>;
  }
  return (
    <AuthorProfileLink
      authorId={item.authorId}
      authorProfileId={item.authorProfileId}
      className={className}
    >
      {label}
    </AuthorProfileLink>
  );
}
