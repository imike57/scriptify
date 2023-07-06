import * as vscode from "vscode";
import { ScriptFile } from "../defs/ScriptFile";

/**
 * Represents a script tree item in the tree view.
 */
export class ScriptTreeItem extends vscode.TreeItem {
    /**
     * The context value for the tree item.
     */
    contextValue?: string | undefined = "ScriptTreeItem";

    /**
     * The associated script file.
     */
    script?: ScriptFile;

    /**
     * Creates a new instance of ScriptTreeItem.
     * @param name The name of the script.
     * @param script The associated script file.
     * @param collapsibleState The collapsible state of the tree item.
     */
    constructor(name: string, script?: ScriptFile, collapsibleState?: vscode.TreeItemCollapsibleState) {
        super(name, collapsibleState);
        this.script = script;

        this.tooltip = script?.description;
    }
}
