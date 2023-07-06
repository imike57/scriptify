import * as vscode from 'vscode';

/** Get favorite package manager */
export function getFavoritePackageManager() {
    return vscode.workspace.getConfiguration('scriptify').get<"npm" | "pnpm" | "yarn">('favoritePackageManager') || "npm";
}
