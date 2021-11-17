import * as vscode from "vscode";
import * as changeCase from "change-case";

import { CompletionType } from "./types";
import { Configuration } from "./Configuration";

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
    fullRegex: new RegExp(str.replace(/\{\w+\}/i, createIconRegex("+")), "ig"),
    type,
    suggestionPrefixAndIconRegex: new RegExp(
      `(?<prefix>${prefix})${createIconRegex("*")}$`
    ),
  };
};

export const getMatchAtPosition = (
  document: vscode.TextDocument,
  position: vscode.Position,
  matchers: Configuration["matchers"]
) => {
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
