# Creating Scripts

To create scripts for the Scriptify extension, you can take inspiration from [existing packages](https://github.com/imike57/scriptify/tree/main/packages) or create your own from scratch.

## Package Configuration

Before publishing a package, it is important to provide the `scriptify` property in the `package.json` file. This property allows you to customize the display name and description of your package in the Scriptify interface.

Example `package.json`:

```json
{
  "name": "@scriptify-vscode/my-script-package",
  "version": "1.0.0",
  "description": "My awesome script package",
  "scriptify": {
    "name": "My Script Package",
    "description": "This package contains some useful scripts for enhancing your workflow.",
    "defaultEnv": {
      "ENV_VAR_1": "value1",
      "ENV_VAR_2": "value2"
    }
  }
}
```

**Note:** To make your package accessible from the Scriptify extension's download interface, it must have the scope `"scriptify-vscode"` in its name, as shown in the example above.

The `scriptify` property consists of the following fields:

- `name` (optional): The display name of your package in the Scriptify interface. If not provided, the `name` field from `package.json` will be used.
- `description` (optional): A brief description of your package. This will be displayed in the Scriptify interface.
- `defaultEnv` (optional): Default environment variables that will be added to the `scriptify.json` file when the package is installed. This allows you to provide default values for environment variables used in your scripts.



## README.md

To provide more detailed information about your script package, it is recommended to include a `README.md` file in the package. This file will be accessible from the Scriptify interface and will open automatically after the package is installed.

The `README.md` file should describe the behavior of the package, its usage instructions, and any configuration properties or options available. It is a good practice to include examples and provide clear explanations to help users understand and make the most out of your script package.

Make sure to format your `README.md` file using Markdown syntax to ensure proper rendering when opened in the Scriptify interface.

## scriptify.json

After installing a script package, a `scriptify.json` file is created in the root directory of your project. This file contains the configuration for each installed script package, including the package name, enabled status, and any custom environment variables.

Example `scriptify.json`:

```json
{
  "packages": {
    "my-script-package": {
      "enabled": true,
      "env": {
        "ENV_VAR_1": "value1",
        "ENV_VAR_2": "value2"
      }
    }
  }
}
```

You can manually edit the `scriptify.json` file to enable or disable specific packages or modify the environment variables for each package.

## Installation

To install a script package, follow these steps:

1. Open the Command Palette in Visual Studio Code (Ctrl+Shift+P).
2. Search for "Scriptify: Download Script" and select it.
3. Browse or search for the script package you want to install.
4. Choose the installation location (global or local).
5. Wait for the installation to complete. A progress notification will be shown.
6. After installation, the package will be available in the Scriptify interface.

## Managing Packages

To manage installed script packages, use the Scriptify interface. You can access it through the Visual Studio Code sidebar or by running the "Scriptify: Open Scripts" command from the Command Palette.

In the Scriptify interface, you can enable or disable packages, customize environment variables, and access the documentation or README files of each package.