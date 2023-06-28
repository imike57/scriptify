import * as vscode from "vscode";
import { ScriptTreeItem } from "./ScriptTreeItem";
import { getScriptFiles } from "./utils";

/**
 * Tree view provider for scripts.
 */
export class ScriptsTreeProvider implements vscode.TreeDataProvider<ScriptTreeItem> {
    /**
     * Global scripts tree item.
     */
    globalItems: vscode.TreeItem = new vscode.TreeItem('Global', vscode.TreeItemCollapsibleState.Collapsed);

    /**
     * Local scripts tree item.
     */
    localItems: vscode.TreeItem = new vscode.TreeItem('Local', vscode.TreeItemCollapsibleState.Collapsed);

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
        console.log("element", element);
        if (element?.label === "Global") {
            return (await getScriptFiles("global")).map(scriptFile => {
                return new ScriptTreeItem(scriptFile.name, scriptFile);
            });
        } else if (element?.label === "Local") {
            return (await getScriptFiles("local")).map(scriptFile => {
                return new ScriptTreeItem(scriptFile.name, scriptFile);
            });
        } else {
            return [this.globalItems, this.localItems];
        }
    }

    /**
     * Retrieves the parent of a tree item.
     * @param element The script tree item.
     * @returns The parent tree item.
     */
    getParent?(element: ScriptTreeItem): vscode.ProviderResult<ScriptTreeItem> {
        throw new Error("Method not implemented.");
    }

    /**
     * Resolves a tree item asynchronously.
     * @param item The tree item to be resolved.
     * @param element The associated script tree item.
     * @param token A cancellation token.
     * @returns The resolved tree item.
     */
    resolveTreeItem?(item: vscode.TreeItem, element: ScriptTreeItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error("Method not implemented.");
    }
}
