// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as lvp from "live-plugin-manager";

interface ScriptFile {
  name: string;
  uri: string;
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
  let workspaceFolder: string;
  if (!createGlobally) {
    try {
      workspaceFolder = getWorkspaceFolder() || "";
    } catch (err) {
      return vscode.window.showErrorMessage(`${err}`);
    }
  }

  vscode.window.showInputBox({
    prompt: "Enter script name"
  }).then(scriptName => {
    if (scriptName) {
      const parentPath = createGlobally ? getGlobalFolder() : workspaceFolder;
      const scriptFolder = path.join(parentPath, '.scriptify');
      if (!fs.existsSync(scriptFolder)) {
        fs.mkdirSync(scriptFolder);
      }

      const scriptPath = path.join(scriptFolder, `${sanitizeFileName(scriptName)}.js`);
      const scriptContent = `
function transform(value) {
  // TODO: Implement your transformation logic here
  return value;
}

module.exports = transform;
`;

      fs.writeFileSync(scriptPath, scriptContent);

      vscode.workspace.openTextDocument(scriptPath).then(doc => vscode.window.showTextDocument(doc));

      vscode.window.showInformationMessage(`Script "${scriptName}" created successfully.`);
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
        console.log("scriptPath", scriptPath);

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
            const transformedTexts = selections.map(selection => {
              const selectedText = document.getText(selection);
              return transform(selectedText);
            });

            editor.edit(editBuilder => {
              selections.forEach((selection, index) => {
                editBuilder.replace(selection, transformedTexts[index]);
              });
            }).then(success => {
              if (success) {
                vscode.window.showInformationMessage('Script applied successfully.');
              } else {
                vscode.window.showErrorMessage('Failed to apply script.');
              }
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
    vscode.commands.registerCommand('scriptify.applyScript', applyScript)
  );
}

/**
 * This method is called when your extension is deactivated.
 */
export function deactivate() {}
