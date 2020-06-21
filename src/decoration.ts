import * as vscode from "vscode";
import {
  matcherStringToRegex,
  getMdiMetaData,
  getIconData,
  createDecorationSvg,
  extractPathFromSvg,
} from "./util";
import { paramCase } from "change-case";
import { config } from "./configuration";

export const registerDecoration = () => {
  const subscriptions: vscode.Disposable[] = [];
  let timeout: NodeJS.Timer | undefined = undefined;
  let activeEditor = vscode.window.activeTextEditor;

  const iconDecoration = vscode.window.createTextEditorDecorationType({
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
    before: {
      margin: "0 .1em .1em 0",
      width: "1.1em",
    },
  });

  async function updateDecorations() {
    if (!activeEditor) {
      return;
    }
    if (!config.enableDecorations) {
      activeEditor.setDecorations(iconDecoration, []); // clear existing decorations
      return;
    }

    const decorationsArr: vscode.DecorationOptions[] = []; // TODO: type
    for (const matcher of config.matchers) {
      const regex = matcherStringToRegex(matcher.match);
      if (!regex) continue;
      const regEx = regex.fullRegex;
      const text = activeEditor.document.getText();
      let match: RegExpExecArray;
      while ((match = regEx.exec(text)!)) {
        const meta = await getMdiMetaData();
        const paramItemName = paramCase(match?.groups?.icon || "");
        const item = meta.find((i) => paramItemName === i.name);
        if (item) {
          const meta = await getIconData(item);
          decorationsArr.push({
            range: new vscode.Range(
              activeEditor.document.positionAt(match.index),
              activeEditor.document.positionAt(match.index + match[0].length)
            ),
            renderOptions: {
              before: {
                contentIconPath: vscode.Uri.parse(
                  `data:image/svg+xml;utf8,${encodeURI(
                    createDecorationSvg(extractPathFromSvg(meta.rawIcon))
                  )}`
                ),
              },
            },
          });
        }
      }
    }
    activeEditor.setDecorations(iconDecoration, decorationsArr);
  }

  function triggerUpdateDecorations() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    timeout = setTimeout(updateDecorations, 500);
  }

  if (activeEditor) {
    triggerUpdateDecorations();
  }

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
      }
    },
    null,
    subscriptions
  );

  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateDecorations();
      }
    },
    null,
    subscriptions
  );

  vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (
        event.affectsConfiguration(
          "materialdesigniconsIntellisense.enableDecorations"
        ) ||
        event.affectsConfiguration("materialdesigniconsIntellisense.iconColor")
      ) {
        triggerUpdateDecorations();
      }
    },
    null,
    subscriptions
  );

  return subscriptions;
};
