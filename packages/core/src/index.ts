import * as vscode from 'vscode';

class Scriptify {

    /**
     * Represents the `Scriptify` output channel.
     */
    outputChannel = vscode.window.createOutputChannel('Scriptify', 'javascript');

    /**
     * VS Code API for interacting with Visual Studio Code.
     */
    vscode = vscode;

    /**
     * Use outputChannel to log messages.
     * @param {...any} data - The data to be logged.
     */
    log(...data: any[]) {
        this.outputChannel.show(true);
        this.outputChannel.append(data.join(' '));
        this.outputChannel.append("\r");
    }

    /** Current extension version */
    get version():string | undefined {
        const extension = vscode.extensions.getExtension("scriptify.scriptify");
        if (extension) {
          return extension.packageJSON.version;
        }
        return undefined;
    }


    /**
     * Retrieves the workspace folder path.
     * @param ignoreErrors Whether to ignore errors and return null if no workspace folders are open.
     * @returns The workspace folder path, or null if no workspace folders are open and ignoreErrors is set to true.
     * @throws An error if no folder is open and ignoreErrors is set to false.
     */
    getWorkspaceFolder(ignoreErrors = false): string | null {
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
}

export = new Scriptify();

