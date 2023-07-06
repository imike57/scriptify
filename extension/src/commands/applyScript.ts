import * as vscode from 'vscode';
import * as fs from 'fs';
import { getScriptFiles } from '../utils';
import { ScriptFile } from "../defs/ScriptFile";
import { ScriptScope } from "../classes/ScriptScope";
import { scriptifyConsole } from '../classes/console';
import { executeVM } from '../extension';

/**
 * Applies a script to the selected text in the active editor.
 */
export async function applyScript(scriptFile?: ScriptFile) {


  if (scriptFile) {
    try {
      const scriptPath = scriptFile.uri;
      var scriptString = fs.readFileSync(scriptPath, "utf-8");
      executeVM(scriptString, scriptFile).then(transformFn => {

        const editor = vscode.window.activeTextEditor;

        if (editor) {
          const document = editor.document;
          const selections = editor.selections;
          const transformedTexts = selections.map(async (selection, index) => {
            const selectedText = document.getText(selection);
            return transformFn(selectedText, index, scriptFile.config);
          });

          Promise.all(transformedTexts).then(tTexts => {

            const outputLocation = scriptFile.config?.out || "selection";

            editor.edit(editBuilder => {
              selections.forEach(async (selection, index) => {

                if (outputLocation === "selection") {
                  editBuilder.replace(selection, tTexts[index]);

                } else if (outputLocation === "file") {
                  const document = await vscode.workspace.openTextDocument({ content: tTexts[index] });
                  vscode.window.showTextDocument(document);

                } else if (outputLocation === "outputChannel") {
                  scriptifyConsole.log(tTexts[index]);
                } else {
                  // Nothing to do
                }
              });
            }).then(success => {
              if (success) {
                vscode.window.showInformationMessage('Script applied successfully.');
              } else {
                vscode.window.showErrorMessage('Failed to apply script.');
              }
            });
          }).catch(err => {
            console.error(err);
            scriptifyConsole.log("Error", err);
          });


        }
      }).catch(err => {

        console.log(err);
        scriptifyConsole.log(err);
      });

    } catch (error: any) {
      scriptifyConsole.log("Error", error);
    }
  } else {
    let files: Array<ScriptFile> = [];
    try {
      let localesFiles = await getScriptFiles(ScriptScope.local);
      let globalFiles = await getScriptFiles(ScriptScope.global);
      files = [...localesFiles, ...globalFiles].sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    } catch (err) {
      return vscode.window.showErrorMessage(`${err}`);
    }

    if (files.length === 0) {
      vscode.window.showErrorMessage('No scripts found.');
      return;
    }

    vscode.window.showQuickPick(files.map(scriptFile => {
      return {
        label: scriptFile.name,
        description: ScriptScope[scriptFile.scope],
        detail: scriptFile.description,
        data: scriptFile
      };
    }), {
      placeHolder: 'Select a script to apply'
    }).then(async (scriptChoice) => {
      if (!scriptChoice?.data) {
        return;
      }
      applyScript(scriptChoice.data);
    });
  }


}
