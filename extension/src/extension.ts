// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import axios from "axios";
import { getFavoritePackageManager, getGlobalFolder, getScriptFiles, getScriptFolder, getVersion, writeScriptFile } from './utils';
import { PackageJSON, ScriptFile } from './types';
import { ScriptScope } from "./ScriptScope";
import { Scriptify } from './Scriptify';
import { NodeVM, VMScript, VM } from "vm2";
import { NpmResponse } from './NpmResponse';
import { scriptifyConsole } from './console';
import { ClientConfig } from './ClientConfig';
import { ClientStorage } from './ClientStorage';
import { ScriptsTreeProvider } from './ScriptsTreeProvider';
import * as semver from "semver";
import { spawn } from 'child_process';

/** Provide some features in script */
export const scriptify = new Scriptify();


/**
 * Downloads a script from a GitHub repository and allows the user to choose to install it globally or locally.
 */
function downloadScript(keyword?: string) {
  // TODO, filter package for current version only.
  const compatibleVersion = getVersion();

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


    vscode.window.showQuickPick([...base, ...list], {
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

          const scopes: { label: string, value: ScriptScope }[] = [
            {
              label: "Globally",
              value: ScriptScope.global
            },
            {
              label: "Locally",
              value: ScriptScope.local
            }
          ];

          vscode.window.showQuickPick(scopes, {
            title: "Where to install ?"
          }).then(async locationChoice => {

            if (!locationChoice) {
              return;
            }



            const clientConfig = await new ClientConfig(locationChoice.value).load();
            const installArg = {
              npm: "i",
              pnpm: "add",
              yarn: "add"
            };

            const favoritePackageManager = getFavoritePackageManager();


            vscode.window.withProgress({ cancellable: true, location: vscode.ProgressLocation.Notification, title: "Installation in progress" }, async (progress, token) => {

              const installProcess = spawn(favoritePackageManager, [installArg[favoritePackageManager], scriptChoice.label], { cwd: await getScriptFolder(locationChoice.value) });

              progress.report({ message: `Installing ${scriptChoice.label}`, increment: 0 });


              token.onCancellationRequested(() => {
                console.log("KILLED");
                installProcess.kill();
              });




              return new Promise<"completed" | "cancelled">((resolve, reject) => {
                let errLog = "";
                let dataLog = "";


                installProcess.stderr.on('data', (err) => {
                  errLog += err.toString();
                });


                installProcess.stdout.on('data', (chunk) => {
                  dataLog += chunk.toString();
                });

                installProcess.on('exit', (code, signal) => {
                  if (signal === 'SIGINT') {
                    reject(new Error("Cancelled"));

                  } else if (code === 0) {
                    // The process is successfully completed.
                    resolve("completed");

                  } else if (signal === "SIGTERM") {
                    // Process has been killed.
                    resolve("cancelled");

                  } else {
                    reject(new Error(`The process ended with an error code: ${code}` + "\r" + errLog));

                  }
                });


                installProcess.on('error', (err) => {
                  reject(err);
                });

              });


            }).then(async (value) => {
              if (value === "completed") {
                // Get package JSON of the package to check if a default configuration exist. 
                const packagePath = path.join(await getScriptFolder(locationChoice.value), 'node_modules', scriptChoice.label);
                const packageJSON: PackageJSON = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'), 'utf-8'));
                if (packageJSON) {
                  await clientConfig.addPackage(scriptChoice.label, { enabled: true, env: packageJSON.scriptify?.defaultEnv }).save();
                  scriptsTreeProvider.refresh();
                  vscode.window.showInformationMessage('Installation success');
                  openFormattedMarkdown(path.join(packagePath, "readme.md"));
                }                
              } else {
                vscode.window.showInformationMessage('Installation cancelled');
              }

            }, (err) => {
              console.error(err);
              scriptifyConsole.error(err);

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
async function createScriptFile() {

  const scope: { label: string, value: ScriptScope } | undefined = await vscode.window.showQuickPick([{ label: "Globally", value: ScriptScope.global }, { label: "Locally", value: ScriptScope.local }]);

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



async function executeVM(scriptString: string, scriptFile: ScriptFile) {

  const vm = new NodeVM({
    console: "inherit",
    sandbox: {
      scriptify: scriptify,
      console: scriptifyConsole
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
    },
    env: scriptFile.config?.env,
    argv: [await getScriptFolder(scriptFile.scope)]
  });

  // Call the script
  const transform = new VMScript(scriptString, scriptFile.uri);


  return vm.run(transform, scriptFile.uri);

}

/**
 * Applies a script to the selected text in the active editor.
 */
async function applyScript(scriptFile?: ScriptFile) {


  if (scriptFile) {
    try {
      const scriptPath = scriptFile.uri;
      var scriptString = fs.readFileSync(scriptPath, "utf-8");
      executeVM(scriptString, scriptFile).then(transformFn => {

        const editor = vscode.window.activeTextEditor;

        if (editor) {
          const document = editor.document;
          const selections = editor.selections;
          const transformedTexts = selections.map(async (selection, index) => {
            const selectedText = document.getText(selection);
            return transformFn(selectedText, index, scriptFile.config);
          });

          Promise.all(transformedTexts).then(tTexts => {

            const outputLocation = scriptFile.config?.out || "selection";

            editor.edit(editBuilder => {
              selections.forEach(async (selection, index) => {

                if (outputLocation === "selection") {
                  editBuilder.replace(selection, tTexts[index]);

                } else if (outputLocation === "file") {
                  const document = await vscode.workspace.openTextDocument({ content: tTexts[index] });
                  vscode.window.showTextDocument(document);

                } else if (outputLocation === "outputChannel") {
                  scriptifyConsole.log(tTexts[index]);
                } else {
                  // Nothing to do
                }
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
            scriptifyConsole.log("Error", err);
          });


        }
      }).catch(err => {

        console.log(err);
        scriptifyConsole.log(err);
      });

    } catch (error: any) {
      scriptifyConsole.log("Error", error);
    }
  } else {
    let files: Array<ScriptFile> = [];
    try {
      let localesFiles = await getScriptFiles(ScriptScope.local);
      let globalFiles = await getScriptFiles(ScriptScope.global);
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
        label: scriptFile.name,
        description: ScriptScope[scriptFile.scope],
        detail: scriptFile.description,
        data: scriptFile
      };
    }), {
      placeHolder: 'Select a script to apply'
    }).then(async scriptChoice => {
      if (!scriptChoice?.data) {
        return;
      }
      applyScript(scriptChoice.data);
    });
  }


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

/** Open a markdown file formatted */
function openFormattedMarkdown(filePath: string) {
  // Construction of URI for the Markdown file
  const markdownUri = vscode.Uri.file(filePath);
  vscode.commands.executeCommand('markdown.showPreview', markdownUri);
}

/** Function called on activated to produce or alert about an update of Scriptify */
function onUpdate(context: vscode.ExtensionContext) {

  const extension = vscode.extensions.getExtension('scriptify.scriptify');
  const extensionVersion = extension?.packageJSON.version;
  const updatePopupKey = "updatePopupShown";

  const storedVersion = context.globalState.get<string>(updatePopupKey);


  if ((storedVersion && semver.lt(storedVersion, "2.0.0") && semver.gt(extensionVersion, "2.0.0")) || context.extensionMode === vscode.ExtensionMode.Development) {
    vscode.window.showInformationMessage(`Scriptify has been updated to version ${extensionVersion}. Please refer to the migration guide to update and ensure compatibility with your scripts.`,
      "Show", "Cancel").then(choice => {
        if (choice === "Show") {
          vscode.env.openExternal(vscode.Uri.parse(`https://github.com/imike57/scriptify/blob/${extensionVersion}/docs/migration.md`));
        }

        context.globalState.update(updatePopupKey, extensionVersion);
      });
  }

}

async function removeScript(scriptFile: ScriptFile) {

  const confirm = await vscode.window.showWarningMessage(`Are you sure to remove ${scriptFile.name} ?`, "Yes", "No");

  if (!confirm || confirm === "No") {
    return;
  }

  const clientConfig = await new ClientConfig(scriptFile.scope).load();

  clientConfig.removePackage(scriptFile.packageJSON.name).then(res => {
    fs.rm(scriptFile.modulePath, { recursive: true, force: true }, (err) => {

      if (!err) {
        clientConfig.save().then(res => {
          vscode.window.showInformationMessage(`${scriptFile.name} removed`);
          scriptsTreeProvider.refresh();
        });
      } else {
        console.error(err);
        scriptifyConsole.log(err);
      }
    });

  }).catch(err => {
    console.error(err);
    scriptifyConsole.log(err);
  });


}


export const scriptsTreeProvider = new ScriptsTreeProvider();


/**
 * This method is called when the extension is activated.
 * The extension is activated the very first time the command is executed.
 */
export function activate(context: vscode.ExtensionContext) {
  onUpdate(context);


  context.subscriptions.push(
    vscode.commands.registerCommand('scriptify.createScript', createScriptFile),
    vscode.commands.registerCommand('scriptify.applyScript', applyScript),
    vscode.commands.registerCommand('scriptify.downloadScript', downloadScript),
    vscode.commands.registerCommand('scriptify.openConfiguration', openConfiguration),
    vscode.commands.registerCommand('scriptify.openGlobalFolder', openGlobalFolder),
    vscode.commands.registerCommand('scriptify.tree.apply', async (choice: { script: ScriptFile }) => {
      // Retrieve the associated script to ensure that the latest configuration is obtained. 
      const relatedScript = (await getScriptFiles(choice.script.scope)).find(script => script.id === choice.script.id);
      applyScript(relatedScript);
    }),
    vscode.commands.registerCommand('scriptify.tree.help', (choice: { script: ScriptFile }) => {
      openFormattedMarkdown(path.join(choice.script.modulePath, "readme.md"));
    }),
    vscode.commands.registerCommand('scriptify.tree.remove', (choice: { script: ScriptFile }) => {
      removeScript(choice.script);
    }),
    vscode.window.registerTreeDataProvider('scriptify.tree', scriptsTreeProvider),
    vscode.commands.registerCommand('scriptify.tree.refresh', () => scriptsTreeProvider.refresh()),
    vscode.commands.registerCommand('scriptify.tree.create', createScriptFile),
    vscode.commands.registerCommand('scriptify.tree.download', downloadScript)
  );

  return {
    storage: {
      global: new ClientStorage(context, "globalState"),
      workspace: new ClientStorage(context, "workspaceState")
    }
  };
}

/**
 * This method is called when your extension is deactivated.
 */
export function deactivate() { }
