import * as vscode from "vscode";
import * as fs from "fs";
import { TreeNode, CompletionType } from "./types";
import { config } from "./configuration";
import { IconTreeDataProvider } from "./tree";
import { HoverProvider } from "./hover";
import { CompletionProvider } from "./completion";
import { IconLint } from "./lint";
import { showPreview } from "./preview";
import { createCompletion } from "./util";

export function activate(context: vscode.ExtensionContext) {
  const treeDataProvider = new IconTreeDataProvider();

  const treeView = vscode.window.createTreeView("materialDesignIconsExplorer", {
    treeDataProvider
  });

  treeView.onDidChangeVisibility(event => {
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
      () => {
        fs.readFile(config.mdiPackagePath, (err, data) => {
          if (err) {
            vscode.window.showErrorMessage(err.message);
            return;
          }
          vscode.window.showInformationMessage(
            "materialdesignicons-intellisense uses @mdi/svg@" +
              JSON.parse(data.toString("utf8"))["version"]
          );
        });
      }
    )
  );

  vscode.commands.registerCommand(
    "materialdesigniconsIntellisense.insertIconInActiveEditor",
    (node: TreeNode) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        if (node.type === "icon") {
          editor.insertSnippet(
            new vscode.SnippetString(
              `${config.prefix}${createCompletion(node.doc.name)}${
                config.suffix
              }`
            )
          );
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
            label: "Search results"
          },
          {
            expand: true,
            focus: true
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
            placeHolder: "Search icons"
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
      "materialdesigniconsIntellisense.changeInsertStyle",
      async () => {
        const result = (await vscode.window.showQuickPick(
          ["kebabCase", "camelCase", "homeAssistant"].filter(
            t => t !== config.insertType
          ),
          {
            canPickMany: false,
            placeHolder: `Currently Selected: ${config.insertType}`
          }
        )) as CompletionType | undefined;
        if (result) {
          await config.changeInsertType(result);
          treeDataProvider.refresh();
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
            "Use the MDI Explorer view to search icons"
          );
        }
        config.lastSearch = search;

        treeDataProvider.refresh();
        treeView.reveal(
          {
            type: "other",
            label: "Search results"
          },
          {
            expand: true,
            focus: true
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
      "-",
      "i",
      ":"
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
    vscode.workspace.onDidChangeConfiguration(event => {
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
    vscode.workspace.onDidChangeConfiguration(event => {
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
        )
      ) {
        treeDataProvider.refresh();
      }
    })
  );

  console.log('"materialdesignicons-intellisense" is now active');
}

// this method is called when your extension is deactivated
export function deactivate() {}
