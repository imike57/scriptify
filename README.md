# Scriptify Monorepo

This monorepo contains the source code for the Scriptify extension for Visual Studio Code, as well as various packages and scripts that can be used with the extension.

## Structure

The monorepo follows the following structure:

```
root
├── extension
│   └── (code for the Scriptify extension)
└── packages
    └── (published packages)
```

- The `extension` directory contains the source code for the Scriptify extension. This is where you can find the implementation of the extension's functionality, including script execution, configuration management, and user interface components.

- The `packages` directory houses published packages and scripts that can be used with the Scriptify extension. These packages are published on npm and can be easily installed and utilized within the extension. 

## Getting Started

To get started with the Scriptify monorepo, follow these steps:

1. Clone the repository:

   ```
   git clone https://github.com/imike57/scriptify
   ```

2. Navigate to the `root` directory of the monorepo:

   ```
   cd scriptify
   ```

3. Install the dependencies using [pnpm](https://pnpm.io/):

   ```
   pnpm install
   ```

   This will install the dependencies for both the Scriptify extension and any packages/scripts in the `packages` directory.

4. Build the Scriptify extension:

   ```
   cd extension
   pnpm run build
   ```

   This will compile the TypeScript code and generate the necessary files for the extension.

5. Start debugging the extension:

   - Press `F5` to start the extension in debug mode.
   - This will launch a new instance of Visual Studio Code with the Scriptify extension enabled.

6. Explore and contribute:

   - You can now explore the source code of the extension and the packages/scripts in the `packages` directory.
   - Feel free to make changes, add new packages/scripts, or contribute to existing code.
   - To test your changes, follow the build steps outlined in Step 4 and restart the debugging session.

## Contributing

Contributions to the Scriptify monorepo are welcome! If you would like to contribute, please create a pull request.

## Known Issue

Currently, the `vsce` utility is not fully functional with `pnpm`. As a result, we pre-compile the extension using esbuild before creating the dependency-free package using `vsce package --no-dependencies`.

### References

- [vsce pnpm support. How I make VSCode Extension Manager… | by Feng Yu | Medium](https://medium.com/@fengyu214/vsce-support-16014c35bc3c)
- [Support pnpm · Issue #421 · microsoft/vscode-vsce](https://github.com/microsoft/vscode-vsce/issues/421)
  
## License

The Scriptify monorepo is open-source software licensed under the [MIT License](./LICENSE.txt). Please see the `LICENSE` file for more information.