import { ClientConfig } from "../classes/ClientConfig";
import { ScriptScope } from "../classes/ScriptScope";
import { PackageJSON } from "./PackageJSON";

/**
 * Represents a script file.
 */

export interface ScriptFile {

    /** Unique identifier */
    id: string;
    /** Displayed name */
    name: string;
    /** Full path to the script to execute. */
    uri: string;
    /** Where the module is located. */
    scope: ScriptScope;
    /** Some description added to the selection list. */
    description?: string;
    /** Path to the module root. */
    modulePath: string;
    /** Local config defined in scriptify.json client file. */
    config?: ClientConfig['modules'][number];
    /** Package JSON */
    packageJSON: PackageJSON;
}
