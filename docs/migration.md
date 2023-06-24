# Scriptify 1.x to 2.x Migration

## Differences

1. User-created scripts are now executed using the VM2 library for increased isolation and security.
2. Scripts are treated as executable packages, allowing them to have dependencies like any other Node.js package.
3. A configuration file, [scriptify.json]("./scriptify.json.md"), has been introduced to define script properties.
4. Properties in [scriptify.json]("./scriptify.json.md") include environment variables, script activation/deactivation, and file path.
5. Adding dependencies to a script now follows the standard Node.js dependency management using package.json and npm/yarn/pnpm.
6. Scripts can be shared and downloaded from the npm registry under the `@scriptify-vscode` scope.

## Modifications to Make

Consider the following key modifications when migrating to version 2:

1. **Script Structure Changes**:
   - Scripts should now be structured as Node.js packages with a `package.json` file containing dependencies and script information.
   - Move the script code to a specified file in `package.json` (typically `index.js`).

2. **Create a `scriptify.json` Configuration File**:
   - Create a `scriptify.json` file at the root of your project.
   - Define the necessary properties for each script, such as environment variables, activation/deactivation, and file path.

3. **Add Dependencies**:
   - Use the standard package manager (npm, yarn, pnpm) to add dependencies to scripts.
   - Declare the required dependencies in the script's `package.json` file.

4. **Changes to Script Execution**:
   - Scripts are now executed using the VM2 library.
   - Environment variables can be defined for script execution.

5. **Download Scripts from the npm Registry**:
   - Scripts can be downloaded from the npm registry using standard package managers (npm, yarn, pnpm).

6. **Removal of Global Variables from version 1.x**:
   - In the previous version, certain functionalities were exposed globally.
   - `_require()` has been removed. Use `require()` as in other Node.js scripts and install dependencies using `npm`.
   - `_log()` has been removed. Use `console` to log directly in the Scriptify output window. You can use `console.log()`, `console.error()`, `console.table()`, `console.clear()`, and others.
   - `_axios` has been removed from the global environment. You can add it as a dependency to your scripts and import it using `const axios = require('axios')`.

## Migrating Your Scripts

You can easily make your existing scripts compatible with Scriptify 2.

- Run the command `(Ctrl/Cmd + Shift + P)`.
- Select `[Scriptify]: Create New Script` or `[Scriptify]: Create New Global Script`.
- Enter the name of your script.
- The package will be created in the `.scriptify/my-modules/@scriptify-vscode/<PACKAGE_NAME>` folder.
- Paste your code into the `.scriptify/my-modules/@scriptify-vscode/<PACKAGE_NAME>/index.js` file.
- Adjust your code if necessary to replace usage of deprecated global variables.

When creating a new script, it will automatically be added to your `scriptify.json` configuration file and can be accessed using the `[Scriptify]: Apply script` command.

Please refer to the `packages` directory in the repository for examples.

## Sharing Your Scripts

Your scripts are now npm-compatible packages. You can publish and share them with the community on the npm repository.