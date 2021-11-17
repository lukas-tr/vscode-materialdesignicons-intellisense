import * as vscode from "vscode";

import * as pm from "picomatch"
import { Configuration } from "./Configuration";
import { IconManager } from "./IconManager";


const searchCodeActionCode = 1;

export class IconLint implements vscode.CodeActionProvider {
  private static LINT_REGULAR_REGEX = /\bmdi(-|:)((\w|\-)+)\b/gi;
  private static LINT_LIGHT_REGEX = /\bmdil(-|:)((\w|\-)+)\b/gi;

  diagnosticCollection: vscode.DiagnosticCollection;

  constructor(private config: Configuration, private manager: IconManager) {
    this.lintDocument = this.lintDocument.bind(this);

    this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
  }

  private getRegex(){
    return this.config.light ? IconLint.LINT_LIGHT_REGEX : IconLint.LINT_REGULAR_REGEX;
  }

  dispose() {
    if (this.diagnosticCollection) {
      this.diagnosticCollection.dispose();
    }
  }

  deleteDiagnostics(document: vscode.TextDocument) {
    if (this.diagnosticCollection) {
      this.diagnosticCollection.delete(document.uri);
    }
  }

  async lintDocument(document: vscode.TextDocument) {
    if (this.config.selector.indexOf(document.languageId) === -1) {
      return;
    }
    const ignore = pm(this.config.linter.ignorePaths);
    const curPath = vscode.workspace.asRelativePath(document.fileName)
    if(ignore(curPath)) {
      this.diagnosticCollection.set(document.uri, []);
      return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    let match: RegExpExecArray | null = null;

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      while ((match = this.getRegex().exec(line.text))) {
        const index = match.index;
        const length = match[0].length;
        const iconName = match[2];

        if (this.config.ignoredIcons.includes(match[0])) {
          continue;
        }

        if (await this.manager.getIcon(iconName)) {
          // icon exists, nothing to complain about
          continue; 
        }

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
        diagnostic.code = searchCodeActionCode;

        diagnostics.push(diagnostic);
      }
    }
    if (this.diagnosticCollection) {
      this.diagnosticCollection.set(document.uri, diagnostics);
    }
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    const diagnostics = context.diagnostics;
    return diagnostics
      .filter(d => d.code === searchCodeActionCode)
      .map(
        (d): vscode.Command => {
          const match = this.getRegex().exec(d.message);
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
