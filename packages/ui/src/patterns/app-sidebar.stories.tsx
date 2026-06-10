import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";

import { AppSidebar } from "./app-sidebar";
import { AppSidebarProvider, useAppSidebar } from "./app-sidebar-provider";
import {
  APP_SIDEBAR_ACTIVE_ID_PATH,
  buildAppSidebarSections,
  resolveAppSidebarContext,
  type AppSidebarNavId,
} from "./app-sidebar-nav";
import { buildAppSidebarLabelMapFromDashboardLabels } from "./app-chrome-sidebar";
import { studentDashboardLabelsFr } from "./student-dashboard-labels";
import { legacyDemoToast } from "./legacy-story-feedback";
import { patternStoryParameters } from "./pattern-story-frame";

const labelMap = buildAppSidebarLabelMapFromDashboardLabels(studentDashboardLabelsFr);

function SidebarDemoInner({
  activeId = "feed",
  expanded = true,
  messageCount = 0,
  showMentorDot = false,
  isAdmin = false,
}: {
  activeId?: AppSidebarNavId;
  expanded?: boolean;
  messageCount?: number;
  showMentorDot?: boolean;
  isAdmin?: boolean;
}) {
  const { setExpanded } = useAppSidebar();
  const pathname = APP_SIDEBAR_ACTIVE_ID_PATH[activeId ?? "feed"];
  const resolved = resolveAppSidebarContext(pathname, { isAdmin, labelMap });
  const sections = buildAppSidebarSections(labelMap, {
    activeId: resolved.activeId,
    showAdminSection: resolved.showAdminSection,
  });

  useEffect(() => {
    setExpanded(expanded);
  }, [expanded, setExpanded]);

  return (
    <div className="app-stage relative flex min-h-[32rem] md:min-h-[40rem]">
      <AppSidebar
          labels={{
            navigationGroup: labelMap.navigationGroup,
            communityGroup: labelMap.communityGroup,
            adminGroup: labelMap.adminGroup,
            expandSidebar: labelMap.expandSidebar,
            collapseSidebar: labelMap.collapseSidebar,
          }}
          sections={sections}
          context={resolved.context}
          activeId={resolved.activeId}
          openSectionIds={resolved.openSectionIds}
          badges={messageCount > 0 ? { messages: messageCount } : undefined}
          mentorDot={showMentorDot}
          onItemClick={(id) => legacyDemoToast(id)}
          className="!flex"
      />
    </div>
  );
}

function SidebarDemo(props: Parameters<typeof SidebarDemoInner>[0]) {
  return (
    <AppSidebarProvider>
      <SidebarDemoInner {...props} />
    </AppSidebarProvider>
  );
}

const meta = {
  title: "Patterns/AppSidebar",
  component: SidebarDemo,
  parameters: patternStoryParameters,
  args: {
    activeId: "feed",
    expanded: true,
    messageCount: 0,
    showMentorDot: false,
    isAdmin: false,
  },
  argTypes: {
    activeId: {
      control: "select",
      options: [
        "dashboard",
        "subjects",
        "resources",
        "events",
        "feed",
        "messages",
        "mentor",
        "profile",
        "admin",
      ],
    },
  },
} satisfies Meta<typeof SidebarDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ExpandedFeed: Story = {
  args: { activeId: "feed", expanded: true },
};

export const CollapsedRail: Story = {
  args: { activeId: "feed", expanded: false },
};

export const MessagesWithBadge: Story = {
  args: { activeId: "messages", messageCount: 3 },
};

export const MentorWithDot: Story = {
  args: { activeId: "mentor", showMentorDot: true },
};

export const AdminSection: Story = {
  args: { activeId: "admin", isAdmin: true },
};

export const DashboardContext: Story = {
  args: { activeId: "dashboard" },
};
