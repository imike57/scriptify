const _ = _require('lodash');

function transform(value) {

    return new Promise((resolve, reject) => {

        const lodashFns = Object.entries(_).filter(el => typeof el[1] === "function");
        const keys = lodashFns.map(el => el[0]);
        vscode.window.showQuickPick(keys).then(async val => {

            scriptify.log(`${val}`);

            const getFnParams = (fn) => {
                return fn.toString()
                    .match(/\(.*?\)/)[0]
                    .replace(/[()]/g, '')
                    .split(',')
                    .map(param => param.trim());
            };
            const fn = _[val];
            const fnParams = getFnParams(fn);
            const userParams = [];

            for (const [index, param] of fnParams.entries()) {
                await vscode.window.showInputBox({
                  prompt: `Please enter a value for the param "${param}"`,
                  value: index === 0 ? value : ""
                }).then(val => {
                    userParams.push(parseData(val));
                });
            }

            scriptify.log("Your params: ", userParams);

            const result = fn(...userParams);
            scriptify.log("Result: ", result);

            if (typeof result === "object") {
              resolve(JSON.stringify(fn.apply(null, userParams ))) ;

            } else {
              resolve(fn.apply(null, userParams )) ;

            }

        });


    });
}


function parseData(data) {

  if (data === "") {
    return undefined;
  } else if (data === 'undefined') {
    return undefined;
  } else if (data === 'null') {
    return null;
  } else if (data === 'true') {
    return true;
  } else if (data === 'false') {
    return false;
  } else if (!isNaN(Number(data))) {
    return Number(data);
  } else if (data.startsWith('"') && data.endsWith('"')) {
    return data.slice(1, -1);
  } else if (data.startsWith('[') && data.endsWith(']')) {
    try {
      return eval(data);
    } catch (error) {
      return data;
    }
  } else if (data.startsWith('{') && data.endsWith('}')) {
    try {
      return eval(data);
    } catch (error) {
      return data;
    }
  } else {
    return data;
  }
}



module.exports = transform;