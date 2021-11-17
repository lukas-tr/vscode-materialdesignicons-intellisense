import * as vscode from "vscode";

import { hexToRgbString } from "./util";

export class Configuration {
  constructor(private context: vscode.ExtensionContext) {}
  get storagePath() {
    return this.context.globalStorageUri.fsPath;
  }
  get all() {
    return vscode.workspace.getConfiguration("materialdesigniconsIntellisense");
  }
  get matchers() {
    return (
      this.all.get<
        Array<{
          match: string;
          insert: string;
          displayName: string;
          name: string;
          insertPrefix?: string;
          insertSuffix?: string;
          light?: string;
        }>
      >("matchers") || []
    ).filter((matcher) => (matcher.light || false) === this.light);
  }
  get iconSize() {
    return this.all.get<number>("iconSize") || 100;
  }
  /**
   * For some reason, vscode doesn't display the icon in tree view if the color contains `#`
   * @returns rgb(r, g, b)
   */
  get iconColor() {
    return hexToRgbString(this.all.get<string>("iconColor") || "#bababa")!;
  }
  get selector() {
    return this.all.get<string[]>("selector") || [];
  }
  updateSelector(selector: string[]) {
    return this.all.update(
      "selector",
      selector,
      vscode.ConfigurationTarget.Global
    );
  }
  get includeAliases() {
    return this.all.get<boolean>("includeAliases") || false;
  }
  get latestMdiVersion() {
    return this.context.globalState.get<string>("latestMdiVersion");
  }
  updateLatestMdiVersion(version?: string) {
    return this.context.globalState.update("latestMdiVersion", version);
  }
  get rawMdiVersion() {
    vscode.workspace.getConfiguration();
    return this.all.get<string>("mdiVersion") || "latest";
  }
  get mdiVersion() {
    const version = this.rawMdiVersion;
    const fallback = this.light ? "0.2.63" : "6.4.95";
    return (version === "latest" ? this.latestMdiVersion : version) || fallback;
  }
  updateMdiVersion(version: string) {
    return this.all.update(
      "mdiVersion",
      version,
      vscode.ConfigurationTarget.Global
    );
  }
  get insertType() {
    return this.all.get<string>("insertStyle")!;
  }
  lastSearch = "";
  changeInsertType(newType: string) {
    return this.all.update(
      "insertStyle",
      newType,
      vscode.ConfigurationTarget.Global
    );
  }
  get enableLinter() {
    return this.all.get<boolean>("enableLinter");
  }
  get enableDecorations() {
    return this.all.get<boolean>("enableDecorations");
  }
  get ignoredIcons() {
    return this.all.get<string[]>("ignoredIcons") || [];
  }
  get decoration() {
    return this.all.get<{ margin: string; size: string }>("decoration")!;
  }
  get linter() {
    return (
      this.all.get<{ ignorePaths: string[] }>("linter") || { ignorePaths: [] }
    );
  }
  get light() {
    return this.all.get<boolean>("light") || false;
  }
}
