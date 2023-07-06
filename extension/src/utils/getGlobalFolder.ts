import * as vscode from 'vscode';
import * as os from 'os';

/**
 * Retrieves the global folder location specified in the workspace configuration.
 * If not configured, it returns the operating system's temporary directory.
 * @returns The global folder location.
 */


export function getGlobalFolder(): string {
    return vscode.workspace.getConfiguration('scriptify').get<string>('globalFolderLocation') || os.tmpdir();
}
