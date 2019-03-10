import * as vscode from "vscode";
import { getMdiMetaData, getIconData } from "./util";
import { IIconCompletionItem } from "./types";
import { config } from "./configuration";

export class CompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    let linePrefix = document
      .lineAt(position)
      .text.substr(0, position.character);
    if (!linePrefix.endsWith("mdi-")) {
      return [];
    }

    const meta = await getMdiMetaData();
    return [...meta].reduce<IIconCompletionItem[]>(
      (prev, cur) =>
        prev.concat(
          [cur.name, ...(config.includeAliases ? cur.aliases : [])].map(
            name => ({
              label: `mdi-${name}`,
              kind: vscode.CompletionItemKind.Text,
              sortText: name,
              meta: cur
            })
          )
        ),
      []
    );
  }

  resolveCompletionItem(
    item: IIconCompletionItem,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CompletionItem> {
    return getIconData(item.meta).then(data => {
      return {
        ...item,
        documentation: data.icon.appendMarkdown(`
- link: ${data.link.value}
- aliases: ${data.aliases}
- codepoint: ${data.codepoint}
- author: ${data.author}
- version: ${data.version}`),
        detail: data.tags,
        insertText: `${config.prefix}${item.meta.name}${config.suffix}`
      };
    });
  }
}
