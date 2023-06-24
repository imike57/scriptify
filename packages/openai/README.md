# @scriptify-vscode/openai

This script should be used with the ["Scriptify"](https://marketplace.visualstudio.com/items?itemName=scriptify.scriptify) VS Code extension.

## Configuration

In your `scriptify.json` file, add environment variables to define your API key and any prompts if necessary.

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