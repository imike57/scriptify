// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as lvp from "live-plugin-manager";
import axios from "axios";
import { checkDirectoryExists, getGlobalFolder, getScriptFiles, getVersion, getWorkspaceFolder, writeScriptFile } from './utils';
import { GithubFile, ScriptFile } from './types';


class Scriptify {
  
  pkgPath = path.join(getGlobalFolder(), '.scriptify', 'packages');

  /**
   * Represents the `Scriptify` output channel.
   */
  outputChannel = vscode.window.createOutputChannel('Scriptify', 'javascript');

  /** live package manager instance */
  pkg = new lvp.PluginManager({ pluginsPath: this.pkgPath });

  /** axios */
  axios = axios;

  /** vscode */
  vscode = vscode;

  /** Use outputChannel to log */
  log(...data:any[])  {
    this.outputChannel.show(true);
    data.forEach(el => {
      this.outputChannel.append(el);
      this.outputChannel.append("\r");
    });
  
  }
}

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




/**
 * Applies a script to the selected text in the active editor.
 */
function applyScript() {
  let files: Array<ScriptFile> = [];
  try {
    files = getScriptFiles(getWorkspaceFolder(true) || "")
      .concat(getScriptFiles(getGlobalFolder()));
  } catch (err) {
    return vscode.window.showErrorMessage(`${err}`);
  }

  if (files.length === 0) {
    vscode.window.showErrorMessage('No scripts found.');
    return;
  }

  vscode.window.showQuickPick(files.map(f => f.name), {
    placeHolder: 'Select a script to apply'
  }).then(selectedScriptName => {
    if (selectedScriptName) {
      try {
        const file = files.find(f => f.name === selectedScriptName);
        if (!file) {
          vscode.window.showErrorMessage(`Script "${selectedScriptName}" not found.`);
          return;
        }
        const scriptPath = file.uri;

        var scriptString = fs.readFileSync(scriptPath, "utf-8");

        // Find all the times _require() is called by the script
        const scriptRequires = scriptString.match(/_require\(["'`].+["'`]\)/g)?.map(i => i.substring("_require('".length, i.length - "')".length));

        // Create the _require alias
        const _require = scriptify.pkg.require.bind(scriptify.pkg);

        const execute = () => {
          // Call the script
          const transform = eval(scriptString);
          const editor = vscode.window.activeTextEditor;

          if (editor) {
            const document = editor.document;
            const selections = editor.selections;
            const transformedTexts = selections.map(async selection => {
              const selectedText = document.getText(selection);
              return await transform(selectedText);
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
              scriptify.log(err);
            });


          }
        };

        if (scriptRequires) {
          // Need to install packages
          console.log(`Installing ${scriptRequires.length} packages: ${scriptRequires}`);
          vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Installing ${scriptRequires.length} NPM packages...`,
            cancellable: true
          }, async (progress, token) => {
            progress.report({ increment: 0 });

            for (const pkg of scriptRequires) {
              if (token.isCancellationRequested) {
                return;
              }

              const packageDirectoryExist = checkDirectoryExists(path.join(scriptify.pkgPath, pkg));

              progress.report({
                increment: scriptRequires.indexOf(pkg) / scriptRequires.length * 100,
                message: `Installing ${pkg}...${packageDirectoryExist ? '(cached)' : '(npm)'}`
              });

              // Install from cache if exist.
              if (packageDirectoryExist) {
                await scriptify.pkg.installFromPath(path.join(scriptify.pkgPath, pkg));
              } else {
                await scriptify.pkg.install(pkg);
              }
            }
            execute();
          });
        } else {
          // No npm packages to install, execute now
          execute();
        }
      } catch (error: any) {
        scriptify.log(error);
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
function switchScriptSource(){

  const sources = ["https://api.github.com/repos/imike57/scriptify/branches", "https://api.github.com/repos/imike57/scriptify/tags"];

  Promise.all(sources.map(url => {
    return axios<{name:string}[]>({
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
function openConfiguration(){
  vscode.commands.executeCommand("workbench.action.openSettings", "scriptify");
}

/** Open the global folder */
function openGlobalFolder(){
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
