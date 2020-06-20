import * as vscode from "vscode";

import {
  getMdiMetaData,
  getIconData,
  matcherStringToRegex,
  createCompletion,
} from "./util";
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

    for (const matcher of config.matchers) {
      const regex = matcherStringToRegex(matcher.match);
      if (!regex) continue;
      const match = linePrefix.match(regex.suggestionPrefixAndIconRegex);
      if (!match || !match.groups) {
        continue;
      }
      const meta = await getMdiMetaData();
      const range = new vscode.Range(
        position.line,
        position.character - match.groups.icon.length,
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
                  label: createCompletion(name, regex.type),
                  kind: vscode.CompletionItemKind.Text,
                  sortText: name,
                  meta: cur,
                  range,
                  insertText: createCompletion(cur.name, regex.type),
                })
              )
            ),
          []
        ),
      };
    }

    return [];
  }

  resolveCompletionItem(
    item: IIconCompletionItem
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
      };
    });
  }
}
