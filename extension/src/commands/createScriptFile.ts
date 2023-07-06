import * as vscode from 'vscode';
import { writeScriptFile } from "../utils/writeScriptFile";
import { PackageJSON } from "../defs/PackageJSON";
import { ScriptScope } from "../classes/ScriptScope";
import { ClientConfig } from '../classes/ClientConfig';
import { scriptsTreeProvider } from '../extension';

/**
 * Creates a script file in the current workspace or globally.
 * @param createGlobally Specifies whether to create the script globally.
 */
export async function createScriptFile() {

  const scope: { label: string; value: ScriptScope; } | undefined = await vscode.window.showQuickPick([{ label: "Globally", value: ScriptScope.global }, { label: "Locally", value: ScriptScope.local }]);

  if (!scope) {
    return;
  }

  // Check or create config file
  await new ClientConfig(scope.value).load();

  vscode.window.showInputBox({
    prompt: "Enter script name",
    validateInput: (value) => {
      const rgx = /^(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/)?[a-z0-9-~][a-z0-9-._~]*$/;

      if (!(value && rgx.test(value))) {
        return "Please enter a valid package name";
      }
    }
  }).then(scriptName => {
    if (scriptName) {
      const packageJSONFile: PackageJSON = {
        "name": `@scriptify-vscode/${scriptName}`,
        "displayName": `${scriptName}`,
        "version": "0.0.0",
        "description": "",
        "main": "index.js",
        "scripts": {
          "test": "echo \"Error: no test specified\" && exit 1"
        },
        "keywords": [],
        "author": "scriptify",
        "license": "ISC",
        "dependencies": {},
        "devDependencies": {},
        "scriptify": {
          "name": "",
          "description": ""
        }
      };


      const scriptContent = `
function transform(value) {
  // TODO: Implement your transformation logic here
  return \`Hello \${value}\`;
}

module.exports = transform;
`;

      writeScriptFile(packageJSONFile, scriptContent, scope.value).then(res => {
        scriptsTreeProvider.refresh();
      });

    }
  });
}
