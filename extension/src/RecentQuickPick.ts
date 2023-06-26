import { extensionContext } from "./extension";
import * as vscode from "vscode";

export class RecentQuickPick<T extends vscode.QuickPickItem> {
    namespace: string = "RecentQuickPick";

    key: string;

    maxHistory:number;

    items:T[];

    options?:vscode.QuickPickOptions & { canPickMany: true } & { maxHistory:number};

    token?: vscode.CancellationToken;

    recentSeparator:vscode.QuickPickItem = {
        kind: vscode.QuickPickItemKind.Separator,
        label: "Recent"
    };

    separator:vscode.QuickPickItem = {
        kind: vscode.QuickPickItemKind.Separator,
        label: ""
    };

    constructor(key: string, items:T[],  options?:vscode.QuickPickOptions & { canPickMany: true } & { maxHistory:number}, token?: vscode.CancellationToken) {

        this.key = key;

        this.items = items;

        this.options = options;

        this.token = token;

        this.maxHistory = options?.maxHistory || 10;

        console.log(this.currentStorage);

      
    }

    show(): Promise<T | undefined> {

        const itemsNotRecent = this.items.filter(item => {
            return !this.currentStorage.find(recentItem => recentItem.label === item.label);
        });
        const list = [this.recentSeparator as T, ...this.currentStorage, this.separator as T, ...itemsNotRecent];
        return new Promise<T | undefined>((resolve, reject) => {

            vscode.window.showQuickPick<T>(list, this.options, this.token).then(value => {
                if (value) {
                    this.setRecent(value);
                }
                resolve(value);

            }, (reason) => {
                reject(reason);
            });

        });
    }


    get currentStorage(): T[] {

        const ctx = extensionContext?.globalState.get<T[]>(this.namespace);

        return ctx || [];
    }

   

    setRecent(item:T) {
        const newStorage = this.currentStorage.filter(el => el.label !== item.label);

        newStorage.unshift(item);

        if (this.currentStorage.length > this.maxHistory) {
            newStorage.slice(0, this.maxHistory);
        }
        extensionContext?.globalState.update(this.namespace, newStorage);

    }

    clear(){
        extensionContext?.globalState.update(this.namespace, []);
    }
    


}
