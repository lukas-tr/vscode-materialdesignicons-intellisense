# Material Design Icons Intellisense

![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/lukas-tr.materialdesignicons-intellisense?style=flat-square)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/lukas-tr.materialdesignicons-intellisense?style=flat-square)
![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/lukas-tr.materialdesignicons-intellisense?style=flat-square)
<p align="center">
  <br />
  <a title="Install from VSCode Marketplace" href="https://marketplace.visualstudio.com/items?itemName=lukas-tr.materialdesignicons-intellisense"><img src="https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/icons/logo.png" alt="Logo" /></a>
</p>

Provides intellisense, search and hover preview of [Material Design Icons](https://materialdesignicons.com/).

## Features

- Suggest icon names after typing `mdi`, `mdi-` or `mdi:`
- Display info about an icon when hovering
- Highlight unknown icon names
- Browse icons by category
- Fuzzy search icons
- Switch between different versions of MDI

### Intellisense

![Intellisense](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-1.gif)

- `materialdesigniconsIntellisense.iconColor`: RGB color of the preview icon.
- `materialdesigniconsIntellisense.iconSize`: Size of the preview icon in pixels.
- `materialdesigniconsIntellisense.selector`: Languages where completion and hover are active. A list of identifiers can be found [here](https://code.visualstudio.com/docs/languages/identifiers) or when executing the `Change Language Mode` command.
- `materialdesigniconsIntellisense.insertPrefix`: Text inserted before the actual icon name.
- `materialdesigniconsIntellisense.insertSuffix`: Text inserted after the actual icon name.
- `materialdesigniconsIntellisense.includeAliases`: Also include icon aliases in completion items.

### Switching between different versions

![Switching between versions](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/change-mdi-version.gif)

- `materialdesigniconsIntellisense.overrideFontPackagePath`: (not recommended, use `mdiVersion` instead) Override the path to the `@mdi/svg` package. To use a global installation, set this to `<global npm root>/@mdi/svg` where `<global npm root>` is the output of `npm root -g`
- `materialdesigniconsIntellisense.mdiVersion`: `@mdi/svg` version to use. This can either be `latest` or a specific version like `5.2.45`.

### Hover

![Hover](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-2.gif)

- `materialdesigniconsIntellisense.iconColor`: RGB color of the preview icon.
- `materialdesigniconsIntellisense.iconSize`: Size of the preview icon in pixels.
- `materialdesigniconsIntellisense.selector`: Languages where completion and hover are active.

### Search

![Search](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-3.gif)

- `materialdesigniconsIntellisense.iconColor`: RGB color of the preview icon.
- `materialdesigniconsIntellisense.insertPrefix`: Text inserted before the actual icon name.
- `materialdesigniconsIntellisense.insertSuffix`: Text inserted after the actual icon name.
- `materialdesigniconsIntellisense.insertStyle`: Switch between kebab case, camel case and Home Assistant syntax.

### Lint

![Lint](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-4.gif)

- `materialdesigniconsIntellisense.enableLinter`: Lint Home Assistant and kebab case icon names
- `materialdesigniconsIntellisense.ignoredIcons`: Icons ignored by the linter

### camelCase, kebab-case and Home Assistant completion

![camelCase and kebab-case completion](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-6.gif)

## FAQ

### The preview doesn't show up in intellisense

The intellisense preview can be toggled with <kbd>Ctrl</kbd> + <kbd>Space</kbd> by default.
You can also find the shortcut via `Preferences: Open Keyboard Shortcuts` and searching for `toggleSuggestionDetails`.

### Should I use the webfont?

This extension provides intellisense for both `@mdi/font` and `@mdi/js`. Due to the size of the webfont, you should consider using `@mdi/js` instead (read [this guide](https://dev.materialdesignicons.com/guide/webfont-alternatives) for further information).

## Changelog

[CHANGELOG.md](https://github.com/lukas-tr/vscode-materialdesignicons-intellisense/blob/master/CHANGELOG.md)
