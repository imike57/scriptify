import * as vscode from 'vscode';

/** Return the current version of the extension. */


export function getVersion(): string {
    return vscode.extensions.getExtension('scriptify.scriptify')!.packageJSON.version;
}
