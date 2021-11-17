import * as vscode from "vscode";
import * as __fuse from "fuse.js";
import _fuse from "fuse.js";

import { CompletionType } from "./types";
import { createCompletion } from "./util";
import { Configuration } from "./Configuration";
import { IconManager } from "./IconManager";
import { Icon } from "./Icon";

// `import Fuse from "fuse.js";` doesn't work, even with allowSyntheticDefaultImports
const Fuse: typeof _fuse = __fuse as any;

export class IconTreeDataProvider
  implements
    vscode.TreeDataProvider<TreeNode>,
    vscode.TextDocumentContentProvider
{
  private _onDidChangeTreeData: vscode.EventEmitter<any> =
    new vscode.EventEmitter<any>();

  constructor(private config: Configuration, private manager: IconManager) {}

  readonly onDidChangeTreeData: vscode.Event<any> =
    this._onDidChangeTreeData.event;

  private getChildrenCalled = 0;

  public refresh() {
    this._onDidChangeTreeData.fire(null);
  }

  public getTreeItem(element: TreeNode): vscode.TreeItem {
    switch (element.type) {
      case "icon":
        let tooltip = `Aliases: ${element.icon.aliases.join(
          ", "
        )}\nTags: ${element.icon.tags.join(", ")}`;
        if (element.search && element.search.score) {
          tooltip += `\n\nMatch score: ${Math.floor(
            (1 - element.search.score) * 100
          )}%\nMatches: ${element.search.matches}`;
        }
        return {
          contextValue: "mdiIcon",
          label: createCompletion(element.icon.name, CompletionType.no),
          description: element.search
            ? element.icon.tags.join(", ")
            : undefined,
          iconPath: vscode.Uri.parse(
            `data:image/svg+xml;utf8,${element.icon.getRawSvgIcon(
              this.config.iconColor
            )}`
          ),
          command: {
            command: "materialdesigniconsIntellisense.openIconPreview",
            arguments: [element],
            title: "Open icon preview",
          },
          tooltip,
        };
      case "tag":
        return {
          contextValue: "mdiTag",
          label: element.tag,
          description: `${element.childCount} icons`,
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        };
      default:
        // search
        return {
          contextValue: "mdiSearch",
          label: element.label,
          description: this.config.lastSearch,
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
          command: element.command,
        };
    }
  }

  public async getChildren(element?: TreeNode): Promise<TreeNode[]> {
    const list = await this.manager.getIconList();
    if (element) {
      let filtered: Icon[] = [];
      let children: TreeNode[] = [];
      if (element.type === "tag") {
        filtered = [...list].filter(
          (a) =>
            (a.tags.length === 0 && element.tag === "Other") ||
            a.tags.indexOf(element.tag) !== -1
        );
        children = filtered.map<TreeNode>((child) => ({
          type: "icon",
          icon: child,
        }));
      }
      if (element.type === "other") {
        const fuse = new Fuse(list, {
          isCaseSensitive: false,
          shouldSort: true,
          includeMatches: true,
          includeScore: true,
          threshold: 0.3,
          location: 0,
          distance: 10000, // https://fusejs.io/concepts/scoring-theory.html#distance-threshold-and-location
          keys: [
            { name: "name", weight: 0.9 },
            { name: "aliases", weight: 0.6 },
            { name: "tags", weight: 0.3 },
            { name: "codepoint", weight: 0.2 },
          ],
          // useExtendedSearch: true, // https://fusejs.io/examples.html#extended-search
        });
        const result = fuse.search(this.config.lastSearch);
        filtered = result.map<Icon>((r) => r.item);
        if (!filtered.length) {
          vscode.window.showWarningMessage(
            `No icons found matching "${this.config.lastSearch}"`
          );
        }

        children = result.map<TreeNode>((child) => ({
          type: "icon",
          icon: child.item,
          search: {
            score: child.score,
            matches: child.matches?.map((m) => m.value || ""),
          },
        }));
      }
        if (element.type === "other") {
          // dont sort fuse output
          return children;
        }
        children.sort(
          (a, b) =>
            (a.type === "icon" &&
              b.type === "icon" &&
              a.icon.name.localeCompare(b.icon.name)) ||
            0
        );
        return children;
    }

    // root
    const tags: { [idx: string]: number | undefined } = {};
    for (const icon of list) {
      if (icon.tags.length) {
        for (const tag of icon.tags) {
          if (tags[tag]) {
            tags[tag]!++;
          } else {
            tags[tag] = 1;
          }
        }
      } else {
        // use tag `Other` if icon has no tags
        if (!tags["Other"]) {
          tags["Other"] = 0;
        }
        tags["Other"]!++;
      }
    }
    const children: TreeNode[] = Object.entries(tags)
      .map(
        (tag): ITagNode => ({ type: "tag", tag: tag[0], childCount: tag[1] })
      )
      .sort((a, b) => a.tag.localeCompare(b.tag));
    const searchResult: TreeNode = {
      type: "other",
      label: "Search results",
    };
    if (this.config.lastSearch) {
      children.unshift(searchResult);
    }
    if (!this.getChildrenCalled) {
      // the view doesn't seem to update the first time `getChildren` gets called; might be a bug in vscode or a change in the api
      this.refresh();
    }
    this.getChildrenCalled++;
    return children;
  }

  public getParent(element: TreeNode): TreeNode | null {
    return element.type === "tag" || element.type === "other"
      ? null
      : {
          type: "tag",
          tag: element.icon.tags[0],
        };
  }

  public provideTextDocumentContent(
    uri: vscode.Uri,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<string> {
    return Promise.resolve("text");
  }
}

export interface IIconNode {
  type: "icon";
  icon: Icon;
  search?: {
    score?: number;
    matches?: string[];
  };
}

export interface ITagNode {
  type: "tag";
  tag: string;
  childCount?: number;
}

export interface ISearchNode {
  type: "other";
  label: string;
  command?: vscode.Command;
}

export type TreeNode = IIconNode | ITagNode | ISearchNode;
