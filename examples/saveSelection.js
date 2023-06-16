const fs = require('fs');
const path = require('path');

function saveSelection(value) {
  // Get the path from the backup file
  const saveFolder = path.join(vscode.workspace.rootPath || '', '.scriptify', 'saved');
  if (!fs.existsSync(saveFolder)) {
    fs.mkdirSync(saveFolder, {
      recursive: true
    });
  }
  const saveFileName = `saved_selection_${Date.now()}.txt`;
  const saveFilePath = path.join(saveFolder, saveFileName);

  // Save the value of the selection in a file
  fs.writeFile(saveFilePath, value, (err) => {
    if (err) {
      _log('Failed to save selection:', err);
      vscode.window.showErrorMessage('Failed to save selection.');
    } else {
      _log('Selection saved successfully:', saveFilePath);
      vscode.window.showInformationMessage(`Selection saved successfully: ${saveFilePath}`);
    }
  });

  return value;
}

module.exports = saveSelection;