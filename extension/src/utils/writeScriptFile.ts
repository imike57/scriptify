import * as path from "path";
import * as fs from 'fs';
import * as vscode from 'vscode';
import { PackageJSON } from "../defs/PackageJSON";
import { ScriptScope } from "../classes/ScriptScope";
import { ClientConfig } from "../classes/ClientConfig";
import { checkFileExists } from "./checkFileExists";
import { getScriptFolder } from "./getScriptFolder";

/**
 * Writes a script file with the specified name and content.
 * @param scriptName - The name of the script.
 * @param scriptContent - The content of the script.
 * @param global - Indicates if the script is global or local.
 * @param overwrite - Optional parameter indicating whether to overwrite an existing file.
 * @returns A promise that resolves to the script path.
 */


export async function writeScriptFile(packageJSON: PackageJSON, scriptContent: string, scope: ScriptScope, overwrite: boolean = false) {
    const clientConfig = await new ClientConfig(scope).load();
    const scriptName = packageJSON.name;
    const defaultModuleFolder = "./my-modules";


    clientConfig.addPackage(packageJSON.name, { enabled: true, path: `./my-modules/${packageJSON.name}` });

    return new Promise<{ scriptPath: string; }>(async (resolve, reject) => {
        const scriptFolder = path.join(await getScriptFolder(scope), defaultModuleFolder, scriptName);

        if (!fs.existsSync(scriptFolder)) {
            fs.mkdirSync(scriptFolder, { recursive: true });
        }

        const scriptPath = path.join(scriptFolder, `index.js`);

        if (overwrite || !checkFileExists(scriptPath)) {

            // Write package.json
            fs.writeFileSync(path.join(scriptFolder, "package.json"), JSON.stringify(packageJSON, null, 4), "utf-8");

            // Save client config
            await clientConfig.save();

            // Write main script file
            fs.writeFile(scriptPath, scriptContent, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        scriptPath: scriptPath
                    });

                    vscode.workspace.openTextDocument(scriptPath).then(doc => vscode.window.showTextDocument(doc));

                    vscode.window.showInformationMessage(`Script "${scriptName}" created successfully.`);
                }
            });
        } else {
            vscode.window.showWarningMessage("File already exists. Do you want to overwrite it?", "Yes", "No").then(val => {
                if (val === "Yes") {
                    return writeScriptFile(packageJSON, scriptContent, scope, true);
                } else {
                    reject({ fileExist: true, rejected: true });
                }
            });
        }
    });
}
