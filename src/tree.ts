import * as vscode from "vscode";
import { TreeNode, IIconMeta, ITagNode } from "./types";
import * as path from "path";
import { config } from "./configuration";
import { getMdiMetaData, getIconData, createCompletion } from "./util";

// import Fuse from "fuse.js" doesn't work because of default import, even with allowSyntheticDefaultImports
import * as __fuse from "fuse.js";
import _fuse from "fuse.js";
const Fuse: typeof _fuse = __fuse as any;

export class IconTreeDataProvider
  implements
    vscode.TreeDataProvider<TreeNode>,
    vscode.TextDocumentContentProvider {
  private _onDidChangeTreeData: vscode.EventEmitter<
    any
  > = new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData
    .event;

  public refresh() {
    this._onDidChangeTreeData.fire();
  }

  public getTreeItem(element: TreeNode): vscode.TreeItem {
    switch (element.type) {
      case "icon":
        let tooltip = `Aliases: ${element.doc.aliases}\nTags: ${element.doc.tags}`;
        if (element.search && element.search.score) {
          tooltip += `\n\nMatch score: ${Math.floor(
            (1 - element.search.score) * 100
          )}%\nMatches: ${element.search.matches}`;
        }
        return {
          contextValue: "mdiIcon",
          label: createCompletion(element.meta.name),
          description: element.search ? element.doc.tags : undefined,

          iconPath: vscode.Uri.parse(
            `data:image/svg+xml;utf8,${element.doc.rawIcon}`
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
          description: config.lastSearch,

          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
          command: element.command,
        };
    }
  }

  public getChildren(element?: TreeNode): TreeNode[] | Thenable<TreeNode[]> {
    return getMdiMetaData().then((d) => {
      if (element) {
        let filtered: IIconMeta[] = [];
        let children: Promise<TreeNode>[] = [];
        if (element.type === "tag") {
          filtered = [...d].filter(
            (a) =>
              (a.tags.length === 0 && element.tag === "Other") ||
              a.tags.indexOf(element.tag) !== -1
          );
          children = filtered.map(
            async (child): Promise<TreeNode> => ({
              type: "icon",
              meta: child,
              doc: await getIconData(child),
            })
          );
        }
        if (element.type === "other") {
          const fuse = new Fuse(d, {
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
          const result = fuse.search(config.lastSearch);
          filtered = result.map<IIconMeta>((r) => r.item);
          if (!filtered.length) {
            vscode.window.showWarningMessage(
              `No icons found matching "${config.lastSearch}"`
            );
          }

          children = result.map(
            async (child): Promise<TreeNode> => ({
              type: "icon",
              meta: child.item,
              doc: await getIconData(child.item),
              search: {
                score: child.score,
                matches: child.matches?.map((m) => m.value || ""),
              },
            })
          );
        }
        return Promise.all(children).then((c) => {
          if (element.type === "other") {
            // dont sort fuse output
            return c;
          }
          c.sort(
            (a, b) =>
              (a.type === "icon" &&
                b.type === "icon" &&
                a.meta.name.localeCompare(b.meta.name)) ||
              0
          );
          return c;
        });
      }

      // root
      const tags: { [idx: string]: number | undefined } = {};
      for (const icon of d) {
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
      if (config.lastSearch) {
        children.unshift(searchResult);
      }
      return children;
    });
  }

  public getParent(element: TreeNode): TreeNode | null {
    return element.type === "tag" || element.type === "other"
      ? null
      : {
          type: "tag",
          tag: element.meta.tags[0] || "Other",
        };
    // const parent = element.resource.with ({   path:
    // dirname(element.resource.path) }) ; return parent.path !== '//'   ? {
    // resource: parent,     isDirectory: true   }   : null;
  }

  public provideTextDocumentContent(
    uri: vscode.Uri,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<string> {
    return Promise.resolve("text");
  }
}
