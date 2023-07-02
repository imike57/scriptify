const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const hbs = require('handlebars');

function transform(value) {
  return new Promise((resolve, reject) => {
    try {
      const data = value ? JSON.parse(value) : {};

      console.clear();

      const templateFolderPath = process.env.templateFolderPath;

      if (!templateFolderPath) {
        reject("No template path defined. Please add a template path to your configuration.");
      } else {

        const templateFullPath = path.join(process.argv[0], templateFolderPath);

        // Get file from the template path
        const files = fs.readdirSync(templateFullPath);

        vscode.window.showQuickPick(files, {
          title: "Select a template"
        }).then(async fileChoice => {

          if (fileChoice) {
            const file = fs.readFileSync(path.join(templateFullPath, fileChoice), "utf-8");
            const tpl = hbs.compile(file);
            const result = tpl(data);
            resolve(result);
          }
        });
      }

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = transform;