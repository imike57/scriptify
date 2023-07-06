import * as vscode from 'vscode';

/**
 * Retrieves the workspace folder path.
 * @param ignoreErrors Whether to ignore errors and return null if no workspace folders are open.
 * @returns The workspace folder path, or null if no workspace folders are open and ignoreErrors is set to true.
 * @throws An error if no folder is open and ignoreErrors is set to false.
 */


export function getWorkspaceFolder(ignoreErrors = false): string | null {
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
