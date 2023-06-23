// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import axios from "axios";
import { getClientConfig, getFavoritePackageManager, getGlobalFolder, getScriptFiles, getScriptFolder, getVersion, writeScriptFile } from './utils';
import { GithubFile, PackageJSON, ScriptFile } from './types';
import { Scriptify } from './Scriptify';
import { NodeVM, VMScript, VM } from "vm2";
import { NpmResponse } from './NpmResponse';

/** Provide some features in script */
export const scriptify = new Scriptify();

/**
 * Downloads a script from a GitHub repository and allows the user to choose to install it globally or locally.
 */
function downloadScript(keyword?:string) {
  const compatibleVersion = vscode.workspace.getConfiguration('scriptify').get<string>("scriptDownloadLocation") || getVersion();

  const npmScopedAPI = `https://registry.npmjs.org/-/v1/search?text=scope:scriptify-vscode${keyword ? `+${keyword}` : ''}&size=250`;

  
  axios<NpmResponse>({
    method: "get",
    url: npmScopedAPI,
    responseType: "json"
  }).then(results => {

    const base = [
      {
        label: "Search"
      },
      {
        label: "",
        kind: vscode.QuickPickItemKind.Separator
      }
    ];

    const list = results.data.objects.map(entry => {
      return {
        label: entry.package.name,
        description: entry.package.description,
        data: entry
      };
    });


    vscode.window.showQuickPick([...base,...list], { 
      title: `Select a script (${compatibleVersion})`
    }).then(async scriptChoice => {

      if (scriptChoice) {

        if (scriptChoice.label === "Search") {

          vscode.window.showInputBox({
            title: "Search a package"
          }).then(keyword => {

            return downloadScript(keyword);
          });
      

        } else {
          const terminal = vscode.window.createTerminal("scriptify");

          terminal.show();

          terminal.sendText(`cd ${await getScriptFolder(false)}`);

          const installCommands = {
            npm: "npm i",
            pnpm: "pnpm add",
            yarn: "yarn add"
          };

          

          terminal.sendText(`${installCommands[getFavoritePackageManager()]} ${scriptChoice.label}`);

        }
      }
    });
  });
}


/**
 * Creates a script file in the current workspace or globally.
 * @param createGlobally Specifies whether to create the script globally.
 */
async function createScriptFile(createGlobally = false) {

  // Check or create config file
  const clientConfig = await getClientConfig(createGlobally);

  console.log(clientConfig);

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
      const packageJSONFile:PackageJSON = {
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

      writeScriptFile(packageJSONFile, scriptContent, createGlobally);

    }
  });
}


/**
 * Creates a global script file.
 */
function createGlobalScriptFile() {
  createScriptFile(true);
}


async function executeVM(scriptString:string, scriptFile:ScriptFile ){

  const rootPath = await getScriptFolder(scriptFile.location === "global");

  console.log("scriptFile", scriptFile);

  const vm = new NodeVM({
    sandbox: {
      scriptify: scriptify
    },
    require: {
      builtin: ['*'],
      external: {
        transitive: true,
        modules: ['*']
      },
      mock: {
        vscode: vscode,
        scriptify: scriptify
      }
    }
  });

  // Call the script
  const transform = new VMScript(scriptString, scriptFile.uri );


  console.log("transform", transform);

    
  return vm.run(transform);
  
}

/**
 * Applies a script to the selected text in the active editor.
 */
