import { Badge } from "@allaboard/ui/components/badge";

type Props = {
  tags: string[];
};

export function FeedItemTags({ tags }: Props) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2" data-testid="feed-item-tags">
      {tags.map((tag, index) => (
        <Badge key={tag} variant={index === 0 ? "secondary" : "outline"}>
          {tag}
        </Badge>
      ))}
    </div>
  );
}
