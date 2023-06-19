import * as path from "path";
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as os from 'os';
import { ScriptFile } from "./types";

/** Return the current version of the extension. */
export function getVersion() {
    const packageJsonPath = path.join(__dirname, '../package.json');
    const pJSON = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return pJSON.version;
}


/**
 * Checks if a directory exists at the specified path.
 * @param directoryPath The path of the directory to check.
 * @returns true if the directory exists, false otherwise.
 */
export function checkDirectoryExists(directoryPath: string): boolean {
    try {
        const stat = fs.statSync(directoryPath);
        return stat.isDirectory();
    } catch (error) {
        return false;
    }
}


/**
 * Checks if a file exists at the specified file path.
 * @param filePath - The path of the file to check.
 * @returns `true` if the file exists, `false` otherwise.
 */
export function checkFileExists(filePath: string) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}


/**
 * Retrieves the workspace folder path.
 * @param ignoreErrors Whether to ignore errors and return null if no workspace folders are open.
 * @returns The workspace folder path, or null if no workspace folders are open and ignoreErrors is set to true.
 * @throws An error if no folder is open and ignoreErrors is set to false.
 */
export function getWorkspaceFolder(ignoreErrors = false): string | null {
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


/**
 * Sanitizes a file name by replacing invalid characters with a specified replacement character.
 * @param fileName The file name to sanitize.
 * @param replacementChar The character to use as a replacement for invalid characters.
 * @returns The sanitized file name.
 */
export function sanitizeFileName(fileName: string, replacementChar: string = '-'): string {
    const invalidCharsRegex = /[\W]/g;
    return fileName.replace(invalidCharsRegex, replacementChar);
}

/**
 * Retrieves the script files located in the specified parent path.
 * @param parentPath The parent path where the script files are located.
 * @returns An array of script files.
 */
export function getScriptFiles(location: "local" | "global"): ScriptFile[] {

    const parentPath = location === "global" ? getGlobalFolder() : getWorkspaceFolder(true);
    const scriptFolder = path.join(parentPath || '', '.scriptify');
    if (!fs.existsSync(scriptFolder)) {
        return [];
    }

    return fs.readdirSync(scriptFolder)
        .filter(f => f.endsWith('.js'))
        .map(f => ({
            name: f.replace(/\.js$/g, ""),
            uri: path.join(scriptFolder, f),
            location : location
        }));
}

/**
 * Retrieves the global folder location specified in the workspace configuration.
 * If not configured, it returns the operating system's temporary directory.
 * @returns The global folder location.
 */
export function getGlobalFolder(): string {
    return vscode.workspace.getConfiguration('scriptify').get<string>('globalFolderLocation') || os.tmpdir();
}

/** Return the global or local script folder  */
export function getScriptFolder(global: boolean) {

    return new Promise<string>((resolve, reject) => {
        if (!global) {
            try {
                resolve(path.join(getWorkspaceFolder() || "", ".scriptify"));
            } catch (err) {
                return reject(err);
            }
        } else {
            return resolve(path.join(getGlobalFolder(), ".scriptify"));
        }
    });
};

/**
 * Writes a script file with the specified name and content.
 * @param scriptName - The name of the script.
 * @param scriptContent - The content of the script.
 * @param global - Indicates if the script is global or local.
 * @param overwrite - Optional parameter indicating whether to overwrite an existing file.
 * @returns A promise that resolves to the script path.
 */
export function writeScriptFile(scriptName: string, scriptContent: string, global: boolean, overwrite: boolean = false) {
    return new Promise<{ scriptPath: string }>(async (resolve, reject) => {
        const scriptFolder = await getScriptFolder(global);

        if (!fs.existsSync(scriptFolder)) {
            fs.mkdirSync(scriptFolder);
        }

        const scriptPath = path.join(scriptFolder, `${sanitizeFileName(scriptName)}.js`);

        if (overwrite || !checkFileExists(scriptPath)) {
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
                    return writeScriptFile(scriptName, scriptContent, global, true);
                } else {
                    reject({ fileExist: true, rejected: true });
                }
            });
        }
    });
}
