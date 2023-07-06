import * as fs from 'fs';

/**
 * Checks if a directory exists at the specified path.
 * @param directoryPath The path of the directory to check.
 * @returns true if the directory exists, false otherwise.
 */
export function checkDirectoryExists(directoryPath: string): boolean {
    try {
        const stat = fs.statSync(directoryPath);
        return stat.isDirectory();
    } catch (error) {
        return false;
    }
}
