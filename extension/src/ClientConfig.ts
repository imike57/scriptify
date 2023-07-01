import * as path from "path";
import * as fs from "fs";
import { checkFileExists, getScriptFolder } from "./utils";
import { ScriptScope } from "./ScriptScope";
import * as vscode from "vscode";
/**
 * Object where the key is a package name and the value is its configuration.
 */
export interface ClientConfigModule {
    /** Module name */
    [key: string]: {
        [key: string]: any;
        /** If `true`, the module is available in the scripts list. */
        enabled: boolean;
        /** Allows defining a local path for the script. It should point to the package folder. */
        path?: string;
        /** An object that will be included as an environment variable under `process.env`. */
        env?: any;
    };
}

/**
 * Represents the client configuration.
 */
export class ClientConfig {

    /** Helps to validate your configuration. */
    $schema: string = path.join(vscode.extensions.getExtension('scriptify.scriptify')!.extensionPath, "schema/scriptify.json");

    /** Configuration scope */
    private scope: ScriptScope = ScriptScope.local;

    /** Module list. Each represents a module with its properties. */
    modules!: ClientConfigModule;

    /**
     * Creates an instance of ClientConfig.
     * @param scope The script scope.
     */
    constructor(scope: ScriptScope) {
        this.scope = scope;
    }

    /**
     * Loads the client configuration from the file.
     * @returns A Promise that resolves to the loaded ClientConfig instance.
     */
    async load(): Promise<ClientConfig> {
        return new Promise(async (resolve, reject) => {
            const workspace = await getScriptFolder(this.scope);
            const clientConfigPath = path.join(workspace, "scriptify.json");

            if (checkFileExists(clientConfigPath)) {
                try {
                    const loadedConfig = JSON.parse(fs.readFileSync(clientConfigPath, "utf-8"));
                    this.modules = loadedConfig.modules;
                    resolve(this);
                } catch (error) {
                    reject(error);
                }
            } else {
                await this.createConfig(this.scope);
                resolve(this.load());
            }
        });
    }

    /**
     * Creates a new client configuration file.
     * @param scope The script scope.
     * @returns A Promise that resolves to the created ClientConfig instance.
     */
    async createConfig(scope: ScriptScope) {
        return new Promise(async (resolve, reject) => {
            try {
                const workspace = await getScriptFolder(scope);
                const tpl = {
                    $schema: this.$schema,
                    modules: {}
                };

                fs.mkdirSync(workspace, { recursive: true });

                fs.writeFileSync(
                    path.join(workspace, "scriptify.json"),
                    JSON.stringify(tpl, null, 4),
                    "utf-8"
                );

                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Saves the client configuration to the file.
     * @returns A Promise that resolves when the save operation is completed.
     */
    async save() {
        // Exported data
        const data = {
            $schema: this.$schema,
            modules: this.modules
        };

        return new Promise<ClientConfig>(async (resolve, reject) => {
            try {
                const workspace = await getScriptFolder(this.scope);
                fs.writeFileSync(
                    path.join(workspace, "scriptify.json"),
                    JSON.stringify(data, null, 4),
                    "utf-8"
                );
                resolve(this);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Adds a package to the module list.
     * @param packageName The name of the package.
     * @param packageConfig The configuration of the package.
     * @returns The updated ClientConfig instance.
     */
    addPackage(packageName: string, packageConfig: ClientConfig['modules'][string]) {
        this.modules[packageName] = packageConfig;
        return this;
    }

    /**
     * Removes a package from the module list.
     * @param packageName The name of the package to remove.
     * @returns A Promise that resolves to the updated ClientConfig instance.
     * @throws If no module is found with the specified name.
     */
    removePackage(packageName: string) {
        return new Promise((resolve, reject) => {
            if (packageName in this.modules) {
                delete this.modules[packageName];
                resolve(this);
            } else {
                reject(`No module found with the name "${packageName}".`);
            }
        });
    }
}
