# @scriptify-vscode/openai

This script is designed to be used with the VS Code extension ["Scriptify"](https://marketplace.visualstudio.com/items?itemName=scriptify.scriptify). It utilizes the OpenAI API to generate completions based on the provided prompt.

## Configuration

To use this script, make sure you have the following configuration set in your `scriptify.json` file:

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

Make sure to replace `"sk-xxxxxx"` with your actual OpenAI API key.

## Usage

1. Configure the `API_KEY` and `PROMPTS` environment variables in your `scriptify.json` file.
2. Open a file in your VS Code editor.
3. Select the code you want to generate completions for.
4. Run the script using the "Scriptify" extension.
5. If prompts are available, a quick pick menu will appear to select a prompt. If not, the current selection will be used as the prompt.
7. The script will send a request to the OpenAI API with the prompt and generate completions.
8. The generated completions will be displayed in the VS Code output channel.

**Note:** Make sure you have a valid OpenAI API key and prompts configured in order to use this script effectively.

## References

- [Scriptify Extension](https://marketplace.visualstudio.com/items?itemName=scriptify.scriptify)
- [OpenAI API](https://openai.com/)
- [OpenAI API Documentation](https://docs.openai.com/)
