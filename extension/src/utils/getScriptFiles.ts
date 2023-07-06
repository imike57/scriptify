import * as path from "path";
import * as fs from 'fs';
import { PackageJSON } from "../defs/PackageJSON";
import { ScriptFile } from "../defs/ScriptFile";
import { ScriptScope } from "../classes/ScriptScope";
import { ClientConfig } from "../classes/ClientConfig";
import { getWorkspaceFolder } from "./getWorkspaceFolder";
import { getGlobalFolder } from "./getGlobalFolder";

/**
 * Retrieves the script files located in the specified parent path.
 * @param parentPath The parent path where the script files are located.
 * @returns An array of script files.
 */


export async function getScriptFiles(scope: ScriptScope): Promise<ScriptFile[]> {

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
