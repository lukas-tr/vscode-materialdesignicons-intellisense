import * as vscode from "vscode";
import { TreeNode, IIconMeta } from "./types";
import * as path from "path";
import { config } from "./configuration";
import { getMdiMetaData, getIconData, createCompletion } from "./util";

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
    return {
      contextValue:
        element.type === "icon"
          ? "mdiIcon"
          : element.type === "other"
          ? "mdiSearch"
          : "mdiTag",
      label:
        element.type === "other"
          ? element.label
          : element.type === "tag"
          ? element.tag
          : createCompletion(element.meta.name),
      iconPath:
        element.type === "icon" &&
        vscode.Uri.parse(`data:image/svg+xml;utf8,${element.doc.rawIcon}`),
      collapsibleState:
        element.type === "tag" || element.type === "other"
          ? vscode.TreeItemCollapsibleState.Collapsed
          : undefined,
      command:
        element.type === "tag"
          ? undefined
          : element.type === "other"
          ? element.command
          : {
              command: "materialdesigniconsIntellisense.openIconPreview",
              arguments: [element],
              title: "Open icon preview",
            },
    };
  }

  public getChildren(element?: TreeNode): TreeNode[] | Thenable<TreeNode[]> {
    return getMdiMetaData().then((d) => {
      if (element) {
        let filtered: IIconMeta[] = [];
        if (element.type === "tag") {
          filtered = [...d].filter(
            (a) =>
              (a.tags.length === 0 && element.tag === "Other") ||
              a.tags.indexOf(element.tag) !== -1
          );
        }
        if (element.type === "other") {
          const tokens = config.lastSearch
            .split(/(\s|-)/)
            .map((s) => s.trim())
            .filter((s) => s);
          filtered = [...d].filter((a) => {
            let matches = false;
            tokens.forEach((token) => {
              [a.name, ...a.aliases].forEach((t) => {
                if (t.includes(token)) {
                  matches = true;
                }
              });
            });
            return matches;
          });
          if (!filtered.length) {
            vscode.window.showWarningMessage(
              `No icons found matching "${config.lastSearch}""`
            );
          }
        }
        const children = filtered.map(
          async (child): Promise<TreeNode> => ({
            type: "icon",
            meta: child,
            doc: await getIconData(child),
          })
        );
        return Promise.all(children).then((c) => {
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
      const tags = d.reduce<{
        [idx: string]: true | undefined;
      }>((prev, cur) => (cur.tags.forEach((t) => (prev[t] = true)), prev), {
        Other: true,
      });
      const children = Object.keys(tags)
        .map((tag): TreeNode => ({ type: "tag", tag }))
        .sort(
          (a, b) =>
            (a.type === "tag" &&
              b.type === "tag" &&
              a.tag.localeCompare(b.tag)) ||
            0
        );
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
