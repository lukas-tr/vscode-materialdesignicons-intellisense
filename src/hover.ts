import * as vscode from "vscode";

import { getMdiMetaData, getIconData, getMatchAtPosition } from "./util";

export class HoverProvider implements vscode.HoverProvider {
  async provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const result = getMatchAtPosition(document, position);
    if (!result) {
      return;
    }

    const meta = await getMdiMetaData();
    for (const item of meta) {
      const isIcon = result.iconName === item.name;
      if (isIcon) {
        const meta = await getIconData(item);
        const hover: vscode.Hover = {
          range: result.range,
          contents: [
            meta.icon,
            meta.tags,
            `aliases: ${meta.aliases}`,
            meta.link,
          ],
        };
        return hover;
      }
    }
    const hover: vscode.Hover = {
      range: result.range,
      contents: [`no preview available for mdi-${result.iconName}`],
    };
    return hover;
  }
}
