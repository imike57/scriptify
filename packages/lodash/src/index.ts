import _, { LoDashStatic } from 'lodash';
import vscode, { window } from 'vscode';


const excludedProperties = ["_"];

async function transform(value: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const lodashFns = Object.entries(_).filter(
      (el: [string, any]) => typeof el[1] === 'function' && !excludedProperties.includes(el[0])
    );
    const keys = lodashFns.map((el: [string, any]) => el[0]);
    window.showQuickPick(keys).then(async (val: string | undefined) => {
      if (!val) {
        reject(new Error('No value selected'));
        return;
      }

      console.log(`${val}`);

      const getFnParams = (fn: any): string[] => {
        const fnString = fn.toString();
        const paramRegex = /\(([^)]+)\)/;
        const match = fnString.match(paramRegex);
      
        if (match && match[1]) {
          return match[1].split(',').map((param:any) => param.trim());
        }
      
        return [];
      };
      

      const fn:any = _[val as keyof LoDashStatic];
      const fnParams = getFnParams(fn);
      const userParams: any[] = [];

      for (const [index, param] of fnParams.entries()) {
        const inputBoxOptions: { prompt: string; value?: string } = {
          prompt: `Please enter a value for the param "${param}"`,
        };

        if (index === 0) {
          inputBoxOptions.value = value;
        }

        await window
          .showInputBox(inputBoxOptions)
          .then((val: string | undefined) => {
            if (val) {
              userParams.push(parseData(val));
            }
          });
      }

      console.log('Your params: ', userParams);

      const result = fn(...userParams);
      console.log('Result: ', result);

      if (typeof result === 'object') {
        resolve(JSON.stringify(fn.apply(null, userParams)));
      } else {
        resolve(fn.apply(null, userParams));
      }
    });
  });
}

function parseData(data: string): any {
  if (data === '') {
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