# Change Log

All notable changes to the "materialdesignicons-intellisense" extension will be documented in this file.

## 0.0.1

Initial release of Material Design Icons Intellisense

## 1.0.0

- Added settings
  - `materialdesigniconsIntellisense.insertPrefix`
  - `materialdesigniconsIntellisense.insertSuffix`
  - `materialdesigniconsIntellisense.includeAliases`
  - `materialdesigniconsIntellisense.overrideFontPackagePath`
- Added `MDI Explorer` view
- Added icon lint

## 1.0.1

- Also use `materialdesigniconsIntellisense.insertPrefix` and `materialdesigniconsIntellisense.insertSuffix` for inserting from tree view instead of hardcoded prefix and suffix.

## 1.1.0

- Added setting `materialdesigniconsIntellisense.insertStyle` to insert either kebab-case or camelCase icon names from tree view
- Completion now works for both kebab-case and camelCase icon names
- Hovering camelCase icon names also shows previews

## 1.2.0

- Add `homeAssistant` to `materialdesigniconsIntellisense.insertStyle`
- Provide completions for Home Assistant icon names
- Provide lint for Home Assistant icon names
- Provide hover preview for Home Assistant icon names
- Suggest completions when pressing <kbd>ctrl</kbd> + <kbd>space</kbd> even when the last character is not `i`, `-` or `:`
- Delete already existing text after inserting snippet (previously, typing `mdi-acc` + <kbd>enter</kbd> would result in `mdi-mdi-account` in `.js` files, now results in `mdi-account`)
- Set `materialdesigniconsIntellisense.insertPrefix`'s default value to `""`

## 1.2.1

- Add a logo

## 1.2.2

- Update theme and logo

## 1.3.0

- Added settings
  - `materialdesigniconsIntellisense.kebabCase.noTextDeletionLanguages`
  - `materialdesigniconsIntellisense.camelCase.noTextDeletionLanguages`
  - `materialdesigniconsIntellisense.homeAssistant.noTextDeletionLanguages`

## 1.3.1

- Updated dependencies

## 1.3.2

- Updated dependencies

## 1.4.0

- Hide `materialdesigniconsIntellisense.performIconSearch` and `materialdesigniconsIntellisense.openIconPreview` from the command palette
- Add `materialdesigniconsIntellisense.changeInsertStyle` command

## 1.5.0

- Add `home-assistant` to `materialdesigniconsIntellisense.selector` (see [#4](https://github.com/lukas-tr/vscode-materialdesignicons-intellisense/pull/4))
- Add `materialdesigniconsIntellisense.enableLinter` setting

## 1.5.1

- Updated dependencies

## 1.5.2

- Updated dependencies
- Fix `` property `title` is mandatory and must be of type `string` or `object` `` warning

## 1.5.3

- Updated dependencies

## 1.5.4

- Fix `diagnosticCollection` being `undefined`

## 1.5.5

- Updated dependencies

## 1.5.6

- Updated dependencies
- Added ability to ignore certain icon names (linter)

## 1.5.7

- Updated dependencies

## 1.5.8

- Updated readme

## 1.5.9

- Updated dependencies

## 2.0.0

- Removed settings (those should no longer be necessary after adding `range` to the completion)
  - `materialdesigniconsIntellisense.kebabCase.noTextDeletionLanguages`
  - `materialdesigniconsIntellisense.camelCase.noTextDeletionLanguages`
  - `materialdesigniconsIntellisense.homeAssistant.noTextDeletionLanguages`
- `materialdesigniconsIntellisense.iconColor` is now also applied to icons in the tree view
- Icon search now uses `fuse.js`
- Added ability to change MDI version

## 2.0.1

- Improved logging

## 2.0.2

- Improved readme

## 3.0.0

- Added editor decorations
- Updated readme
- Removed settings
  - `materialdesigniconsIntellisense.insertPrefix`
  - `materialdesigniconsIntellisense.insertSuffix`
- Changed settings
  - `materialdesigniconsIntellisense.insertStyle`
- Added settings
  - `materialdesigniconsIntellisense.matchers`
  - `materialdesigniconsIntellisense.enableDecorations`
- Added commands
  - `materialdesigniconsIntellisense.changeSettings`
