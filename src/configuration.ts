import * as vscode from "vscode";
import * as path from "path";
import { CompletionType } from "./types";
import { hexToRgbString } from "./util";

const searchCodeActionCode = 1;

export const config = {
  get all() {
    return vscode.workspace.getConfiguration("materialdesigniconsIntellisense");
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
  get includeAliases() {
    return config.all.get<boolean>("includeAliases") || false;
  },
  get prefix() {
    return config.all.get<string>("insertPrefix") || "";
  },
  get suffix() {
    return config.all.get<string>("insertSuffix") || "";
  },
  get mdiPath() {
    return (
      config.all.get<string>("overrideFontPackagePath") ||
      path.normalize(path.join(__dirname, "../node_modules/@mdi/svg/"))
    );
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
    return config.all.get<CompletionType>("insertStyle")!;
  },
  insertTypeSpecificConfig(type: CompletionType) {
    return config.all.get<{ noTextDeletionLanguages: string[] }>(type)!;
  },
  lastSearch: "",
  changeInsertType(newType: CompletionType) {
    return config.all.update(
      "insertStyle",
      newType,
      vscode.ConfigurationTarget.Global
    );
  },
  get enableLinter() {
    return config.all.get<boolean>("enableLinter");
  },
  get ignoredIcons(){
    return config.all.get<string[]>("ignoredIcons") || [];
  }
};
