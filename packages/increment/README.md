# @scriptify-vscode/increment

This script is designed to be used with the VS Code extension ["Scriptify"](https://marketplace.visualstudio.com/items?itemName=scriptify.scriptify). It allows you to increment a value based on a given input.


## Example

1. Open a JSON file in your VS Code editor.
2. Select the values you want to increment using multiple cursors.
3. Run the script using the "Scriptify" extension.
4. The script will increment each selected value based on the given input.
   - If a value is a number, it will increment the number by the specified increment value.
   - If a value is a string, it will increment the next character in the string by the specified increment value.
   - If a value is neither a number nor a string, it will return the value unchanged.
5. The result will be updated in the editor with the incremented values.

**Note:** Make sure the values and increment input are compatible (e.g., values are numbers for numeric increment). Unexpected input types may lead to unexpected results.

## References

- [Scriptify Extension](https://marketplace.visualstudio.com/items?itemName=scriptify.scriptify)

