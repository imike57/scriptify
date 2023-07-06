import * as vscode from 'vscode';
import * as fs from 'fs';
import { ScriptFile } from "../defs/ScriptFile";
import { scriptifyConsole } from '../classes/console';
import { ClientConfig } from '../classes/ClientConfig';
import { scriptsTreeProvider } from '../extension';

export async function removeScript(scriptFile: ScriptFile) {

  const confirm = await vscode.window.showWarningMessage(`Are you sure to remove ${scriptFile.name} ?`, "Yes", "No");

  if (!confirm || confirm === "No") {
    return;
  }

  const clientConfig = await new ClientConfig(scriptFile.scope).load();

  clientConfig.removePackage(scriptFile.packageJSON.name).then(res => {
    fs.rm(scriptFile.modulePath, { recursive: true, force: true }, (err) => {

      if (!err) {
        clientConfig.save().then(res => {
          vscode.window.showInformationMessage(`${scriptFile.name} removed`);
          scriptsTreeProvider.refresh();
        });
      } else {
        console.error(err);
        scriptifyConsole.log(err);
      }
    });

  }).catch(err => {
    console.error(err);
    scriptifyConsole.log(err);
  });


}
