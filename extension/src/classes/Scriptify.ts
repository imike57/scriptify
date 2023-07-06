import { getWorkspaceFolder, getVersion } from "../utils";

export class Scriptify {

  workspaceFolder = getWorkspaceFolder();

  /** Current extension version */
  version = getVersion();

}
