import * as vscode from "vscode";

export interface IIconMeta {
  id: string;
  name: string;
  codepoint: string;
  aliases: string[];
  tags: string[];
  author: string;
  version: string;
}

export interface IIconDoc {
  name: string;
  codepoint: string;
  aliases: string;
  tags: string;
  author: string;
  version: string;
  link: vscode.MarkdownString;
  icon: vscode.MarkdownString;
  rawIcon: string;
}

export interface IIconNode {
  type: "icon";
  doc: IIconDoc;
  meta: IIconMeta;
}

export interface ITagNode {
  type: "tag";
  tag: string;
}

export interface ISearchNode {
  type: "other";
  label: string;
  command?: vscode.Command;
}

export type TreeNode = IIconNode | ITagNode | ISearchNode;

export interface IIconCompletionItem extends vscode.CompletionItem {
  meta: IIconMeta;
  completionType: CompletionType;
}

export enum CompletionType {
  kebabCase,
  camelCase
}
