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
    location: "global" | "local",
    /** Some description added to the selection list. */
    description?: string,
    /** Path to the module root. */
    modulePath:string,
    /** Local config defined in scriptify.json client file. */
    config?:ClientConfig['modules'][string]
}

export interface ClientConfig {
    modules: { [key:string]: {
        [key:string]:any,
        enabled: boolean,
        path?:string,
        env?:any
    }}
}


/**
 * Represents a file in GitHub.
 */
export interface GithubFile {
    name: string;
    path: string;
    sha: string;
    size: number;
    url: string;
    html_url: string;
    git_url: string;
    download_url: string;
    type: string;
    _links: GithubLinks;
}

/**
 * Represents the links associated with a GitHub file.
 */
export interface GithubLinks {
    self: string;
    git: string;
    html: string;
}



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

