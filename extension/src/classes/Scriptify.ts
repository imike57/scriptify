import { getWorkspaceFolder, getVersion } from "../utils";

export class Scriptify {

  workspaceFolder = getWorkspaceFolder(true);

  /** Current extension version */
  version = getVersion();

}
