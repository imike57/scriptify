import * as vscode from "vscode";

const NAMESPACE = "client";

/** Represents the storage for the client. */
export class ClientStorage {

    private context: vscode.ExtensionContext;

    /** Stores the data. */
    private storage: { [key: string]: any } = {};

    /**
     * Initializes a new instance of the ClientStorage class.
     * @param context The extension context.
     * @param location The storage location ("globalState" or "workspaceState").
     */
    constructor(context: vscode.ExtensionContext, location: "globalState" | "workspaceState") {
        this.context = context;
        this.storage = this.context[location].get(NAMESPACE) || {};
    }

    /** Returns the keys of the stored data. */
    get keys() {
        return Object.keys(this.storage);
    }

    /**
     * Updates the value for the specified key in the storage.
     * @param key The key.
     * @param value The value.
     * @emits {string} update - The "update" event is emitted when the storage is updated.
     */
    update(key: string, value: any) {
        if (key) {
            this.storage[key] = value;
            return this.context.globalState.update(NAMESPACE, this.storage);
        }
    }

    /**
     * Retrieves the value associated with the specified key from the storage.
     * @param key The key.
     * @returns The value associated with the key.
     */
    get(key: string) {
        return this.storage[key];
    }
}