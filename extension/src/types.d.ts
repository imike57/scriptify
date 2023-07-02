import { ClientConfig } from "./ClientConfig";
import { ScriptScope } from "./ScriptScope";

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
    scope: ScriptScope,
    /** Some description added to the selection list. */
    description?: string,
    /** Path to the module root. */
    modulePath:string,
    /** Local config defined in scriptify.json client file. */
    config?:ClientConfig['modules'][number],
    /** Package JSON */
    packageJSON:PackageJSON
}

/** Simple representation of a package.json file */
export interface PackageJSON {
    [key: string]: any;
    name: string;
    displayName?: string;
    description?: string;
    publisher?: string;
    version: string;
    repository?: string;
    categories?: string[];
    main?: string;
    devDependencies?: Dependencies;
    keywords?: string[];
    dependencies?: Dependencies;
    scriptify?: {
        name?: string;
        description?: string;
    };
}

export interface Dependencies {
    [key: string]: string
}

