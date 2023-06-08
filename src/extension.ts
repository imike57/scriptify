// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

interface ScriptFile {
	name: string,
	uri: string,
}

// const terminal = vscode.window.createTerminal('Scriptify');
const outputChanel = vscode.window.createOutputChannel('Scriptify');

function getGlobalFolder(): string {
	return vscode.workspace.getConfiguration('scriptify').get<string>('globalFolderLocation') || os.tmpdir();
}

function getWorkspaceFolder(ignoreErrors = false): string | null {
	const {workspaceFolders} = vscode.workspace;
	if (!workspaceFolders || workspaceFolders.length === 0) {
		if (!ignoreErrors) {
			throw new Error('No folder open. Add a folder to your workspace, or create a global script file instead.');
		}
		return null;
	}
	if (workspaceFolders.length > 1) {
		if (!ignoreErrors) {
			throw new Error('Local script files cannot be created on workspaces with multiple folders open. Create a global script file instead.');
		}
		return null;
	}
	return workspaceFolders[0].uri.fsPath;
}
 
function createScriptFile(createGlobally = false) {
	let workspaceFolder : string;
	if (!createGlobally) {
		try {
			workspaceFolder = getWorkspaceFolder() || "";
		}
		catch (err) {
			return vscode.window.showErrorMessage(`${err}`);
		}
	}
	
	vscode.window.showInputBox({
		prompt: "Enter script name"
	}).then(scriptName => {
		if (scriptName) {
		  const parentPath = createGlobally ? getGlobalFolder() : workspaceFolder;
			const scriptFolder = path.join(parentPath, '.scriptify');
			if (!fs.existsSync(scriptFolder)) {
				fs.mkdirSync(scriptFolder);
			}

			const scriptPath = path.join(scriptFolder, `${scriptName}.js`);
			const scriptContent = `
function transform(value) {
  // TODO: Implement your transformation logic here
  return value;
}

module.exports = transform;
`;

			fs.writeFileSync(scriptPath, scriptContent); 

			vscode.workspace.openTextDocument(scriptPath).then(doc => vscode.window.showTextDocument(doc));

			vscode.window.showInformationMessage(`Script "${scriptName}" created successfully.`);
		}
	});
}

function createGlobalScriptFile() {
	createScriptFile(true);
}

function getScriptFiles(parentPath: string) : Array<ScriptFile> {
	const scriptFolder = path.join(parentPath || '', '.scriptify');
	if (!fs.existsSync(scriptFolder)) {
		return [];
	}

	return fs.readdirSync(scriptFolder).map(f => ({
		name: f.replace(/\.js$/g, ""),
		uri: path.join(scriptFolder, f),
	}));
}

function applyScript() {
	let files: Array<ScriptFile> = [];
	try {
		files = getScriptFiles(getWorkspaceFolder(true) || "")
			.concat(getScriptFiles(getGlobalFolder()));
	}
	catch (err) {
		return vscode.window.showErrorMessage(`${err}`);
	}

	if (files.length === 0) {
		vscode.window.showErrorMessage('No scripts found.');
		return;
	}

	vscode.window.showQuickPick(files.map(f => f.name), {
		placeHolder: 'Select a script to apply'
	}).then(selectedScriptName => {
		if (selectedScriptName) {
			try {
				const file = files.find(f => f.name === selectedScriptName);
				if (!file) {
					vscode.window.showErrorMessage(`Script "${selectedScriptName}" not found.`);
					return;
				}
				const scriptPath = file.uri;
				console.log("scriptPath", scriptPath);

				var scriptString = fs.readFileSync(scriptPath, "utf-8");
				const transform = eval(scriptString);
				const editor = vscode.window.activeTextEditor;

				if (editor) {
					const document = editor.document;
					const selections = editor.selections;
					const transformedTexts = selections.map(selection => {
						const selectedText = document.getText(selection);
						return transform(selectedText);
					});

					editor.edit(editBuilder => {
						selections.forEach((selection, index) => {
							editBuilder.replace(selection, transformedTexts[index]);
						});
					}).then(success => {
						if (success) {
							vscode.window.showInformationMessage('Script applied successfully.');
						} else {
							vscode.window.showErrorMessage('Failed to apply script.');
						}
					});
				}
			} catch (error:any) {
				console.log(error);
				outputChanel.show(true);
				outputChanel.append(error);
			}
		}
	});
}




// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('scriptify.createScript', createScriptFile),
		vscode.commands.registerCommand('scriptify.createGlobalScript', createGlobalScriptFile),
		vscode.commands.registerCommand('scriptify.applyScript', applyScript)
	);
}


// This method is called when your extension is deactivated
export function deactivate() { }
