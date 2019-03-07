import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const mdiPath = path.normalize(path.join(__dirname, '../node_modules/@mdi/svg/'));
const mdiPackagePath = path.normalize(path.join(mdiPath, 'package.json'));
const mdiMetaDataPath = path.normalize(path.join(mdiPath, 'meta.json'));

interface IIconMeta {
  id : string;
  name : string;
  codepoint : string;
  aliases : string[];
  tags : string[];
  author : string;
  version : string;
}

interface IIconDoc {
  name : string;
  codepoint : string;
  aliases : string | null;
  tags : string;
  author : string;
  version : string;
  link : vscode.MarkdownString;
  icon : vscode.MarkdownString;
}

export function activate(context : vscode.ExtensionContext) {
  const getConfiguration = () => vscode
    .workspace
    .getConfiguration("materialdesigniconsIntellisense")

  const getMdiMetaData = () : Promise < IIconMeta[] > => new Promise((resolve, reject) => {
    fs.readFile(mdiMetaDataPath, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      return resolve(JSON.parse(data.toString('utf8')));
    });
  })

  const encodeSpaces = (content : string) => {
    return content.replace(/ /g, '%20');
  }

  const getIconData = (item : IIconMeta) : Promise < IIconDoc > => {

    const svgPath = path.normalize(path.join(mdiPath, "svg", `${item.name}.svg`));
    return new Promise((resolve, reject) => {
      fs.readFile(svgPath, (err, data) => {
        if (err) {
          vscode
            .window
            .showErrorMessage(err.message);
          return reject(err);
        }
        const iconSize = getConfiguration().get < number > ("iconSize") || 100;
        const iconColor = getConfiguration().get < string > ("iconColor") || "#bababa";
        const utf8String = data
          .toString("utf8")
          .replace(/<path/gi, `<path fill="${iconColor}" `);
        const previewSvg = 'data:image/svg+xml;utf8;base64,' + Buffer
          .from(utf8String)
          .toString("base64") + encodeSpaces(` | width=${iconSize} height=${iconSize}`);
        return resolve({
          aliases: item
            .aliases
            .join(", ") || null,
          author: item.author,
          codepoint: item.codepoint,
          name: item.name,
          tags: item
            .tags
            .join(", ") || "Other",
          version: item.version,
          link: new vscode.MarkdownString(`[docs](https://materialdesignicons.com/icon/${item.name})`),
          icon: new vscode.MarkdownString(`![preview](${previewSvg})`)
        })
      })
    })
  }

  const showMdiVersionCommand = vscode
    .commands
    .registerCommand('extension.show-mdi-version', () => {
      fs.readFile(mdiPackagePath, (err, data) => {
        if (err) {
          vscode
            .window
            .showErrorMessage(err.message);
          return;
        }
        vscode
          .window
          .showInformationMessage('materialdesignicons-intellisense uses @mdi/svg@' + (JSON.parse(data.toString('utf8')))['version']);
      })
    });

  const selector = getConfiguration().get < string[] > ("selector") || [];

  const hoverProvider = vscode
    .languages
    .registerHoverProvider(selector, {
      async provideHover(document : vscode.TextDocument, position : vscode.Position) {
        const regex = /mdi-((\w|\-)+)/i;
        const range = document.getWordRangeAtPosition(position, regex);
        if (!range) {
          return null;
        }
        const text = document.getText(range);

        const match = regex.exec(text);
        if (!match) {
          return null;
        }
        const iconName = match[1];

        const meta = await getMdiMetaData();

        for (const item of meta) {
          if (iconName == item.name) {
            const meta = await getIconData(item);
            const hover : vscode.Hover = {
              range,
              contents: [meta.icon, meta.tags, meta.link]
            }
            return hover;
          }
        }
        const hover : vscode.Hover = {
          range,
          contents: [`icon ${iconName} not found`]
        }
        return hover;
      }
    })

  const completionProvider = vscode
    .languages
    .registerCompletionItemProvider(selector, {
      async provideCompletionItems(document : vscode.TextDocument, position : vscode.Position) {

        let linePrefix = document
          .lineAt(position)
          .text
          .substr(0, position.character);
        if (!linePrefix.endsWith('mdi-')) {
          return [];
        }

        const meta = await getMdiMetaData();

        return [...meta].map((m) : vscode.CompletionItem & {
          meta: any
        } => {
          return {label: `mdi-${m.name}`, kind: vscode.CompletionItemKind.Text, sortText: m.name, meta: m};
        })
      },
      resolveCompletionItem(item : vscode.CompletionItem & {
        meta: any
      }, token : vscode.CancellationToken): vscode.ProviderResult < vscode.CompletionItem > {

        return getIconData(item.meta).then(data => {
          return ({
            ...item,
            documentation: data
              .icon
              .appendMarkdown(`
- link: ${data.link.value}
- aliases: ${data.aliases}
- codepoint: ${data.codepoint}
- author: ${data.author}
- version: ${data.version}`),
            detail: data.tags
          })
        });
      }
    }, "-");

  context
    .subscriptions
    .push(showMdiVersionCommand, hoverProvider, completionProvider);

  console.log('"materialdesignicons-intellisense" is now active');

}

// this method is called when your extension is deactivated
export function deactivate() {}