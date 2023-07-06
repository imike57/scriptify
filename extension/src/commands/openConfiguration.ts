import * as vscode from 'vscode';

/** Open the configuration panel */
export function openConfiguration() {
  vscode.commands.executeCommand("workbench.action.openSettings", "scriptify");
}
