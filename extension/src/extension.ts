// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import axios from "axios";
import { getGlobalFolder, getScriptFiles, getScriptFolder, getVersion, writeScriptFile } from './utils';
import { GithubFile, ScriptFile } from './types';
import { Scriptify } from './Scriptify';
import { NodeVM, VMScript } from "vm2";

/** Provide some features in script */
const scriptify = new Scriptify();

/**
 * Downloads a script from a GitHub repository and allows the user to choose to install it globally or locally.
 */
function downloadScript() {
  const source = vscode.workspace.getConfiguration('scriptify').get<string>("scriptDownloadLocation") || getVersion();
  const githubExampleFolderAPI = `https://api.github.com/repos/imike57/scriptify/contents/examples?ref=${source}`;

  axios<GithubFile[]>({
    method: "get",
    url: githubExampleFolderAPI,
    responseType: "json"
  }).then(results => {
    const list = results.data.map(entry => {
      return entry.name;
    })
    vscode.window.showQuickPick(list, { title: `Select a script (${source})`}).then(fileName => {

      if (fileName) {
        const selectedFile = results.data.find(file => file.name === fileName);
        const scriptName = path.parse(fileName).name;

        if (selectedFile) {
          axios({
            method: "get",
            url: selectedFile.download_url,
            responseType: "text"
          }).then(fileContent => {
            vscode.window.showInformationMessage(fileContent.data);

            vscode.window.showQuickPick(["Install globally", "Install locally"]).then(choice => {
              if (choice) {
                writeScriptFile(scriptName, fileContent.data, choice === "Install globally");
              }

            });

          });

        }
      }
    });
  });
}


/**
 * Creates a script file in the current workspace or globally.
 * @param createGlobally Specifies whether to create the script globally.
 */
function createScriptFile(createGlobally = false) {

  vscode.window.showInputBox({
    prompt: "Enter script name"
  }).then(scriptName => {
    if (scriptName) {

      const scriptContent = `
function transform(value) {
  // TODO: Implement your transformation logic here
  return value;
}

module.exports = transform;
`;

      writeScriptFile(scriptName, scriptContent, createGlobally);

    }
  });
}


/**
 * Creates a global script file.
 */
function createGlobalScriptFile() {
  createScriptFile(true);
}


async function executeVM(scriptString:string, location: "global" | "local"){

  const rootPath = await getScriptFolder(location === "global");

  const vm = new NodeVM({
    sandbox: {
      scriptify: scriptify,
      vscode: vscode
    },
    require: {
      builtin: ['*'],
      root: rootPath,
      external: {
        transitive: true,
        modules: ['*']
      },
      resolve(moduleName, parentDirname) {
        const scriptPath = path.join(rootPath, 'node_modules', moduleName);
        return require.resolve(scriptPath);
      }
    }
  });

  // Call the script
  const transform = new VMScript(scriptString);
    
  return vm.run(transform);
  
}

/**
 * Applies a script to the selected text in the active editor.
 */
function applyScript() {

  let files: Array<ScriptFile> = [];
  try {
    let localesFiles = getScriptFiles("local");
    let globalFiles = getScriptFiles("global");
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
  
  vscode.window.showQuickPick(files.map(el => { return { label : el.name, description: el.location, uri: el.uri }; }), {
    placeHolder: 'Select a script to apply'
  }).then(scriptChoice => {
    if (scriptChoice) {
      try {
      
        const scriptPath = scriptChoice.uri;
        var scriptString = fs.readFileSync(scriptPath, "utf-8");
        executeVM(scriptString, scriptChoice.description).then(transformFn => {
          
          console.log(transformFn);;
          const editor = vscode.window.activeTextEditor;

          if (editor) {
            const document = editor.document;
            const selections = editor.selections;
            const transformedTexts = selections.map(async selection => {
              const selectedText = document.getText(selection);
              return transformFn(selectedText);
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