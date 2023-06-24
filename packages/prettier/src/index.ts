declare var scriptify:any;
import fs from 'fs';
import path from 'path';
import vscode from 'vscode';
import prettier from "prettier/standalone";
import { Options } from 'prettier';
const plugins = [
  require("prettier/parser-babel"),
  require("prettier/parser-yaml"),
  require("prettier/parser-angular"),
  require("prettier/parser-babel"),
  require("prettier/parser-espree"),
  require("prettier/parser-flow"),
  require("prettier/parser-glimmer"),
  require("prettier/parser-graphql"),
  require("prettier/parser-html"),
  require("prettier/parser-markdown"),
  require("prettier/parser-meriyah"),
  require("prettier/parser-postcss"),
  require("prettier/parser-typescript")
];


/**
 * Retrieves the local configuration by searching for a .prettierrc.json file in the workspace.
 * @returns {Promise<Object|null>} A promise that resolves to the parsed content of the .prettierrc.json file, or null if the file doesn't exist.
 */
function getLocalConfiguration() {
  return new Promise<Options | null>((resolve, reject) => {

    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length) {
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
            reject(`Error while reading file: ${err.message}`);
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
async function transform(value:string) {
  const localConfiguration = await getLocalConfiguration();
  const parserList = ["yaml", "angular", "babel", "espree", "flow", "glimmer", "graphql", "html", "markdown", "meriyah", "postcss", "typescript"].sort();

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