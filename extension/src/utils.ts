import * as path from "path";
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as os from 'os';
import { PackageJSON } from "./defs/PackageJSON";
import { ScriptFile } from "./defs/ScriptFile";
import { ScriptScope } from "./classes/ScriptScope";
import { ClientConfig } from "./classes/ClientConfig";


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
 * Retrieves the script files located in the specified parent path.
 * @param parentPath The parent path where the script files are located.
 * @returns An array of script files.
 */
export async function getScriptFiles(scope: ScriptScope ): Promise<ScriptFile[]> {

    const parentPath = scope === ScriptScope.global ? getGlobalFolder() : getWorkspaceFolder(true);
    const scriptFolderPath = path.join(parentPath || '', '.scriptify');
    const configPath = path.join(scriptFolderPath, "scriptify.json");
    if (!fs.existsSync(scriptFolderPath) || !fs.existsSync(configPath)) {
        return [];
    }

    const getModulePackageJSON = (modulePath: string): PackageJSON => {
        const pkgJSONPath = path.join(modulePath, "package.json");

        return JSON.parse(fs.readFileSync(pkgJSONPath, "utf-8"));

    };


    // Get config
    const clientConfig = await new ClientConfig(scope).load();

    return Object.entries(clientConfig.modules).filter(entry => {
        return entry[1].enabled;
    }).map(entry => {
        const moduleName = entry[0];
        const moduleConfig = entry[1];
        const moduleDefaultPath = path.join(scriptFolderPath, "node_modules", moduleName);
        const modulePath = moduleConfig.path ? path.join(scriptFolderPath, moduleConfig.path) : moduleDefaultPath;
        const modulePkgJson = getModulePackageJSON(modulePath);

        return {
            id: moduleName,
            scope: scope,
            name: modulePkgJson.scriptify?.name || modulePkgJson.displayName || moduleName,
            description: modulePkgJson.scriptify?.description || modulePkgJson.description,
            uri: path.join(modulePath, modulePkgJson.main || "index.js"),
            modulePath: modulePath,
            config: moduleConfig,
            packageJSON: modulePkgJson

        };
    });
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
export function getScriptFolder(scope:ScriptScope) {

    return new Promise<string>((resolve, reject) => {
        if (scope !== ScriptScope.global) {
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
export async function writeScriptFile(packageJSON: PackageJSON, scriptContent: string, scope: ScriptScope, overwrite: boolean = false) {
    const clientConfig = await new ClientConfig(scope).load();
    const scriptName = packageJSON.name;
    const defaultModuleFolder = "./my-modules";


    clientConfig.addPackage(packageJSON.name, { enabled: true, path: `./my-modules/${packageJSON.name}` });

    return new Promise<{ scriptPath: string }>(async (resolve, reject) => {
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

/** Get favorite package manager */
export function getFavoritePackageManager() {
    return vscode.workspace.getConfiguration('scriptify').get<"npm" | "pnpm" | "yarn">('favoritePackageManager') || "npm";
}


/** Open a markdown file formatted */
export function openFormattedMarkdown(filePath: string) {
    // Construction of URI for the Markdown file
    const markdownUri = vscode.Uri.file(filePath);
    vscode.commands.executeCommand('markdown.showPreview', markdownUri);
  }
  