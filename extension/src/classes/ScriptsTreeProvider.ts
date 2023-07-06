import * as vscode from "vscode";
import { ScriptTreeItem } from "./ScriptTreeItem";
import { getScriptFiles } from "../utils";
import { ScriptScope } from "./ScriptScope";

/**
 * Tree view provider for scripts.
 */
export class ScriptsTreeProvider implements vscode.TreeDataProvider<ScriptTreeItem> {
    /**
     * Global scripts tree item.
     */
    globalItems: vscode.TreeItem = new vscode.TreeItem('Global', vscode.TreeItemCollapsibleState.Expanded);

    /**
     * Local scripts tree item.
     */
    localItems: vscode.TreeItem = new vscode.TreeItem('Local', vscode.TreeItemCollapsibleState.Expanded);

    /**
     * Event emitter for tree data changes.
     */
    private _onDidChangeTreeData: vscode.EventEmitter<ScriptTreeItem | undefined | null | void> = new vscode.EventEmitter<ScriptTreeItem | undefined | null | void>();
    /**
     * Event that fires when the tree data changes.
     */
    readonly onDidChangeTreeData: vscode.Event<ScriptTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    /**
     * Refreshes the tree view.
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    /**
     * Retrieves the tree item representation of an element.
     * @param element The script tree item.
     * @returns The tree item.
     */
    getTreeItem(element: ScriptTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    /**
     * Retrieves the child elements of a tree item.
     * @param element The parent tree item.
     * @returns The array of script tree items.
     */
    async getChildren(element?: ScriptTreeItem | undefined): Promise<ScriptTreeItem[]> {
        const globalScripts = await getScriptFiles(ScriptScope.global);
        const localScripts = await getScriptFiles(ScriptScope.local);

        if (!localScripts.length && !globalScripts.length) {
            return [];
        }
        
        if (element?.label === "Global") {
            return globalScripts.map(scriptFile => {
                return new ScriptTreeItem(scriptFile.name, scriptFile);
            });
        } else if (element?.label === "Local") {
            return localScripts.map(scriptFile => {
                return new ScriptTreeItem(scriptFile.name, scriptFile);
            });
        } else {
            const root = [];
            if (globalScripts.length) {
                root.push(this.globalItems);
            }

            if (localScripts.length) {
                root.push(this.localItems);
            }

            return root;
        }
    }

    /**
     * Retrieves the parent of a tree item.
     * @param element The script tree item.
     * @returns The parent tree item.
     */
    getParent?(element: ScriptTreeItem): vscode.ProviderResult<ScriptTreeItem> {
        return null;
    }

    /**
     * Resolves a tree item asynchronously.
     * @param item The tree item to be resolved.
     * @param element The associated script tree item.
     * @param token A cancellation token.
     * @returns The resolved tree item.
     */
    resolveTreeItem?(item: vscode.TreeItem, element: ScriptTreeItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        return item;
    }
}
