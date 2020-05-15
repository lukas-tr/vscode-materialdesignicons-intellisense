# Material Design Icons Intellisense

Provides intellisense, search and hover preview of Material Design Icons.

This extension provides intellisense for both `@mdi/font` and `@mdi/js`. Due to the size of the webfont, you should consider using `@mdi/js` (read [this guide](https://dev.materialdesignicons.com/guide/webfont-alternatives) for further information).

[Install from VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=lukas-tr.materialdesignicons-intellisense)

## Features

Starts suggesting icon names after typing `mdi` (camelCase), `mdi-` (kebab-case) or `mdi:` (YAML/Home Assistant). Each entry contains a preview image and other information related to the icon, such as the icon category or aliases.

Unknown icon names are highlighted and listed in the Problems panel - kebab-case and Home Assistant only (use tslint/eslint for `@mdi/js`).

The explorer contains a list of all icons grouped by category. Icons can be filtered using the magnifier icon. You can use the `materialdesigniconsIntellisense.insertStyle` setting to change the syntax of the inserted snippet.

### Intellisense

![Intellisense](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-1.gif)

### camelCase, kebab-case and Home Assistant completion

![camelCase and kebab-case completion](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-6.gif)

### Hover

![Hover](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-2.gif)

### Search

![Search](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-3.gif)

### Lint

![Lint](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-4.gif)

<!-- ## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them. -->

## Extension Settings

This extension contributes the following settings:

- `materialdesigniconsIntellisense.iconColor`: RGB color of the preview icon.
- `materialdesigniconsIntellisense.iconSize`: Size of the preview icon in pixels.
- `materialdesigniconsIntellisense.selector`: Languages where completion and hover are active. A list of identifiers can be found [here](https://code.visualstudio.com/docs/languages/identifiers) or when executing the `Change Language Mode` command.
- `materialdesigniconsIntellisense.insertPrefix`: Text inserted before the actual icon name.
- `materialdesigniconsIntellisense.insertSuffix`: Text inserted after the actual icon name.
- `materialdesigniconsIntellisense.includeAliases`: Also include icon aliases in completion items.
- `materialdesigniconsIntellisense.overrideFontPackagePath`: Override the path to the `@mdi/svg` package. To use a global installation, set this to `<global npm root>/@mdi/svg` where `<global npm root>` is the output of `npm root -g`
- `materialdesigniconsIntellisense.enableLinter`: Lint Home Assistant and kebab case icon names
- `materialdesigniconsIntellisense.ignoredIcons`: Icons ignored by the linter

## FAQ

### The preview doesn't show up in intellisense

The intellisense preview can be toggled with <kbd>Ctrl</kbd> + <kbd>Space</kbd> by default.
You can also find the shortcut via `Preferences: Open Keyboard Shortcuts` and searching for `toggleSuggestionDetails`.

<!-- ## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Changelog

[CHANGELOG.md](https://github.com/lukas-tr/vscode-materialdesignicons-intellisense/blob/master/CHANGELOG.md)
