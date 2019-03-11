import * as vscode from "vscode";
import { getMdiMetaData, getIconData, pascalCaseToKebabCase } from "./util";

export class HoverProvider implements vscode.HoverProvider {
  async provideHover(document: vscode.TextDocument, position: vscode.Position) {
    const regex = /mdi((\w+)|-((\w|\-)+))/i;
    const range = document.getWordRangeAtPosition(position, regex);
    if (!range) {
      return null;
    }
    const text = document.getText(range);

    const match = regex.exec(text);
    if (!match) {
      return null;
    }
    const iconName = match[3] || pascalCaseToKebabCase(match[2]);

    const meta = await getMdiMetaData();

    for (const item of meta) {
      const isIcon = iconName === item.name;
      if (isIcon) {
        const meta = await getIconData(item);
        const hover: vscode.Hover = {
          range,
          contents: [
            meta.icon,
            meta.tags,
            `aliases: ${meta.aliases}`,
            meta.link
          ]
        };
        return hover;
      }
    }
    const hover: vscode.Hover = {
      range,
      contents: [`no preview available for mdi-${iconName}`]
    };
    return hover;
  }
}
