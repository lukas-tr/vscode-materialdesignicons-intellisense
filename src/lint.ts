import * as vscode from "vscode";
import { getMdiMetaData } from "./util";
import { config } from "./configuration";

export class IconLint implements vscode.CodeActionProvider {
  static lintIconRegex = /\bmdi(-|:)((\w|\-)+)\b/gi;

  diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.lintDocument = this.lintDocument.bind(this);

    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
  }

  dispose() {
    this.diagnosticCollection.dispose();
  }

  deleteDiagnostics(document: vscode.TextDocument) {
    this.diagnosticCollection.delete(document.uri);
  }

  async lintDocument(document: vscode.TextDocument) {
    if (config.selector.indexOf(document.languageId) === -1) {
      return;
    }
    const text = document.getText();

    const diagnostics: vscode.Diagnostic[] = [];
    let match: RegExpExecArray | null = null;

    const meta = await getMdiMetaData();

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      while ((match = IconLint.lintIconRegex.exec(line.text))) {
        const index = match.index;
        const length = match[0].length;
        const iconName = match[2];
        let iconExists = false;

        for (const item of meta) {
          if (iconName === item.name) {
            iconExists = true;
            break;
          }
        }
        if (!iconExists) {
          const range = new vscode.Range(
            line.lineNumber,
            index,
            line.lineNumber,
            index + length
          );

          const diagnostic = new vscode.Diagnostic(
            range,
            `MDI: Icon mdi-${iconName} not found`,
            vscode.DiagnosticSeverity.Information
          );
          diagnostic.code = config.searchCodeActionCode;

          diagnostics.push(diagnostic);
        }
      }
    }
    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    const diagnostics = context.diagnostics;
    return diagnostics
      .filter(d => d.code === config.searchCodeActionCode)
      .map(
        (d): vscode.Command => {
          const match = IconLint.lintIconRegex.exec(d.message);
          const iconName = (match && match[2]) || "";
          return {
            title: "Search icon",
            command: "materialdesigniconsIntellisense.performIconSearch",
            arguments: [iconName]
          };
        }
      );
  }
}
