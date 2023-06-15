/**
 * Represents a script file.
 */
export interface ScriptFile {
    name: string;
    uri: string;
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
