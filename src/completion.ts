import * as vscode from "vscode";

import { matcherStringToRegex, createCompletion } from "./util";
import { Configuration } from "./Configuration";
import { IconManager } from "./IconManager";
import { Icon } from "./Icon";

export interface IIconCompletionItem extends vscode.CompletionItem {
  _icon: Icon;
}

export const triggerCharacters = [":", "-", "i", "'", '"', "."];

export class CompletionProvider implements vscode.CompletionItemProvider {
  constructor(private config: Configuration, private manager: IconManager) {}

  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ) {
    let linePrefix = document
      .lineAt(position)
      .text.substr(0, position.character);

    for (const matcher of this.config.matchers) {
      const regex = matcherStringToRegex(matcher.match);
      if (!regex) continue;
      const match = linePrefix.match(regex.suggestionPrefixAndIconRegex);
      if (!match || !match.groups) {
        continue;
      }
      const meta = await this.manager.getIconList();
      const range = new vscode.Range(
        position.line,
        position.character - match.groups.icon.length,
        position.line,
        position.character
      );

      const edits: vscode.TextEdit[] = [];
      if (matcher.insertPrefix) {
        edits.push(
          vscode.TextEdit.insert(
            position.translate(0, -match.length - 1),
            matcher.insertPrefix
          )
        );
      }

      const items = meta.flatMap((icon) =>
        (this.config.includeAliases ? icon.aliases : [icon.name]).map(
          (name): IIconCompletionItem => ({
            _icon: icon,

            label: createCompletion(name, regex.type),
            kind: vscode.CompletionItemKind.Text,
            sortText: name,
            range,
            insertText: `${createCompletion(icon.name, regex.type)}${
              matcher.insertSuffix || ""
            }`,
            additionalTextEdits: edits,
          })
        )
      );

      return {
        incomplete: true,
        items,
      };
    }

    return [];
  }

  resolveCompletionItem(
    item: IIconCompletionItem
  ): vscode.ProviderResult<vscode.CompletionItem> {
    return {
      ...item,
      documentation: item._icon.getMarkdownPreviewIcon(
        this.config.iconColor,
        this.config.iconSize
      ).appendMarkdown(`
- link: ${item._icon.docLink.value}
- aliases: ${item._icon.aliases.join(", ")}
- codepoint: ${item._icon.codepoint}
- author: ${item._icon.author}
- version: ${item._icon.version}`),
      detail: item._icon.tags.join(", "),
    };
  }
}
