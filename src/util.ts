import { IIconMeta, IIconDoc, CompletionType } from "./types";
import { config } from "./configuration";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export const getMdiMetaData = (): Promise<IIconMeta[]> =>
  new Promise((resolve, reject) => {
    fs.readFile(config.mdiMetaDataPath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      return resolve(JSON.parse(data.toString("utf8")));
    });
  });

export const encodeSpaces = (content: string) => {
  return content.replace(/ /g, "%20");
};

export const getIconData = (item: IIconMeta): Promise<IIconDoc> => {
  const svgPath = path.normalize(
    path.join(config.mdiPath, "svg", `${item.name}.svg`)
  );
  return new Promise((resolve, reject) => {
    fs.readFile(svgPath, (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(err.message);
        return reject(err);
      }
      const utf8String = data
        .toString("utf8")
        .replace(/<path/gi, `<path fill="${config.iconColor}" `);
      const previewSvg =
        "data:image/svg+xml;utf8;base64," +
        Buffer.from(utf8String).toString("base64") +
        encodeSpaces(` | width=${config.iconSize} height=${config.iconSize}`);
      return resolve({
        aliases: [item.name, ...item.aliases].join(", "),
        author: item.author,
        codepoint: item.codepoint,
        name: item.name,
        tags: item.tags.join(", ") || "Other",
        version: item.version,
        link: new vscode.MarkdownString(
          `[docs](https://materialdesignicons.com/icon/${item.name})`
        ),
        icon: new vscode.MarkdownString(`![preview](${previewSvg})`),
        rawIcon: utf8String
      });
    });
  });
};

export const createCompletion = (iconName: string, type?: CompletionType) => {
  if (typeof type === "undefined") {
    type = config.insertType;
  }
  return type === CompletionType.kebabCase
    ? `mdi-${iconName}`
    : kebabCaseToCamelCase(`mdi-${iconName}`);
};

export const kebabCaseToCamelCase = (kebabStr: string) =>
  kebabStr.replace(/-([a-z0-9])/g, match => {
    return match[1].toUpperCase();
  });

export const pascalCaseToKebabCase = (pascalStr: string) =>
  pascalStr.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();
