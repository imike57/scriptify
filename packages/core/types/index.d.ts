import * as vscode from 'vscode';
declare class Scriptify {
    /**
     * Represents the `Scriptify` output channel.
     */
    outputChannel: vscode.OutputChannel;
    /**
     * VS Code API for interacting with Visual Studio Code.
     */
    vscode: typeof vscode;
    /**
     * Use outputChannel to log messages.
     * @param {...any} data - The data to be logged.
     */
    log(...data: any[]): void;
    /** Current extension version */
    get version(): string | undefined;
    /**
     * Retrieves the workspace folder path.
     * @param ignoreErrors Whether to ignore errors and return null if no workspace folders are open.
     * @returns The workspace folder path, or null if no workspace folders are open and ignoreErrors is set to true.
     * @throws An error if no folder is open and ignoreErrors is set to false.
     */
    getWorkspaceFolder(ignoreErrors?: boolean): string | null;
}
declare const _default: Scriptify;
export = _default;
