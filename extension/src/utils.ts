import * as path from "path";
import * as fs from 'fs';
import * as vscode from 'vscode';
import * as os from 'os';
import { ClientConfig, PackageJSON, ScriptFile } from "./types";

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
export async function getScriptFiles(location: "local" | "global"): Promise<ScriptFile[]> {

    const parentPath = location === "global" ? getGlobalFolder() : getWorkspaceFolder(true);
    const scriptFolderPath = path.join(parentPath || '', '.scriptify');
    const configPath = path.join(scriptFolderPath, "scriptify.json");
    if (!fs.existsSync(scriptFolderPath) || !fs.existsSync(configPath)) {
        return [];
    }

    const getModulePackageJSON = (modulePath:string): PackageJSON => {
        const pkgJSONPath = path.join(modulePath, "package.json");

        return JSON.parse(fs.readFileSync(pkgJSONPath, "utf-8"));

    };


    // Get config
    const clientConfig = await getClientConfig(location === "global");

    return Object.entries(clientConfig.modules).filter(entry => {
        return entry[1].enabled;
    }).map(entry => {
        const moduleName = entry[0];
        const moduleConfig = entry[1];
        const moduleDefaultPath = path.join(scriptFolderPath, "node_modules", moduleName);
        const modulePath = moduleConfig.path ? path.join(scriptFolderPath, moduleConfig.path ) : moduleDefaultPath;
        const modulePkgJson = getModulePackageJSON(modulePath);

        return {
            id: moduleName,
            location: location,
            name: modulePkgJson.scriptify?.name || modulePkgJson.displayName || moduleName,
            description: modulePkgJson.scriptify?.description || modulePkgJson.description,
            uri: path.join(modulePath, modulePkgJson.main || "index.js"),
            modulePath: modulePath,
            config: moduleConfig
            
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
export async function writeScriptFile(packageJSON: PackageJSON, scriptContent: string, global: boolean, overwrite: boolean = false) {
    const clientConfig = await getClientConfig(global);
    const scriptName = packageJSON.name;
    const defaultModuleFolder = "./my-modules";

    clientConfig.modules[packageJSON.name] = {
        enabled: true,
        path: `./my-modules/${packageJSON.name}`
    };
    return new Promise<{ scriptPath: string }>(async (resolve, reject) => {
        const scriptFolder = path.join(await getScriptFolder(global), defaultModuleFolder, scriptName);

        if (!fs.existsSync(scriptFolder)) {
            fs.mkdirSync(scriptFolder, { recursive: true });
        }

        const scriptPath = path.join(scriptFolder, `index.js`);

        if (overwrite || !checkFileExists(scriptPath)) {

            fs.writeFileSync(path.join(scriptFolder, "package.json"), JSON.stringify(packageJSON, null, 4), "utf-8");
            await updateClientConfig(global, clientConfig);

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
                    return writeScriptFile(packageJSON, scriptContent, global, true);
                } else {
                    reject({ fileExist: true, rejected: true });
                }
            });
        }
    });
}


export async function getClientConfig(global:boolean):Promise<ClientConfig> {

    const workspace = await getScriptFolder(global);
    const clientConfigPath = path.join(workspace, "scriptify.json");

    if (checkFileExists(clientConfigPath)) {
        return JSON.parse(fs.readFileSync(clientConfigPath, "utf-8"));

    } else {
        await createClientConfig(global);
        return getClientConfig(global);
    }


}

export async function createClientConfig(global:boolean) {

    const workspace = await getScriptFolder(global);

    const tpl = `{
        "modules": {
            
        }
    }`;

    fs.writeFileSync(path.join(workspace, "scriptify.json"), tpl, "utf-8");
}

export async function updateClientConfig(global:boolean, config:ClientConfig) {
    const workspace = await getScriptFolder(global);

    fs.writeFileSync(path.join(workspace, "scriptify.json"), JSON.stringify(config, null, 4), "utf-8");

}

export async function addPackageToClientConfig(global:boolean, packageName:string, packageConfig: ClientConfig['modules'][string]) {
    const currentConfig = await getClientConfig(global);
    currentConfig.modules[packageName] = packageConfig;
    return updateClientConfig(global, currentConfig);
}

export function getFavoritePackageManager(){
    return vscode.workspace.getConfiguration('scriptify').get<"npm" | "pnpm" | "yarn">('favoritePackageManager') || "npm";
}