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

## Contributing

Contributions to Scriptify are welcome! If you encounter any issues or have suggestions for improvements, please open an issue in the [GitHub repository](https://github.com/imike57/scriptify/issues).

## License

This extension is licensed under the MIT License.

