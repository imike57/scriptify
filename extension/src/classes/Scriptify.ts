import { getWorkspaceFolder } from "../utils/getWorkspaceFolder";
import { getVersion } from "../utils/getVersion";

export class Scriptify {

  workspaceFolder = getWorkspaceFolder();

  /** Current extension version */
  version = getVersion();

}
