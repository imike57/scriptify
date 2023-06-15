const https = require('https');

function transform(value) {
  return new Promise((resolve, reject) => {

    const items = ["products", "carts", "users", "posts", "comments", "quotes", "todos"];

    /**
     * Displays a quick pick menu to select an item type.
     */
    vscode.window.showQuickPick(items, {
      placeHolder: 'Select an item type.'
    }).then(selectedItem => {

      const pickOptions = [
        `get all`,
        `get one`
      ];

      /**
       * Displays a quick pick menu to select an option.
       */
      vscode.window.showQuickPick(pickOptions, {
        placeHolder: "Select all or select one by id"
      }).then(async pickedOption => {

        let dummyPath = `/${selectedItem}`;
        if (pickedOption === "get one") {
          await vscode.window.showInputBox({
            prompt: "Choose an id"
          }).then(id => {
            dummyPath = `${dummyPath}/${id}`;
          });
        }

        vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: `Request to dummyjson.com`,
          cancellable: false
        }, async (progress, token) => {
          progress.report({
            increment: 0
          });

          const options = {
            hostname: 'dummyjson.com',
            path: dummyPath,
            method: 'GET'
          };

          const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
              data += chunk;
            });

            res.on('end', () => {
              const json = JSON.parse(data);
              console.log(JSON.stringify(json));

              progress.report({
                increment: 100,
                message: `Done`
              });
              resolve(JSON.stringify(json, null, 4));
            });
          });

          req.on('error', (error) => {
            console.error(error);
            reject(error);
          });

          req.end();
        });
      });
    }).catch(err => {
      console.log(err);
    });
  });
}

module.exports = transform;
