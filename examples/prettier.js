const fs = require('fs');
const path = require('path');
/**
 * Retrieves the local configuration by searching for a .prettierrc.json file in the workspace.
 * @returns {Promise<Object|null>} A promise that resolves to the parsed content of the .prettierrc.json file, or null if the file doesn't exist.
 */
function getLocalConfiguration() {
  return new Promise((resolve, reject) => {

    if (vscode.workspace.workspaceFolders.length) {
      const localWorkspace = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const filePath = path.join(localWorkspace, ".prettierrc.json");

      // Search for .prettierrc.json
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          resolve(null);
          return;
        }

        // Read file
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            reject('Error while reading file', err);
            return;
          }
          const fileContent = data;
          resolve(JSON.parse(fileContent));
        });
      });
    } else {
      resolve(null);
    }
  });
}
/**
 * Transforms the input value using Prettier.
 * @param {string} value - The input value to transform.
 * @returns {Promise<string>} A promise that resolves to the transformed value.
 */
async function transform(value) {
  const localConfiguration = await getLocalConfiguration();
  await scriptify.pkg.install("prettier");

  const prettier = scriptify.pkg.require("prettier/standalone");
  const plugins = [
    scriptify.pkg.require("prettier/parser-babel"),
    scriptify.pkg.require("prettier/parser-yaml"),
    scriptify.pkg.require("prettier/parser-angular"),
    scriptify.pkg.require("prettier/parser-babel"),
    scriptify.pkg.require("prettier/parser-espree"),
    scriptify.pkg.require("prettier/parser-flow"),
    scriptify.pkg.require("prettier/parser-glimmer"),
    scriptify.pkg.require("prettier/parser-graphql"),
    scriptify.pkg.require("prettier/parser-html"),
    scriptify.pkg.require("prettier/parser-markdown"),
    scriptify.pkg.require("prettier/parser-meriyah"),
    scriptify.pkg.require("prettier/parser-postcss"),
    scriptify.pkg.require("prettier/parser-typescript")
  ];

  const parserList = ["babel", "yaml", "angular", "babel", "espree", "flow", "glimmer", "graphql", "html", "markdown", "meriyah", "postcss", "typescript"];

  try {

    return vscode.window.showQuickPick(parserList, {
      title: `Select a parser`
    }).then(parserValue => {
      if (parserValue) {

        return prettier.format(value, {...{
          parser: parserValue,
          plugins: plugins,
        }, ...localConfiguration});

      }

      return value;
    });

  } catch (error) {
    scriptify.log("error", error);
  }
}

module.exports = transform;