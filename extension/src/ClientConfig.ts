import * as path from "path";
import * as fs from "fs";
import { checkFileExists, getScriptFolder } from "./utils";
import { ScriptScope } from "./ScriptScope";

export class ClientConfig {

    scope: ScriptScope = ScriptScope.local;

    modules: {
        [key: string]: {
            [key: string]: any,
            enabled: boolean,
            path?: string,
            env?: any
        }
    } = {};

    constructor(scope: ScriptScope) {
        this.scope = scope;


    }

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
                resolve(this.load()) ;
            }

        });
    }

    async createConfig(scope: ScriptScope) {
        return new Promise(async (resolve, reject) => {
            try {

                const workspace = await getScriptFolder(scope);

                const tpl = {
                    "modules": {

                    }
                };

                fs.mkdirSync(workspace, { recursive: true });

                fs.writeFileSync(path.join(workspace, "scriptify.json"), JSON.stringify(tpl, null, 4), "utf-8");

                resolve(this);


            } catch (error) {
                reject(error);
            }
        });
    }




    async save() {

        // Exported data
        const data = {
            modules: this.modules
        };


        return new Promise<ClientConfig>(async (resolve, reject) => {

            try {
                const workspace = await getScriptFolder(this.scope);
                fs.writeFileSync(path.join(workspace, "scriptify.json"), JSON.stringify(data, null, 4), "utf-8");
                resolve(this);
            } catch (error) {
                reject(error);
            }

        });
    }

    addPackage(packageName: string, packageConfig: ClientConfig['modules'][string]) {
        this.modules[packageName] = packageConfig;
        return this;
    }

    removePackage(packageName: string ) {
        return new Promise((resolve, reject) => {
            if (packageName in this.modules) {
                delete this.modules[packageName];
                resolve(this) ;
            } else {
                reject(`No module found with name "${packageName}".`);
            }        
        });
    }

}