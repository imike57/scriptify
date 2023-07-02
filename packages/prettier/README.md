# @scriptify-vscode/prettier

This script is designed to be used with the VS Code extension ["Scriptify"](https://marketplace.visualstudio.com/items?itemName=scriptify.scriptify). It allows you to transform code using the Prettier code formatter with customizable parser options.

## Configuration

Make sure to have a `.prettierrc.json` file in your workspace directory if you want to use custom Prettier configuration options. The script will automatically search for this file in the workspace.

## Example

1. Open a file in your VS Code editor.
2. Select the code you want to transform.
3. Run the script using the "Scriptify" extension.
4. A quick pick menu will appear with a list of available Prettier parsers.
5. Select a parser from the list.
6. The script will apply the Prettier formatter to the selected code using the selected parser and any custom configuration options from the `.prettierrc.json` file.
7. The transformed code will be displayed in the VS Code output channel.


## References

- [Scriptify Extension](https://marketplace.visualstudio.com/items?itemName=scriptify.scriptify)
- [Prettier GitHub Repository](https://github.com/prettier/prettier)
