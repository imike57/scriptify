import { getVersion, getWorkspaceFolder } from '../utils';

export class Scriptify {

  workspaceFolder = getWorkspaceFolder();

  /** Current extension version */
  version = getVersion();

}
