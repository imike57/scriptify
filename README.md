# Scriptify

Scriptify is a Visual Studio Code extension that allows you to create and apply JavaScript scripts to the current selection. With Scriptify, you can easily manipulate selected values using custom scripts.

## Features

- Create a new script file: Use the command palette to create a new script file. The action prompts you to enter a name for the script and creates a corresponding script file in the ".scriptify" folder at the root of the currently opened project. The file is pre-filled with a basic template containing a function that takes the current selection value as input and returns the transformed value.

- Apply a script to the selection: Use the command palette to apply a script to the current selection. The extension displays a list of available scripts from the ".scriptify" folder. Selecting a script applies the transformation defined in the script to the selected value.

- Node.js support: The scripts can utilize Node.js functionality, allowing you to perform more complex transformations using the power of JavaScript.

## Getting Started

1. Install the Scriptify extension from the Visual Studio Code Marketplace.

2. Open your project in Visual Studio Code.

3. To create a new script file, open the command palette (Ctrl/Cmd + Shift + P) and search for "Scriptify: Create Script". Enter a name for the script when prompted, and a new script file will be created in the ".scriptify" folder.

4. To apply a script to the current selection, open the command palette (Ctrl/Cmd + Shift + P) and search for "Scriptify: Apply Script". Select a script from the displayed list, and the transformation defined in the script will be applied to the selected value.

### Managing Scripts

- **Global Scripts**: Global scripts are stored in a global folder location. To create a global script, use the `Scriptify: Create Global Script` command. Global scripts can be used across multiple workspaces.
- **Workspace Scripts**: Workspace scripts are stored in the current workspace folder. To create a workspace script, use the `Scriptify: Create Script` command without the global option. Workspace scripts are specific to the current workspace.


## Configuration

The Scriptify extension provides the following configuration options:

- **Global Folder Location**: Specifies the location of the global folder where global scripts are stored. You can change this setting by updating the `scriptify.globalFolderLocation` configuration value.


## Example

### Transform to lowerCase a selection
```js

function transform(value) {
  return value.toLowerCase();
}

module.exports = transform;

```

## Usage of Dependencies in Scripts

The Scriptify extension allows you to use external dependencies in your script files without requiring manual installation. The extension handles the installation of dependencies on-the-fly using the `live-plugin-manager` package.

To use dependencies in your script, follow these steps:

1. In your script file, use the `_require` function provided by Scriptify to import the desired dependency. For example, to import the `kebabCase` function from the `lodash` package, you can use the following code:

```javascript
const _ = _require('lodash');
```

2. You can then use the imported functions or objects from the dependency within your transformation logic. For example, to transform a value using the `kebabCase` function from `lodash`, you can write the following code:

```javascript
function transform(value) {
  return _.kebabCase(value);
}

module.exports = transform;
```
## Using Global Variables

Scripts are evaluated on the fly and inherit exposed functionalities so that they can be used directly in your scripts without prior declaration.

### _log()
The `_log` function is exposed and allows you to add logs to the VS Code output panel directly from your scripts. This can be useful for debugging your scripts or displaying output data.

```js
_log("Something to log")
```

You can also use the global variable [_outputChannel](https://code.visualstudio.com/api/references/vscode-api#OutputChannel) to utilize API methods.

```js
_outputChannel.clear()
```

### vscode
The `vscode` variable is exposed and allows you to interact with the VS Code API directly from your scripts.

For example, you can display an input box to prompt the user for a value:
```js
vscode.window.showInputBox({
  prompt: "Choose something..."
}).then(value => {
  // Do something with the selected value
});
```

[VS Code API](https://code.visualstudio.com/api/references/vscode-api)

### NodeJS
Scripts are executed in a NodeJS environment. As a result, you have access to NodeJS-specific functionalities such as `fs`, `path`, `http`, and more.

You can import them as usual:

```js
const fs = require('fs');
```

[Node JS API](https://nodejs.org/api/)

### _axios
Axios is a particularly useful library for making asynchronous requests. It is not compatible with the use of `_require()`. However, we have exposed it under the global variable `_axios`.

[Axios](https://www.npmjs.com/package/axios)

## Contributing

Contributions to Scriptify are welcome! If you encounter any issues or have suggestions for improvements, please open an issue in the [GitHub repository](https://github.com/imike57/scriptify/issues).

### Partager un script
Vous avez créé un script que vous souhaitez partager ? N'hésitez pas à faire une pull-request et ajouter vos scripts dans le dossier `examples` du repository. 

## Special Thanks

Special thanks to the following contributors who have helped improve and enhance the Scriptify extension:

- [Jordan Skousen](https://github.com/JordanSkousen): for implementing the support for global scripts and the seamless usage of dependencies using the [live-plugin-manager](https://github.com/davideicardi/live-plugin-manager) package.


## License

This extension is licensed under the MIT License.

