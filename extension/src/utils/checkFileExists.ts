import * as fs from 'fs';

/**
 * Checks if a file exists at the specified file path.
 * @param filePath - The path of the file to check.
 * @returns `true` if the file exists, `false` otherwise.
 */
export function checkFileExists(filePath: string) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}
