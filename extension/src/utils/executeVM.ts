import * as vscode from 'vscode';
import { getScriptFolder } from "./getScriptFolder";
import { ScriptFile } from "../defs/ScriptFile";
import { NodeVM, VMScript } from "vm2";
import { scriptifyConsole } from '../classes/console';
import { scriptify } from '../extension';


/**
 * Executes a script in a NodeVM sandbox environment.
 * @param scriptString - The script code to execute.
 * @param scriptFile - The script file information.
 * @returns A promise that resolves with the result of the script execution.
 */
export async function executeVM(scriptString: string, scriptFile: ScriptFile) {

  const vm = new NodeVM({
    console: "inherit",
    sandbox: {
      scriptify: scriptify,
      console: scriptifyConsole
    },
    require: {
      builtin: ['*'],
      external: {
        transitive: true,
        modules: ['*']
      },
      mock: {
        vscode: vscode,
        scriptify: scriptify
      }
    },
    env: scriptFile.config?.env,
    argv: [await getScriptFolder(scriptFile.scope)]
  });

  // Call the script
  const transform = new VMScript(scriptString, scriptFile.uri);


  return vm.run(transform, scriptFile.uri);

}
