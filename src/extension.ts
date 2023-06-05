// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';


function createScriptFile() {
	vscode.window.showInputBox({
		prompt: "Enter script name"
	}).then(scriptName => {
		if (scriptName) {
			const scriptFolder = path.join(vscode.workspace.rootPath || '', '.scriptify');
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

			vscode.window.showInformationMessage(`Script "${scriptName}" created successfully.`);
		}
	});
}


function applyScript() {
	const scriptFolder = path.join(vscode.workspace.rootPath || '', '.scriptify');
	if (!fs.existsSync(scriptFolder)) {
		vscode.window.showErrorMessage('No scripts found.');
		return;
	}

	fs.readdir(scriptFolder, (err, files) => {
		if (err) {
			vscode.window.showErrorMessage('Failed to read scripts folder.');
			return;
		}

		if (files.length === 0) {
			vscode.window.showErrorMessage('No scripts found.');
			return;
		}

		vscode.window.showQuickPick(files, {
			placeHolder: 'Select a script to apply'
		}).then(selectedScript => {
			if (selectedScript) {
				const scriptPath = path.join(scriptFolder, selectedScript);
				console.log("scriptPath", scriptPath);

				var sc = fs.readFileSync(scriptPath, "utf-8");
				console.log("sc", sc);
				const transform = eval(sc);
				console.log("transform", transform);
				const editor = vscode.window.activeTextEditor;

				console.log(editor);

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
			}
		});
	});
}




// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('scriptify.createScript', createScriptFile),
		vscode.commands.registerCommand('scriptify.applyScript', applyScript)
	);
}


// This method is called when your extension is deactivated
export function deactivate() { }
