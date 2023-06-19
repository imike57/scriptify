import * as vscode from 'vscode';
import axios from "axios";
import { getVersion, getWorkspaceFolder } from './utils';

export class Scriptify {

  workspaceFolder = getWorkspaceFolder();

  /** Current extension version */
  version = getVersion();


  /**
   * Represents the `Scriptify` output channel.
   */
  outputChannel = vscode.window.createOutputChannel('Scriptify', 'javascript');

  /**
   * Axios library for making HTTP requests.
   */
  axios = axios;

  /**
   * VS Code API for interacting with Visual Studio Code.
   */
  vscode = vscode;

  /**
   * Use outputChannel to log messages.
   * @param {...any} data - The data to be logged.
   */
  log(...data: any[]) {
    this.outputChannel.show(true);
    this.outputChannel.append(data.join(' '));
    this.outputChannel.append("\r");
  }
}
