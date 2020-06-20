import * as vscode from "vscode";

import { TreeNode } from "./types";

let currentPreviewPanel: vscode.WebviewPanel | undefined = undefined;

export const showPreview = (
  node: TreeNode,
  context: vscode.ExtensionContext
) => {
  if (node.type === "tag" || node.type === "other") {
    return;
  }
  const columnToShowIn =
    (vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined) || vscode.ViewColumn.Active;

  if (currentPreviewPanel) {
    currentPreviewPanel.reveal(columnToShowIn);
  } else {
    currentPreviewPanel = vscode.window.createWebviewPanel(
      "mdiIconPreview",
      `${node.doc.name} - Material Design Icon Preview`,
      columnToShowIn,
      { enableScripts: false }
    );
    currentPreviewPanel.onDidDispose(
      () => {
        currentPreviewPanel = undefined;
      },
      null,
      context.subscriptions
    );
  }

  currentPreviewPanel.webview.html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
          <title>Preview</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              display: flex;
              height: 100vh;
              width: 100vw;
              overflow: hidden;
            }
            svg {
              width: 100%;
              height: 100%;
              max-width: calc(100vw - 40px);
              max-height: calc(100vh - 40px);
            }
          </style>
      </head>
      <body>
          ${node.doc.rawIcon}
      </body>
      </html>`;
};
