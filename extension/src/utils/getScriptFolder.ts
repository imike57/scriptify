import * as path from "path";
import { ScriptScope } from "../classes/ScriptScope";
import { getWorkspaceFolder } from "./getWorkspaceFolder";
import { getGlobalFolder } from "./getGlobalFolder";

/** Return the global or local script folder  */


export function getScriptFolder(scope: ScriptScope) {

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
}
;
