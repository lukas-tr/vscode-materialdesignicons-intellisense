import * as vscode from "vscode";

import { getMdiMetaData, getIconData, getMatchAtPosition } from "./util";

export class HoverProvider implements vscode.HoverProvider {
  async provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const result = getMatchAtPosition(document, position);
    if (!result) {
      return;
    }

    const meta = await getMdiMetaData();
    const icon = meta.find(i => result.iconName === i.name)

    if (!icon) {
      const hover: vscode.Hover = {
        range: result.range,
        contents: [`no preview available for mdi-${result.iconName}`],
      };
      return hover;
    }

    const iconData = await getIconData(icon);
    const hover: vscode.Hover = {
      range: result.range,
      contents: [
        iconData.icon,
        iconData.tags,
        `aliases: ${iconData.aliases}`,
        iconData.link,
      ],
    };
    return hover;
  }
}
