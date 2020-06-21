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

- Suggest icon names after typing `mdi`, `mdi-` or `mdi:` (can be changed)
- Display info about an icon when hovering
- Display icon preview as decoration
- Highlight unknown icon names
- Browse icons by category
- Fuzzy search icons
- Switch between different versions of MDI

### Intellisense

![Intellisense](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/completion.png)

- `materialdesigniconsIntellisense.iconColor`: RGB color of the preview icon.
- `materialdesigniconsIntellisense.iconSize`: Size of the preview icon in pixels.
- `materialdesigniconsIntellisense.selector`: Languages where completion and hover are active. Languages can be set through the `MDI: Select languages` command.
- `materialdesigniconsIntellisense.includeAliases`: Also include icon aliases in completion items.

### Hover

![Hover](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/hover.png)

- `materialdesigniconsIntellisense.iconColor`: RGB color of the preview icon.
- `materialdesigniconsIntellisense.iconSize`: Size of the preview icon in pixels.
- `materialdesigniconsIntellisense.selector`: Languages where completion and hover are active.

### Decoration

![Decoration](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/decoration.png)

- `materialdesigniconsIntellisense.iconColor`: RGB color of the preview icon.
- `materialdesigniconsIntellisense.enableDecorations`: Show decorations

### Explorer

![Explorer](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/explorer.gif)

- `materialdesigniconsIntellisense.iconColor`: RGB color of the preview icon.
- `materialdesigniconsIntellisense.insertStyle`: Switch between kebab case, camel case and Home Assistant syntax.

### Configuration

![Configuration](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/configuration.gif)

- `materialdesigniconsIntellisense.mdiVersion`: `@mdi/svg` version to use. This can either be `latest` or a specific version like `5.2.45`.
- `materialdesigniconsIntellisense.overrideFontPackagePath`: (not recommended, use `mdiVersion` instead) Override the path to the `@mdi/svg` package. To use a global installation, set this to `<global npm root>/@mdi/svg` where `<global npm root>` is the output of `npm root -g`

### Search

![Search](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/search.gif)

### Lint

![Lint](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-4.gif)

- `materialdesigniconsIntellisense.enableLinter`: Lint Home Assistant and kebab case icon names
- `materialdesigniconsIntellisense.ignoredIcons`: Icons ignored by the linter

## FAQ

### The preview doesn't show up in intellisense

The intellisense preview can be toggled with <kbd>Ctrl</kbd> + <kbd>Space</kbd> by default.
You can also find the shortcut via `Preferences: Open Keyboard Shortcuts` and searching for `toggleSuggestionDetails`.

### Should I use the webfont?

This extension provides intellisense for both `@mdi/font` and `@mdi/js`. Due to the size of the webfont, you should consider using `@mdi/js` instead (read [this guide](https://dev.materialdesignicons.com/guide/webfont-alternatives) for further information).

### How to add support for other libraries?

You can add custom matchers to `materialdesigniconsIntellisense.matchers`. [Create an issue](https://github.com/lukas-tr/vscode-materialdesignicons-intellisense/issues/new) or [add a pull request](https://github.com/lukas-tr/vscode-materialdesignicons-intellisense/pulls) if your matcher should be available to other people.

```json
{
    "match": "\\bmdi:{param}\\b", // regex for hover, decoration and completion, possible cases below
    "insert": "mdi:{param}", // insert from explorer
    "displayName": "kebab-case (web font)", // shown by `materialdesigniconsIntellisense.changeInsertStyle` command
    "name": "kebabCase" // any string, should be unique
}
```

Cases:

- `{camel}` accessPoint
- `{param}` access-point
- `{pascal}` AccessPoint
- `{constant}` ACCESS_POINT
- `{dot}` access.point
- `{header}` Access-Point
- `{no}` access point
- `{path}` access/point
- `{snake}` access_point

## Changelog

[CHANGELOG.md](https://github.com/lukas-tr/vscode-materialdesignicons-intellisense/blob/master/CHANGELOG.md)
