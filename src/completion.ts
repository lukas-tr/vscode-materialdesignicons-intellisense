import * as vscode from "vscode";
import { getMdiMetaData, getIconData, createCompletion } from "./util";
import { IIconCompletionItem, CompletionType } from "./types";
import { config } from "./configuration";

export class CompletionProvider implements vscode.CompletionItemProvider {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    let linePrefix = document
      .lineAt(position)
      .text.substr(0, position.character);
    const match = linePrefix.match(/mdi(-)?(:)?([-\w]+?)?$/);
    if (!match) {
      return [];
    }

    const completionType = match[1]
      ? CompletionType.kebabCase
      : match[2]
      ? CompletionType.homeAssistant
      : CompletionType.camelCase;

    const meta = await getMdiMetaData();

    const range = new vscode.Range(
      position.line,
      position.character - match[0].length,
      position.line,
      position.character
    );

    return {
      incomplete: true,
      items: meta.reduce<IIconCompletionItem[]>(
        (prev, cur) =>
          prev.concat(
            [cur.name, ...(config.includeAliases ? cur.aliases : [])].map(
              (name): IIconCompletionItem => ({
                label: createCompletion(name, completionType),
                kind: vscode.CompletionItemKind.Text,
                sortText: name,
                meta: cur,
                completionType,
                range,
              })
            )
          ),
        []
      ),
    };
  }

  resolveCompletionItem(
    item: IIconCompletionItem,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.CompletionItem> {
    return getIconData(item.meta).then((data) => {
      return {
        ...item,
        documentation: data.icon.appendMarkdown(`
- link: ${data.link.value}
- aliases: ${data.aliases}
- codepoint: ${data.codepoint}
- author: ${data.author}
- version: ${data.version}`),
        detail: data.tags,
        insertText: `${config.prefix}${createCompletion(
          item.meta.name,
          item.completionType
        )}${config.suffix}`,
      };
    });
  }
}
