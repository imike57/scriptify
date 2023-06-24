import * as path from "path";
import * as fs from "fs";
import { checkFileExists, getScriptFolder } from "./utils";

export class ClientConfig {

    global: boolean = false;

    modules: {
        [key: string]: {
            [key: string]: any,
            enabled: boolean,
            path?: string,
            env?: any
        }
    } = {};

    constructor(global: boolean) {
        this.global = global;


    }

    async load(): Promise<ClientConfig> {

        return new Promise(async (resolve, reject) => {

            const workspace = await getScriptFolder(this.global);
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
                await this.createConfig(this.global);
                return this.load();
            }




        });
    }

    async createConfig(global: boolean) {

        const workspace = await getScriptFolder(global);

        const tpl = `{
            "modules": {
                
            }
        }`;

        fs.writeFileSync(path.join(workspace, "scriptify.json"), tpl, "utf-8");
    }




    async save() {

        // Exported data
        const data = {
            modules: this.modules
        };


        return new Promise<ClientConfig>(async (resolve, reject) => {

            try {
                const workspace = await getScriptFolder(this.global);
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

}