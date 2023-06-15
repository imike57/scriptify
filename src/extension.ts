// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as lvp from "live-plugin-manager";
import axios from "axios";
/** Represent a script file. */
interface ScriptFile {
  name: string;
  uri: string;
}

export interface GithubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  _links: GithubLinks;
}

export interface GithubLinks {
  self: string;
  git: string;
  html: string;
}

/** Return the current version of the extension. */
function getVersion() {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const pJSON = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return pJSON.version;
}

/**
 * Represents the `Scriptify` output channel.
 */
const outputChannel = vscode.window.createOutputChannel('Scriptify');

/**
 * Retrieves the global folder location specified in the workspace configuration.
 * If not configured, it returns the operating system's temporary directory.
 * @returns The global folder location.
 */
function getGlobalFolder(): string {
  return vscode.workspace.getConfiguration('scriptify').get<string>('globalFolderLocation') || os.tmpdir();
}
/**
 * Downloads a script from a GitHub repository and allows the user to choose to install it globally or locally.
 */
function downloadScript() {

  const githubExampleFolderAPI = `https://api.github.com/repos/imike57/scriptify/contents/examples?ref=${getVersion()}`;

  axios<GithubFile[]>({
    method: "get",
    url: githubExampleFolderAPI,
    responseType: "json"
  }).then(results => {
    const list = results.data.map(entry => {
      return entry.name;
    })
    vscode.window.showQuickPick(list).then(fileName => {

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
              writeScriptFile(scriptName, fileContent.data, choice === "Install globally");

            });

          });

        }
      }
    });


  });
}

/**
 * Retrieves the workspace folder path.
 * @param ignoreErrors Whether to ignore errors and return null if no workspace folders are open.
 * @returns The workspace folder path, or null if no workspace folders are open and ignoreErrors is set to true.
 * @throws An error if no folder is open and ignoreErrors is set to false.
 */
function getWorkspaceFolder(ignoreErrors = false): string | null {
  const { workspaceFolders } = vscode.workspace;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    if (!ignoreErrors) {
      throw new Error('No folder open. Add a folder to your workspace, or create a global script file instead.');
    }
    return null;
  }
  if (workspaceFolders.length > 1) {
    if (!ignoreErrors) {
      throw new Error('Local script files cannot be created on workspaces with multiple folders open. Create a global script file instead.');
    }
    return null;
  }
  return workspaceFolders[0].uri.fsPath;
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


/** Return the global or local script folder  */
const getScriptFolder = (global: boolean) => {

  return new Promise<string>((resolve, reject) => {
    if (!global) {
      try {
        resolve(path.join(getWorkspaceFolder() || "", ".scriptify"));
      } catch (err) {
        return reject(err);
      }
    } else {
      return resolve(path.join(getGlobalFolder(), ".scriptify"));
    }
  });
};


/**
 * Writes a script file with the specified name and content.
 * @param scriptName - The name of the script.
 * @param scriptContent - The content of the script.
 * @param global - Indicates if the script is global or local.
 * @param overwrite - Optional parameter indicating whether to overwrite an existing file.
 * @returns A promise that resolves to the script path.
 */
function writeScriptFile(scriptName: string, scriptContent: string, global: boolean, overwrite: boolean = false) {
  return new Promise<{ scriptPath: string }>(async (resolve, reject) => {
    const scriptFolder = await getScriptFolder(global);

    if (!fs.existsSync(scriptFolder)) {
      fs.mkdirSync(scriptFolder);
    }

    const scriptPath = path.join(scriptFolder, `${sanitizeFileName(scriptName)}.js`);

    if (overwrite || !checkFileExists(scriptPath)) {
      fs.writeFile(scriptPath, scriptContent, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            scriptPath: scriptPath
          });

          vscode.workspace.openTextDocument(scriptPath).then(doc => vscode.window.showTextDocument(doc));

          vscode.window.showInformationMessage(`Script "${scriptName}" created successfully.`);
        }
      });
    } else {
      vscode.window.showWarningMessage("File already exists. Do you want to overwrite it?", "Yes", "No").then(val => {
        if (val === "Yes") {
          return writeScriptFile(scriptName, scriptContent, global, true);
        } else {
          reject({ fileExist: true, rejected: true });
        }
      });
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
 * Sanitizes a file name by replacing invalid characters with a specified replacement character.
 * @param fileName The file name to sanitize.
 * @param replacementChar The character to use as a replacement for invalid characters.
 * @returns The sanitized file name.
 */
function sanitizeFileName(fileName: string, replacementChar: string = '-'): string {
  const invalidCharsRegex = /[\W]/g;
  return fileName.replace(invalidCharsRegex, replacementChar);
}

/**
 * Retrieves the script files located in the specified parent path.
 * @param parentPath The parent path where the script files are located.
 * @returns An array of script files.
 */
function getScriptFiles(parentPath: string): ScriptFile[] {
  const scriptFolder = path.join(parentPath || '', '.scriptify');
  if (!fs.existsSync(scriptFolder)) {
    return [];
  }

  return fs.readdirSync(scriptFolder)
    .filter(f => f.endsWith('.js'))
    .map(f => ({
      name: f.replace(/\.js$/g, ""),
      uri: path.join(scriptFolder, f),
    }));
}

/**
 * Checks if a directory exists at the specified path.
 * @param directoryPath The path of the directory to check.
 * @returns true if the directory exists, false otherwise.
 */
function checkDirectoryExists(directoryPath: string): boolean {
  try {
    const stat = fs.statSync(directoryPath);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}


/**
 * Checks if a file exists at the specified file path.
 * @param filePath - The path of the file to check.
 * @returns `true` if the file exists, `false` otherwise.
 */
function checkFileExists(filePath: string) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
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

        const managerPath = path.join(getGlobalFolder(), '.scriptify', 'packages');
        const manager = new lvp.PluginManager({ pluginsPath: managerPath });
        // Create the _require alias
        const _require = manager.require.bind(manager);

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

              const packageDirectoryExist = checkDirectoryExists(path.join(managerPath, pkg));

              progress.report({
                increment: scriptRequires.indexOf(pkg) / scriptRequires.length * 100,
                message: `Installing ${pkg}...${packageDirectoryExist ? '(cached)' : '(npm)'}`
              });

              // Install from cache if exist.
              if (checkDirectoryExists(path.join(managerPath, pkg))) {
                await manager.installFromPath(path.join(managerPath, pkg));
              } else {
                await manager.install(pkg);
              }
            }
            execute();
          });
        } else {
          // No npm packages to install, execute now
          execute();
        }
      } catch (error: any) {
        console.log(error);
        outputChannel.show(true);
        outputChannel.append(error);
      }
    }
  });
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
    vscode.commands.registerCommand('scriptify.downloadScript', downloadScript)
  );
}

/**
 * This method is called when your extension is deactivated.
 */
export function deactivate() { }
