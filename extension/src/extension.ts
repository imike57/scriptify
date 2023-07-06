// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { getScriptFiles, getScriptFolder, openFormattedMarkdown } from './utils';
import { ScriptFile } from "./defs/ScriptFile";
import { Scriptify } from './classes/Scriptify';
import { NodeVM, VMScript, VM } from "vm2";
import { scriptifyConsole } from './classes/console';
import { ClientStorage } from './classes/ClientStorage';
import { ScriptsTreeProvider } from './classes/ScriptsTreeProvider';
import * as semver from "semver";
import { createScriptFile } from './commands/createScriptFile';
import { applyScript } from './commands/applyScript';
import { downloadScript } from './commands/downloadScript';
import { openGlobalFolder } from './commands/openGlobalFolder';
import { openConfiguration } from './commands/openConfiguration';
import { removeScript } from './commands/removeScript';

/** Provide some features in script */
export const scriptify = new Scriptify();


export async function executeVM(scriptString: string, scriptFile: ScriptFile) {

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
