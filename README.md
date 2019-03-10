# Material Design Icons Intellisense

Provides intellisense, search and hover preview of Material Design Icons.

## Features

Starts suggesting icon names after typing `mdi-`. Each entry contains a preview image and other information related to the icon, such as the icon category or aliases.

Unknown icon names are highlighted and listed in the Problems panel.

The explorer contains a list of all icons grouped by category. Icons can be filtered using the magnifier icon.

### Intellisense

![feature 1](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-1.gif)

### Hover

![feature 2](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-2.gif)

### Search

![feature 3](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-3.gif)

### Lint

![feature 4](https://raw.githubusercontent.com/lukas-tr/vscode-materialdesignicons-intellisense/master/doc/usage-4.gif)

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

<!-- ## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension. -->

## Release Notes

### 0.0.1

Initial release of Material Design Icons Intellisense

### 1.0.0

- Added settings
  - `materialdesigniconsIntellisense.insertPrefix`
  - `materialdesigniconsIntellisense.insertSuffix`
  - `materialdesigniconsIntellisense.includeAliases`
  - `materialdesigniconsIntellisense.overrideFontPackagePath`
- Added `MDI Explorer` view
- Added icon lint
