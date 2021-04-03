import * as vscode from "vscode";
import * as path from "path";

import { hexToRgbString } from "./util";

const searchCodeActionCode = 1;

export const config = {
  context: null as vscode.ExtensionContext | null, // TODO: refactor
  get all() {
    return vscode.workspace.getConfiguration("materialdesigniconsIntellisense");
  },
  get matchers() {
    return (
      config.all.get<
        Array<{
          match: string;
          insert: string;
          displayName: string;
          name: string;
          insertPrefix?: string;
          insertSuffix?: string;
        }>
      >("matchers") || []
    );
  },
  get iconSize() {
    return config.all.get<number>("iconSize") || 100;
  },
  /**
   * For some reason, vscode doesn't display the icon in tree view if the color contains `#`
   * @returns {string} rgb(r, g, b)
   */
  get iconColor() {
    return hexToRgbString(config.all.get<string>("iconColor") || "#bababa");
  },
  get selector() {
    return config.all.get<string[]>("selector") || [];
  },
  updateSelector(selector: string[]) {
    return config.all.update(
      "selector",
      selector,
      vscode.ConfigurationTarget.Global
    );
  },
  get includeAliases() {
    return config.all.get<boolean>("includeAliases") || false;
  },
  get latestMdiVersion() {
    return config.context?.globalState.get<string>("latestMdiVersion");
  },
  updateLatestMdiVersion(version: string) {
    return config.context?.globalState.update("latestMdiVersion", version);
  },
  get rawMdiVersion() {
    return config.all.get<string>("mdiVersion") || "latest";
  },
  get mdiVersion() {
    const version = config.rawMdiVersion;
    return version === "latest" ? config.latestMdiVersion : version;
  },
  updateMdiVersion(version: string) {
    return config.all.update(
      "mdiVersion",
      version,
      vscode.ConfigurationTarget.Global
    );
  },
  get mdiPath() {
    return (
      config.all.get<string>("overrideFontPackagePath") ||
      (config.context &&
        config.mdiVersion &&
        path.join(
          config.context.globalStoragePath,
          config.mdiVersion,
          "package"
        )) || ""
    ); // TODO: handle errors (eg mdi package download fail)
  },
  get mdiPackagePath() {
    return path.normalize(path.join(config.mdiPath, "package.json"));
  },
  get mdiMetaDataPath() {
    return path.normalize(path.join(config.mdiPath, "meta.json"));
  },
  get searchCodeActionCode() {
    return searchCodeActionCode;
  },
  get insertType() {
    return config.all.get<string>("insertStyle")!;
  },
  lastSearch: "",
  changeInsertType(newType: string) {
    return config.all.update(
      "insertStyle",
      newType,
      vscode.ConfigurationTarget.Global
    );
  },
  get enableLinter() {
    return config.all.get<boolean>("enableLinter");
  },
  get enableDecorations() {
    return config.all.get<boolean>("enableDecorations");
  },
  get ignoredIcons() {
    return config.all.get<string[]>("ignoredIcons") || [];
  },
  get decoration() {
    return config.all.get<{ margin: string, size: string }>("decoration")!;
  }
};
