

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
        defaultEnv?: any;
    };
}

interface Dependencies {
    [key: string]: string
}

