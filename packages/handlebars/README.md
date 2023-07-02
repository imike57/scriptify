# @scriptify-vscode/handlebars

This script is designed to be used with the ["Scriptify"](https://marketplace.visualstudio.com/items?itemName=scriptify.scriptify) extension for VS Code.

## Configuration

To configure the script, open your `scriptify.json` file and add the following configuration:

```json
"@scriptify-vscode/handlebars": {
    "enabled": true,
    "out": "file",
    "env": {
        "templateFolderPath": "./tpl"
    }
}
```

In this configuration, make sure to set the `templateFolderPath` environment variable to the location of your Handlebars templates.

## Example

Consider the following Handlebars template located at `./tpl/helloworld.hbs`:

```hbs
Hello {{#if name}}{{name}}{{else}}world !{{/if}}
```

To apply the script, select the JSON data you want to process. For example, let's assume we have the following JSON:

```json
{ "name" : "John DOE" }
```

After selecting the JSON data, apply the script using the Scriptify extension. The script will process the selected JSON data with the Handlebars template and generate the corresponding output.

## References

- [Handlebars API Reference](https://handlebarsjs.com/api-reference/)