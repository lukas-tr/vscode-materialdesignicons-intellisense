import * as vscode from "vscode";
import * as fs from "fs";

import { TreeNode } from "./types";
import { config } from "./configuration";
import { IconTreeDataProvider } from "./tree";
import { HoverProvider } from "./hover";
import { CompletionProvider, triggerCharacters } from "./completion";
import { IconLint } from "./lint";
import { showPreview } from "./preview";
import {
  handleDownload,
  getVersions,
  IVersionInfo,
  log,
  createCompletion,
} from "./util";
import { registerDecoration } from "./decoration";

export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = new IconTreeDataProvider();

  config.context = context;

  const treeView = vscode.window.createTreeView("materialDesignIconsExplorer", {
    treeDataProvider,
  });

  treeView.onDidChangeVisibility((event) => {
    if (event.visible) {
      treeDataProvider.refresh();
    }
  });

  vscode.commands.registerCommand(
    "materialdesigniconsIntellisense.openIconPreview",
    (node?: TreeNode) => {
      if (!node) {
        return vscode.window.showInformationMessage(
          "Click on an icon in the MDI Explorer view to preview icons"
        );
      }
      showPreview(node, context);
    }
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "materialdesigniconsIntellisense.showMdiVersion",
      async () => {
        try {
          const data = await fs.promises.readFile(config.mdiPackagePath);
          vscode.window.showInformationMessage(
            "materialdesignicons-intellisense uses @mdi/svg@" +
              JSON.parse(data.toString("utf8"))["version"]
          );
        } catch (err) {
          vscode.window.showErrorMessage(err.message);
        }
      }
    )
  );

  vscode.commands.registerCommand(
    "materialdesigniconsIntellisense.insertIconInActiveEditor",
    async (node: TreeNode) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        if (node.type === "icon") {
          const match = config.matchers.find(
            (m) => m.name === config.insertType
          );
          if (!match) {
            vscode.window.showInformationMessage(
              `InsertType ${config.insertType} not found`
            );
            return;
          }
          const snippet = match.insert.replace(
            /\{(\w+)\}/,
            (group0, group1) => {
              return createCompletion(node.doc.name, group1);
            }
          );
          await editor.insertSnippet(new vscode.SnippetString(snippet));
        }
      } else {
        vscode.window.showInformationMessage(`No active editor`);
      }
    }
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "materialdesigniconsIntellisense.closeSearch",
      async () => {
        config.lastSearch = "";

        treeDataProvider.refresh();
        treeView.reveal(
          {
            type: "other",
            label: "Search results",
          },
          {
            expand: true,
            focus: true,
          }
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "materialdesigniconsIntellisense.showIconSearch",
      async () => {
        const search =
          (await vscode.window.showInputBox({
            value: config.lastSearch,
            prompt: "Search icons",
            placeHolder: "Search icons",
          })) || "";
        vscode.commands.executeCommand(
          "materialdesigniconsIntellisense.performIconSearch",
          search
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "materialdesigniconsIntellisense.changeSettings",
      () =>
        vscode.commands.executeCommand(
          "workbench.action.openSettings",
          "materialdesigniconsIntellisense"
        )
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "materialdesigniconsIntellisense.changeMdiVersion",
      async () => {
        let items: vscode.QuickPickItem[] | null = null;
        let info: IVersionInfo | null = null;
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            cancellable: false,
          },
          async (progress) => {
            progress.report({
              message: "Getting versions from registry.npmjs.org",
            });
            try {
              info = await getVersions();
              await config.updateLatestMdiVersion(info.latest);
              items = [
                {
                  label: "latest",
                  description:
                    `currently ${info.latest}` +
                    ("latest" === config.rawMdiVersion ? " - selected" : ""),
                },
                ...info.versions.map<vscode.QuickPickItem>((v) => ({
                  label: v.version,
                  description:
                    v.time +
                    (v.version === config.rawMdiVersion ? " - selected" : ""),
                })),
              ];
            } catch (error) {
              log(error);
              vscode.window.showErrorMessage(error.message);
            }
          }
        );
        const result = await vscode.window.showQuickPick<vscode.QuickPickItem>(
          items!,
          {
            canPickMany: false,
            placeHolder: `Current version: ${config.rawMdiVersion}`,
          }
        );
        if (result) {
          const selectedVersion = result.label;
          const versionToDownload =
            selectedVersion === "latest" ? info!.latest : selectedVersion;
          await handleDownload(versionToDownload, info!);
          await config.updateMdiVersion(selectedVersion);
          treeDataProvider.refresh();
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "materialdesigniconsIntellisense.changeInsertStyle",
      async () => {
        const items = config.matchers.map((m): vscode.QuickPickItem & {
          name: string;
        } => ({
          label: m.displayName,
          description: m.name === config.insertType ? "selected" : "",
          name: m.name,
        }));
        const result = await vscode.window.showQuickPick(items, {
          canPickMany: false,
        });
        if (result) {
          await config.changeInsertType(result.name);
          treeDataProvider.refresh();
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "materialdesigniconsIntellisense.changeLanguages",
      async () => {
        const languages = await vscode.languages.getLanguages();
        const selected = config.selector;

        const selectedButNotAvailable: string[] = [];
        for (const s of selected) {
          if (!languages.includes(s)) {
            selectedButNotAvailable.push(s);
          }
        }
        const items = languages.map<vscode.QuickPickItem>((l) => ({
          label: l,
          picked: selected.includes(l),
        }));
        items.push(
          ...selectedButNotAvailable.map<vscode.QuickPickItem>((l) => ({
            label: l,
            picked: true,
            description: "This language is currently not installed",
          }))
        );

        const result = await vscode.window.showQuickPick<vscode.QuickPickItem>(
          items,
          {
            canPickMany: true,
            matchOnDescription: true,
            matchOnDetail: true,
          }
        );
        if (result) {
          await config.updateSelector(result.map((r) => r.label));
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "materialdesigniconsIntellisense.performIconSearch",
      (search?: string) => {
        if (!search) {
          return vscode.window.showInformationMessage(
            "Use the MDI explorer view to search icons"
          );
        }
        config.lastSearch = search;

        treeDataProvider.refresh();
        treeView.reveal(
          {
            type: "other",
            label: "Search results",
          },
          {
            expand: true,
            focus: true,
          }
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(config.selector, new HoverProvider())
  );

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      config.selector,
      new CompletionProvider(),
      ...triggerCharacters
    )
  );

  const enableLinter = () => {
    const linter = new IconLint();

    if (vscode.window.activeTextEditor) {
      linter.lintDocument(vscode.window.activeTextEditor.document);
    }

    const disposables = vscode.Disposable.from(
      vscode.workspace.onDidOpenTextDocument(
        linter.lintDocument.bind(linter),
        null
      ),
      vscode.workspace.onDidCloseTextDocument(
        linter.deleteDiagnostics.bind(linter),
        null
      ),
      vscode.workspace.onDidCloseTextDocument(
        linter.deleteDiagnostics.bind(linter),
        null
      ),
      vscode.workspace.onDidSaveTextDocument(
        linter.lintDocument.bind(linter),
        null
      ),
      vscode.languages.registerCodeActionsProvider(config.selector, linter),
      linter
    );
    context.subscriptions.push(disposables);
    return disposables;
  };

  let linterDisposables: vscode.Disposable | undefined;

  if (config.enableLinter) {
    linterDisposables = enableLinter();
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration(
          "materialdesigniconsIntellisense.enableLinter"
        )
      ) {
        if (linterDisposables) {
          linterDisposables.dispose();
          linterDisposables = undefined;
        }
        if (config.enableLinter) {
          linterDisposables = enableLinter();
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration("materialdesigniconsIntellisense.selector")
      ) {
        vscode.window.showInformationMessage(
          "materialdesigniconsIntellisense.selector change takes affect after the next restart of code"
        );
      }
      if (
        event.affectsConfiguration(
          "materialdesigniconsIntellisense.overrideFontPackagePath"
        ) ||
        event.affectsConfiguration("materialdesigniconsIntellisense.mdiVersion")
      ) {
        treeDataProvider.refresh();
      }
    })
  );

  // auto update
  if (config.rawMdiVersion === "latest") {
    (async () => {
      try {
        const info = await getVersions();
        if (config.mdiVersion !== info.latest) {
          await handleDownload(info.latest, info);
          await config.updateLatestMdiVersion(info.latest);
          treeDataProvider.refresh();
        }
      } catch (error) {
        log(error);
      }
    })();
  }

  context.subscriptions.push(...registerDecoration());

  log('"materialdesignicons-intellisense" is now active');
}

// this method is called when your extension is deactivated
export function deactivate() {}
