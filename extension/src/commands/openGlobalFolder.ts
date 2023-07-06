import * as vscode from 'vscode';
import * as path from 'path';
import { getGlobalFolder } from "../utils";

/** Open the global folder */
export function openGlobalFolder() {
  const globalPathFolder = path.join(getGlobalFolder(), ".scriptify");
  const folderUri = vscode.Uri.file(globalPathFolder);
  vscode.env.openExternal(folderUri);
}
