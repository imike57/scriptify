# Scriptify

Scriptify is a Visual Studio Code extension that allows you to create and apply JavaScript scripts to the current selection. With Scriptify, you can easily manipulate selected values using custom scripts.

## Features

- Create a new script file: Use the command palette to create a new script file. The action prompts you to enter a name for the script and creates a corresponding script file in the ".scriptify" folder at the root of the currently opened project. The file is pre-filled with a basic template containing a function that takes the current selection value as input and returns the transformed value.

- Apply a script to the selection: Use the command palette to apply a script to the current selection. The extension displays a list of available scripts from the ".scriptify" folder. Selecting a script applies the transformation defined in the script to the selected value.

- Node.js support: The scripts can utilize Node.js functionality, allowing you to perform more complex transformations using the power of JavaScript.

## Getting Started

1. Install the Scriptify extension from the Visual Studio Code Marketplace.

2. Open your project in Visual Studio Code.

3. To create a new script file, open the command palette (Ctrl/Cmd + Shift + P) and search for "[Scriptify]: Create New Script". Enter a name for the script when prompted, and a new script file will be created in the ".scriptify" folder.

4. To apply a script to the current selection, open the command palette (Ctrl/Cmd + Shift + P) and search for "[Scriptify]: Apply Script". Select a script from the displayed list, and the transformation defined in the script will be applied to the selected value.

### Commands

- `[Scriptify]: Create New Script`: Creates a new script in your workspace folder.
- `[Scriptify]: Create New Global Script`: Creates a new script in your global folder.
- `[Scriptify]: Apply Script`: Applies an existing script.
- `[Scriptify]: Download Script from Examples`: Retrieves a list of scripts from the repository and installs them in your local or global folder.
- `[Scriptify]: Switch Download Source for Scripts (Branch or Tag)`: Changes the download source for example scripts. Default: Your current extension version.
- `[Scriptify]: Open the Configuration Panel`: Shortcut to open the configuration panel.
- `[Scriptify]: Open the Global Folder`: Opens the global folder location in your file explorer.

## Configuration

The Scriptify extension provides the following configuration options:

- **Global Folder Location**: Specifies the location of the global folder where global scripts are stored. You can change this setting by updating the `scriptify.globalFolderLocation` configuration value.

- **Script Download Location**: Define a download source for scripts, which can either be a tag or branch of the main repository. By default, the current extension version is used. You can change this setting by updating the `scriptify.scriptDownloadLocation` configuration value.

## Example

### Transform to lowercase a selection
```js
function transform(value) {
  return value.toLowerCase();
}

module.exports = transform;
```

## Using Global Variables

Scripts are evaluated on the fly and inherit exposed functionalities so that they can be used directly in your scripts without prior declaration.

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

### Node.js
Scripts are executed in a Node.js environment. As a result

, you have access to Node.js-specific functionalities such as `fs`, `path`, `http`, and more.

You can import them as usual:

```js
const fs = require('fs');
```

[Node.js API](https://nodejs.org/api/)

### scriptify
The `scriptify` object exposes some tools and methods and can be used directly in your scripts.

#### scriptify.version

`scriptify.version` returns the current extension version.

#### scriptify.axios

Axios is a particularly useful library for making asynchronous requests.

[Axios](https://www.npmjs.com/package/axios)

```js
scriptify.axios.get('...')
```

#### scriptify.log()
The `scriptify.log()` function allows you to add logs to the VS Code output panel directly from your scripts. This can be useful for debugging your scripts or displaying output data.

```js
scriptify.log("Something to log", "Something else")
```

#### scriptify.outputChannel

`scriptify.outputChannel` is an instance of the Scriptify output Channel of VS Code.

```js
scriptify.outputChannel.clear()
```

[OutputChannel](https://code.visualstudio.com/api/references/vscode-api#OutputChannel)

#### scriptify.pkg

`scriptify.pkg` is an instance of `live-plugin-manager`, which allows you to install dependencies on the fly.

To use dependencies in your script, follow these steps:

```js
async function transform(value) {
  await scriptify.pkg.install('lodash');
  const _ = scriptify.pkg.require('lodash');
  return _.camelCase(value);
}

module.exports = transform;
```

### _require()

The `_require()` alias allows you to install dependencies before executing the script.

For example, to import the `kebabCase` function from the `lodash` package, you can use the following code:

```javascript
const _ = _require('lodash');

function transform(value) {
  return _.kebabCase(value);
}

module.exports = transform;
```

## Contributing

Contributions to Scriptify are welcome! If you encounter any issues or have suggestions for improvements, please open an issue in the [GitHub repository](https://github.com/imike57/scriptify/issues).

### Sharing a Script
Have you created a script that you would like to share? Feel free to make a pull request and add your scripts to the `examples` folder of the repository.

## Special Thanks

Special thanks to the following contributors who have helped improve and enhance the Scriptify extension:

- [Jordan Skousen](https://github.com/JordanSkousen): for implementing the support for global scripts and the seamless usage of dependencies using the [live-plugin-manager](https://github.com/davideicardi/live-plugin-manager) package.

## License

This extension is licensed under the MIT License.