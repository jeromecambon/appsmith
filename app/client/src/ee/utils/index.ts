export * from "ce/utils";
import type { MenuItemProps } from "design-system-old";

export const openInNewTab = (url: string) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

export const addItemsInContextMenu = (
  args: boolean[],
  history: any,
  workspaceId: string,
  moreActionItems: MenuItemProps[],
) => {
  const updatedActionItems = moreActionItems;
  if (args.every(Boolean)) {
    updatedActionItems.push({
      onSelect: () =>
        history.push(`/workspace/${workspaceId}/settings/members`),
      children: "Members",
      key: "members",
      startIcon: "member",
      "data-testid": "t--app-members",
    });
  }
  return updatedActionItems;
};
