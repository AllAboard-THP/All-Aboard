import type { Meta, StoryObj } from "@storybook/react";

import {
  usePostCardFixture,
  usePostCardLabels,
} from "../i18n/storybook-locale";
import {
  patternStoryParameters,
  withPatternStoryFrame,
} from "./pattern-story-frame";
import {
  PostCard,
  PostCardActionsMenu,
  PostCardCodeBlock,
} from "./post-card";

const javascriptIcon = (
  <span
    className="inline-block size-2.5 rounded-sm bg-yellow-400"
    aria-hidden
  />
);

function LegacyPostCardStory(props: {
  liked?: boolean;
  bookmarked?: boolean;
  canDelete?: boolean;
}) {
  const labels = usePostCardLabels();
  const fixture = usePostCardFixture();

  return (
    <PostCard
      authorName={fixture.authorName}
      authorInitials={fixture.authorInitials}
      postedAt={fixture.postedAt}
      educationLevel={fixture.educationLevel}
      title={fixture.title}
      body={fixture.body}
      subject={{
        name: fixture.subjectName,
        accentColor: "#EAB308",
        icon: javascriptIcon,
      }}
      hashtags={fixture.hashtags}
      urgent
      code={{
        language: "javascript",
        snippet: `useEffect(() => {
  fetchData();
}, [data]); ${fixture.codeComment}`,
      }}
      likesCount={3}
      commentsCount={3}
      showActionsMenu
      canEdit
      labels={labels}
      {...props}
    />
  );
}

const meta = {
  title: "Patterns/PostCard",
  parameters: patternStoryParameters,
  decorators: [withPatternStoryFrame()],
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <LegacyPostCardStory />,
};

export const LikedAndBookmarked: Story = {
  render: () => <LegacyPostCardStory liked bookmarked />,
};

export const OwnerWithDelete: Story = {
  render: () => <LegacyPostCardStory canDelete />,
};

function ActionsMenuStory() {
  const labels = usePostCardLabels();

  return (
    <div className="flex justify-center rounded-2xl border border-white/10 bg-card/40 p-8">
      <PostCardActionsMenu canEdit canDelete labels={labels} />
    </div>
  );
}

function CodeBlockStory() {
  const labels = usePostCardLabels();
  const fixture = usePostCardFixture();

  return (
    <div className="w-full max-w-2xl">
      <PostCardCodeBlock
        language="javascript"
        copyLabel={labels.copy}
        snippet={`useEffect(() => {
  fetchData();
}, [data]); ${fixture.codeComment}`}
      />
    </div>
  );
}

export const ActionsMenu: Story = {
  name: "PostCardActionsMenu",
  render: () => <ActionsMenuStory />,
};

function ActionsMenuAdminStory() {
  const labels = usePostCardLabels();
  return (
    <div className="flex justify-center rounded-2xl border border-white/10 bg-card/40 p-8">
      <PostCardActionsMenu canEdit canDelete labels={labels} />
    </div>
  );
}

export const ActionsMenuAdmin: Story = {
  name: "PostCardActionsMenu/AdminDelete",
  render: () => <ActionsMenuAdminStory />,
};

export const CodeBlock: Story = {
  render: () => <CodeBlockStory />,
};
