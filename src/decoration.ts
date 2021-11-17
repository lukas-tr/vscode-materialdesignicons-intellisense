import * as vscode from "vscode";
import { matcherStringToRegex } from "./util";
import { paramCase } from "change-case";
import { Configuration } from "./Configuration";
import { IconManager } from "./IconManager";

export class DecorationProvider {
  private iconDecoration: vscode.TextEditorDecorationType;
  private timeout: NodeJS.Timer | undefined = undefined;
  private activeEditor = vscode.window.activeTextEditor;

  constructor(private config: Configuration, private manager: IconManager) {
    this.iconDecoration = vscode.window.createTextEditorDecorationType({
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
      before: {
        margin: this.config.decoration.margin,
        height: this.config.decoration.size,
        width: this.config.decoration.size,
      },
    });
  }

  register() {
    this.activeEditor = vscode.window.activeTextEditor;
    const subscriptions: vscode.Disposable[] = [];
    if (this.activeEditor) {
      this.triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
        this.activeEditor = editor;
        if (editor) {
          this.triggerUpdateDecorations();
        }
      },
      null,
      subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
      (event) => {
        if (
          this.activeEditor &&
          event.document === this.activeEditor.document
        ) {
          this.triggerUpdateDecorations();
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
          event.affectsConfiguration(
            "materialdesigniconsIntellisense.iconColor"
          )
        ) {
          this.triggerUpdateDecorations();
        }
        if (
          event.affectsConfiguration(
            "materialdesigniconsIntellisense.decoration.size"
          ) ||
          event.affectsConfiguration(
            "materialdesigniconsIntellisense.decoration.margin"
          )
        ) {
          vscode.window.showInformationMessage(
            "materialdesigniconsIntellisense.decoration change takes affect after the next restart of code"
          );
        }
      },
      null,
      subscriptions
    );

    return subscriptions;
  }

  private async updateDecorations() {
    if (!this.activeEditor) {
      return;
    }
    if (!this.config.enableDecorations) {
      this.activeEditor.setDecorations(this.iconDecoration, []); // clear existing decorations
      return;
    }

    const decorationsArr: vscode.DecorationOptions[] = [];
    for (const matcher of this.config.matchers) {
      const regex = matcherStringToRegex(matcher.match);
      if (!regex) continue;
      const regEx = regex.fullRegex;
      const text = this.activeEditor.document.getText();
      let match: RegExpExecArray;
      while ((match = regEx.exec(text)!)) {
        const paramItemName = paramCase(match?.groups?.icon || "");
        const item = await this.manager.getIcon(paramItemName);
        if (item) {
          decorationsArr.push({
            range: new vscode.Range(
              this.activeEditor.document.positionAt(match.index),
              this.activeEditor.document.positionAt(
                match.index + match[0].length
              )
            ),
            renderOptions: {
              before: {
                contentIconPath: vscode.Uri.parse(
                  `data:image/svg+xml;utf8,${encodeURI(
                    item.getDecorationIcon(this.config.iconColor)
                  )}`
                ),
              },
            },
          });
        }
      }
    }
    this.activeEditor.setDecorations(this.iconDecoration, decorationsArr);
  }

  triggerUpdateDecorations() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
    this.timeout = setTimeout(() => this.updateDecorations(), 500);
  }
}
