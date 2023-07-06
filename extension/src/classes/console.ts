import { Writable } from 'stream';
import { Console } from 'console';
import * as vscode from "vscode";
const outputChannel = vscode.window.createOutputChannel('Scriptify', 'javascript');


/**
 * Represents a writable stream for capturing output data.
 */
class OutputCapture extends Writable {
  data: string;

  constructor(options?: any) {
    super(options);
    this.data = '';
  }

  /**
   * Writes data to the stream.
   * @param chunk - The data chunk to be written.
   * @param encoding - The encoding of the data.
   * @param callback - A function to be called when the write operation is complete.
   */
  _write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
    this.data += chunk.toString();
    outputChannel.show(true);
    outputChannel.append(chunk.toString());
    callback();
  }
}

/**
 * Represents a custom console that extends the built-in Console class.
 */
class CustomConsole extends Console {

  /**
   * Creates a new instance of CustomConsole.
   * @param options - The options for creating the console.
   */
  constructor(options: console.ConsoleConstructorOptions){
    super(options);
  }

  /**
   * Clears the output channel.
   */
  clear(): void {
    outputChannel.clear();
  }
}

/**
 * The scriptifyConsole instance of CustomConsole.
 */
export const scriptifyConsole = new CustomConsole({ stdout: new OutputCapture(), stderr: new OutputCapture() });