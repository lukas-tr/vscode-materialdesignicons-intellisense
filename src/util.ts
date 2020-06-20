import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as https from "https";
import * as tar from "tar";
import { sort } from "semver";
import * as changeCase from "change-case";

import { IIconMeta, IIconDoc, CompletionType } from "./types";
import { config } from "./configuration";

export const getMdiMetaData = async (): Promise<IIconMeta[]> => {
  let data: Buffer;
  const fallbackPath = path.normalize(
    path.join(__dirname, "../node_modules/@mdi/svg/", "meta.json")
  );
  try {
    data = await fs.promises.readFile(config.mdiMetaDataPath);
  } catch (err) {
    log(err);
    log(
      "local version not found, fetching available versions from npm registry"
    );
    const info = await getVersions();
    if (info.versions.find((v) => v.version === config.mdiVersion)) {
      // download missing version
      await handleDownload(info.latest, info);
      data = await fs.promises.readFile(config.mdiMetaDataPath);
    } else {
      vscode.window.showWarningMessage(
        `Couldn't find ${config.mdiMetaDataPath}`
      );
      data = await fs.promises.readFile(fallbackPath);
    }
  }
  return JSON.parse(data.toString("utf8"));
};

export const encodeSpaces = (content: string) => {
  return content.replace(/ /g, "%20");
};

export const getIconData = async (item: IIconMeta): Promise<IIconDoc> => {
  const svgPath = path.normalize(
    path.join(config.mdiPath, "svg", `${item.name}.svg`)
  );
  const fallbackSvgPath = path.normalize(
    path.join(__dirname, "../node_modules/@mdi/svg/", "svg", `${item.name}.svg`)
  );
  let data: Buffer;
  try {
    data = await fs.promises.readFile(svgPath);
  } catch (err) {
    log(err);
    data = await fs.promises.readFile(fallbackSvgPath);
  }
  const utf8String = data
    .toString("utf8")
    .replace(/<path/gi, `<path fill="${config.iconColor}" `);
  const previewSvg =
    "data:image/svg+xml;utf8;base64," +
    Buffer.from(utf8String).toString("base64") +
    encodeSpaces(` | width=${config.iconSize} height=${config.iconSize}`);
  return {
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
    rawIcon: utf8String,
  };
};

let outputChannel: vscode.OutputChannel | null = null;

export const log = (x: any, show = false) => {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel(
      "Material Design Icons Intellisense"
    );
  }
  if (show) {
    outputChannel.show();
  }
  outputChannel.appendLine(x);
};

export const hexToRgbString = (hex: string) => {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }
  const rgb = {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
};

export const getVersions = async (): Promise<IVersionInfo> => {
  const packageInfo: any = await getPackageInfo();

  return {
    latest: packageInfo["dist-tags"].latest,
    // versions sorted with semver
    versions: sort(Object.keys(packageInfo.versions))
      .reverse()
      .map((version) => ({
        version: version,
        time: packageInfo.time[version],
        downloadUrl: packageInfo.versions[version].dist.tarball,
      })),
  };
};

export interface IVersionInfo {
  latest: string;
  versions: { version: string; time: string; downloadUrl: string }[];
}

export const getPackageInfo = (url = "https://registry.npmjs.org/@mdi/svg") => {
  return new Promise((resolve, reject) => {
    var req = https.get(url, function (res) {
      const chunks: string[] = [];
      res.setEncoding("utf8");
      res.on("data", function (data) {
        chunks.push(data);
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(chunks.join("")));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", function (e) {
      reject(e);
    });
    req.end();
  });
};

export const handleDownload = (version: string, packageInfo: IVersionInfo) =>
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      cancellable: false,
    },
    async (progress) => {
      progress.report({
        message: `Downloading and extracting @mdi/svg@${version}`,
      });
      const versionInfo = packageInfo.versions.find(
        (v) => v.version === version
      );
      if (!versionInfo) {
        throw new Error(`Version ${version} not found`);
      }
      const p = path.join(config.context!.globalStoragePath, version);
      await fs.promises.mkdir(p, { recursive: true });
      await downloadAndExtractTarball(versionInfo.downloadUrl, p);
    }
  );

export const downloadAndExtractTarball = (
  url: string,
  destinationDirectory: string
) => {
  return new Promise((resolve, reject) => {
    var req = https.get(url, function (res) {
      const t = tar.extract({
        cwd: destinationDirectory,
      });
      t.on("error", (err) => {
        reject(err);
      });
      res.pipe(t);
      res.on("error", (err) => {
        reject(err);
      });
      t.on("finish", () => {
        resolve();
      });
    });
    req.on("error", function (e) {
      reject(e);
    });
    req.end();
  });
};

export const matcherStringToRegex = (str: string) => {
  const result = /\{(\w+)\}/.exec(str);
  if (!result) {
    log("Type not found in matcher");
    return null;
  }

  const replacements = {
    camel: "A-Za-z",
    param: "-a-z",
    pascal: "A-Za-z",
    constant: "_A-Z",
    dot: ".a-z",
    header: "-A-Za-z",
    no: " a-z",
    path: "/a-z",
    snake: "_a-z",
  };
  const type = result[1] as CompletionType;
  const replacement = (replacements as any)[type];
  if (!replacement) {
    log("invalid matcher syntax");
    return null;
  }
  const createIconRegex = (count: string) =>
    `(?<icon>[${replacement}0-9]${count})`;
  const prefix = result.input.slice(0, result.index);
  return {
    fullRegex: new RegExp(str.replace(/\{\w+\}/i, createIconRegex("+")), "i"),
    type,
    suggestionPrefixAndIconRegex: new RegExp(
      `(?<prefix>${prefix})${createIconRegex("*")}$`
    ),
  };
};

export const getMatchAtPosition = (
  document: vscode.TextDocument,
  position: vscode.Position
) => {
  const matchers = config.matchers;
  for (const matcher of matchers) {
    const regex = matcherStringToRegex(matcher.match);
    if (!regex) continue;
    const range = document.getWordRangeAtPosition(position, regex.fullRegex);
    if (!range) {
      continue;
    }
    const text = document.getText(range);
    const match = regex.fullRegex.exec(text);
    if (!match || !match.groups) {
      continue;
    }
    const iconName = changeCase.paramCase(match.groups.icon);
    return {
      match,
      iconName,
      range,
    };
  }
};

export const createCompletion = (iconName: string, type: CompletionType) => {
  const transformers: { [key in CompletionType]: (s: string) => string } = {
    camel: changeCase.camelCase,
    param: changeCase.paramCase,
    pascal: changeCase.pascalCase,
    constant: changeCase.constantCase,
    dot: changeCase.dotCase,
    header: changeCase.headerCase,
    no: changeCase.noCase,
    path: changeCase.pathCase,
    snake: changeCase.snakeCase,
  };
  return (transformers as any)[type](iconName);
};