async function applyScript() {

  let files: Array<ScriptFile> = [];
  try {
    let localesFiles = await getScriptFiles("local");
    let globalFiles = await getScriptFiles("global");
    files = [...localesFiles, ...globalFiles].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  } catch (err) {
    return vscode.window.showErrorMessage(`${err}`);
  }

  if (files.length === 0) {
    vscode.window.showErrorMessage('No scripts found.');
    return;
  }
  
  vscode.window.showQuickPick(files.map(scriptFile => { 
    return { 
      label : scriptFile.name, 
      description: scriptFile.location, 
      detail: scriptFile.description,
      data: scriptFile
    }; 
  }), {
    placeHolder: 'Select a script to apply'
  }).then(async scriptChoice => {
    if (scriptChoice) {
      try {
        const scriptPath = scriptChoice.data.uri;
        console.log("scriptPath", scriptPath);
        var scriptString = fs.readFileSync(scriptPath, "utf-8");
        executeVM(scriptString, scriptChoice.data).then(transformFn => {
          
          console.log(transformFn);;
          const editor = vscode.window.activeTextEditor;

          if (editor) {
            const document = editor.document;
            const selections = editor.selections;
            const transformedTexts = selections.map(async (selection, index) => {
              const selectedText = document.getText(selection);
              return transformFn(selectedText, index);
            });

            Promise.all(transformedTexts).then(tTexts => {
              editor.edit(editBuilder => {
                selections.forEach((selection, index) => {
                  editBuilder.replace(selection, tTexts[index]);
                });
              }).then(success => {
                if (success) {
                  vscode.window.showInformationMessage('Script applied successfully.');
                } else {
                  vscode.window.showErrorMessage('Failed to apply script.');
                }
              });
            }).catch(err => {
              console.error(err);
              scriptify.log("Error", err);
            });


          }
        }).catch(err => {

          console.log(err);
          scriptify.log(err);
        });

      } catch (error: any) {
        scriptify.log("Error", error);
      }
    }
  });
}
/**
 * This function `switchScriptSource` is responsible for switching the script source.
 * It retrieves a list of sources from the Github repo, and then displays the list to the user
 * as a quick pick menu. The user's choice is stored in the `choice` variable.
 * If the choice is valid (i.e., included in the list), it updates the `scriptDownloadLocation`
 * configuration setting for the 'scriptify' extension in the global scope.
 * 
 * @returns {void}
 */
function switchScriptSource() {

  const sources = ["https://api.github.com/repos/imike57/scriptify/branches", "https://api.github.com/repos/imike57/scriptify/tags"];

  Promise.all(sources.map(url => {
    return axios<{ name: string }[]>({
      method: "get",
      url: url,
      responseType: "json"
    });
  })).then(results => {

    const list = [...results[0].data, ...results[1].data].map(el => el.name).concat(['default']);


    vscode.window.showQuickPick(list).then(choice => {

      if (choice && list.includes(choice)) {
        if (choice === "default") {
          choice = undefined;
        }
        vscode.workspace.getConfiguration('scriptify').update('scriptDownloadLocation', choice, vscode.ConfigurationTarget.Global).then(res => {
          vscode.window.showInformationMessage('Source updated');
        });
      }

    });
  });
}

/** Open the configuration panel */
function openConfiguration() {
  vscode.commands.executeCommand("workbench.action.openSettings", "scriptify");
}

/** Open the global folder */
function openGlobalFolder() {
  const globalPathFolder = path.join(getGlobalFolder(), ".scriptify");
  const folderUri = vscode.Uri.file(globalPathFolder);
  vscode.env.openExternal(folderUri);
}


/**
 * This method is called when the extension is activated.
 * The extension is activated the very first time the command is executed.
 */
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('scriptify.createScript', createScriptFile),
    vscode.commands.registerCommand('scriptify.createGlobalScript', createGlobalScriptFile),
    vscode.commands.registerCommand('scriptify.applyScript', applyScript),
    vscode.commands.registerCommand('scriptify.downloadScript', downloadScript),
    vscode.commands.registerCommand('scriptify.switchScriptSource', switchScriptSource),
    vscode.commands.registerCommand('scriptify.openConfiguration', openConfiguration),
    vscode.commands.registerCommand('scriptify.openGlobalFolder', openGlobalFolder)
  );
}

/**
 * This method is called when your extension is deactivated.
 */
export function deactivate() { }
