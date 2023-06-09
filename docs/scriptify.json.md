# scriptify.json

This file is automatically created during the installation or creation of a new scriptify package. It is used to define a configuration for the packages available in your environment.

Depending on the location of your scripts, the `scriptify.json` file will be present in your global installation folder and/or in the folder of your local workspace under the `.scriptify/scriptify.json` directory.

Since version 2.3.0 of Scriptify, the configuration file includes a `$schema` property that points to the JSON schema validation. This schema validation provides guidance for defining your configuration accurately.

## Structure

```typescript
interface ScriptifyJSON {
    /** Modules object */
    modules: {

        /** Module name */
        [key: string]: {
            
            /** If `true`, the module is available in the scripts list. */
            enabled: boolean;

            /** Allows defining a local path for the script. It should point to the package folder that contains the `package.json` file. 
             * - This property is usually required for locally created scripts.
             * - By default, the script is searched in `node_modules/<package_name>`, which is the default location for downloaded scripts.
            */
            path?: string;

            /** An object that will be included as an environment variable under `process.env`. */
            env?: any;

            /**
             * Output location selection.
             * - `selection`: The function result replaces the current selection.
             * - `outputChannel`: The function result is displayed in the output channel.
             * - `file`: The function result is displayed in a new file.
             * - `none`: Do nothing with the result.
             * @default selection
             */
            out?: "selection" | "outputChannel" | "file" | "none";
        };
    }
}
```

### Example 1
Here is an example used with the `@scriptify-vscode/openai` package.

```json
{
    "modules": {
        "@scriptify-vscode/openai": {
            "enabled": true,
            "env": {
                "API_KEY": "sk-xxxxxx",
                "PROMPTS": [
                    {
                        "label": "None (The current selection is the prompt.)",
                        "value": ""
                    },
                    {
                        "label": "Refactor this Javascript code",
                        "value": "You are a Javascript expert. Refactors and optimizes this code."
                    }
                ]
            }
        }
    }
}
```

In this example, Scriptify expects to find the `@scriptify-vscode/openai` package in your configuration. Environment variables have been added, and they will be available to the script through `process.env`.

### Example 2

Here is the definition of a locally created script.

```json
{
    "modules": {
        "@scriptify-vscode/openai": {
            "enabled": true,
            "path": "./my-modules/@scriptify-vscode/my-nice-package",
        }
    }
}
```