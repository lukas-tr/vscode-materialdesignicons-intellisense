# Material Design Icons Intellisense

Provides intellisense, search and hover preview of Material Design Icons.

This extension provides intellisense for both `@mdi/font` and `@mdi/js`. Due to the size of the webfont, you should consider using `@mdi/js` (read [this guide](https://dev.materialdesignicons.com/guide/webfont-alternatives) for further information).

[Install from VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=lukas-tr.materialdesignicons-intellisense)

## Features

Starts suggesting icon names after typing `mdi` (camelCase), `mdi-` (kebab-case) or `mdi:` (YAML/Home Assistant). Each entry contains a preview image and other information related to the icon, such as the icon category or aliases.

Unknown icon names are highlighted and listed in the Problems panel - kebab-case and Home Assistant only (use tslint/eslint for `@mdi/js`).

The explorer contains a list of all icons grouped by category. Icons can be filtered using the magnifier icon. You can use the `materialdesigniconsIntellisense.insertStyle` setting to change the syntax of the inserted snippet.

If too much text is deleted after inserting an icon, you can add the current language to `materialdesigniconsIntellisense.kebabCase.noTextDeletionLanguages`, `materialdesigniconsIntellisense.camelCase.noTextDeletionLanguages` or `materialdesigniconsIntellisense.homeAssistant.noTextDeletionLanguages`. See [#3](https://github.com/lukas-tr/vscode-materialdesignicons-intellisense/issues/3) for an explanation.

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
- `materialdesigniconsIntellisense.kebabCase.noTextDeletionLanguages`: Already typed text won't be inserted for these langauges. A list of identifiers can be found [here](https://code.visualstudio.com/docs/languages/identifiers) or when executing the `Change Language Mode` command.
- `materialdesigniconsIntellisense.camelCase.noTextDeletionLanguages`: Already typed text won't be inserted for these langauges. A list of identifiers can be found [here](https://code.visualstudio.com/docs/languages/identifiers) or when executing the `Change Language Mode` command.
- `materialdesigniconsIntellisense.homeAssistant.noTextDeletionLanguages`: Already typed text won't be inserted for these langauges. A list of identifiers can be found [here](https://code.visualstudio.com/docs/languages/identifiers) or when executing the `Change Language Mode` command.

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

### 1.0.1

- Also use `materialdesigniconsIntellisense.insertPrefix` and `materialdesigniconsIntellisense.insertSuffix` for inserting from tree view instead of hardcoded prefix and suffix.

### 1.1.0

- Added setting `materialdesigniconsIntellisense.insertStyle` to insert either kebab-case or camelCase icon names from tree view
- Completion now works for both kebab-case and camelCase icon names
- Hovering camelCase icon names also shows previews

### 1.2.0

- Add `homeAssistant` to `materialdesigniconsIntellisense.insertStyle`
- Provide completions for Home Assistant icon names
- Provide lint for Home Assistant icon names
- Provide hover preview for Home Assistant icon names
- Suggest completions when pressing <kbd>ctrl</kbd> + <kbd>space</kbd> even when the last character is not `i`, `-` or `:`
- Delete already existing text after inserting snippet (previously, typing `mdi-acc` + <kbd>enter</kbd> would result in `mdi-mdi-account` in `.js` files, now results in `mdi-account`)
- Set `materialdesigniconsIntellisense.insertPrefix`'s default value to `""`

### 1.2.1

- Add a logo

### 1.2.2

- Update theme and logo

### 1.3.0

- Added settings
  - `materialdesigniconsIntellisense.kebabCase.noTextDeletionLanguages`
  - `materialdesigniconsIntellisense.camelCase.noTextDeletionLanguages`
  - `materialdesigniconsIntellisense.homeAssistant.noTextDeletionLanguages`

### 1.3.1

- Updated dependencies
