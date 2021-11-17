import * as vscode from "vscode";
import { Configuration } from "./Configuration";
import { IconManager } from "./IconManager";

import { getMatchAtPosition } from "./util";

export class HoverProvider implements vscode.HoverProvider {
  constructor(private config: Configuration, private manager: IconManager) {}

  async provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const result = getMatchAtPosition(document, position, this.config.matchers);
    if (!result) {
      return;
    }

    const icon = await this.manager.getIcon(result.iconName);

    if (!icon) {
      const hover: vscode.Hover = {
        range: result.range,
        contents: [`no preview available for mdi-${result.iconName}`],
      };
      return hover;
    }

    const hover: vscode.Hover = {
      range: result.range,
      contents: [
        icon.getMarkdownPreviewIcon(
          this.config.iconColor,
          this.config.iconSize
        ),
        icon.tags.join(", "),
        `aliases: ${icon.aliases.join(", ")}`,
        icon.docLink,
      ],
    };
    return hover;
  }
}
