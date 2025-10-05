import * as vscode from "vscode";
import { isAbsolute, join } from "path";
import { watch, existsSync } from "fs";
import { Schema } from "yaml-extend";
import { pathToFileURL } from "url";
import liveLoader from "./load.js";
/** Path of yaml-extend shcema */
let SCHEMA_PATH = "";
/** Watcher that watches file exporting yaml-extend schema. */
let WATCHER = null;
/** Regex to handle .ts conversion to .js. */
const TS_REGEX = /.ts$/;
/** Function to read config of yaml-extend and return schema path. */
function readConfig() {
    // Read config
    const config = vscode.workspace.getConfiguration();
    const schemaPath = config.get("yamlExtend.schema");
    if (!schemaPath) {
        vscode.window.showWarningMessage("yaml-extend schema path is not configured.");
        return;
    }
    // Convert relative path to absolute path
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace open.");
        return;
    }
    const absolutePath = isAbsolute(schemaPath)
        ? schemaPath
        : join(workspaceFolder, schemaPath);
    if (!existsSync(absolutePath)) {
        vscode.window.showErrorMessage(`Schema file not found: ${absolutePath}`);
        return;
    }
    return absolutePath;
}
/** Function to import schema. */
async function importSchema(schemaPath, isConsole) {
    // For Windows ensure we pass a file:// URL
    const fileUrl = pathToFileURL(schemaPath).href;
    // normalize extension (ts to js)
    const jsFileUrl = fileUrl.replace(TS_REGEX, "js");
    // Append a cache-busting query to force re-import if you want hot-reload:
    const importUrl = `${jsFileUrl}?t=${Date.now()}`;
    // Dynamically import user file
    console.debug("Path used: ", importUrl);
    const mod = await import(importUrl);
    console.debug("Imported: ", mod);
    // exported item might be default or named; normalize it:
    const schema = (mod && (mod.default ?? mod));
    // if return of the path is not a Schema class show error message
    if (!(schema instanceof Schema)) {
        vscode.window.showErrorMessage("yaml-extend schema file does not export a default schema.");
        return;
    }
    // console that schama has been fetched successfuly if defined
    if (isConsole)
        vscode.window.showInformationMessage(`Schema loaded successfuly from path: ${schemaPath}`);
    // return schema
    return schema;
}
/** Function to reset watcher. */
function resetWatcher() {
    if (WATCHER) {
        WATCHER.removeAllListeners();
        WATCHER.close();
        WATCHER = null;
    }
}
/** Function to handle config from reading, update if changed and watching file. */
async function handleConfig() {
    try {
        // read new path
        const path = readConfig();
        console.debug("Path fetched with value: ", path);
        // if new path is supplied and different from old path
        if (path && path !== SCHEMA_PATH) {
            // update SCHEMA_PATH
            SCHEMA_PATH = path;
            // import schema and use it
            const schema = await importSchema(path, true);
            console.debug("Schema imported: ", schema);
            liveLoader.setOptions({ schema });
            // delete old watcher if present
            resetWatcher();
            console.debug("Watcher resetted.");
            // update watcher with new watcher
            WATCHER = watch(SCHEMA_PATH, {}, async (e, filename) => {
                // if file is changed re import schema
                if (e === "change") {
                    const schema = await importSchema(path, false);
                    liveLoader.setOptions({ schema });
                }
                // if file is renamed delete watcher
                if (e === "rename")
                    resetWatcher();
            });
        }
        console.debug("New watcher: ", WATCHER);
    }
    catch (err) {
        console.debug("Failed to load yaml-extend schema: ", err);
        vscode.window.showErrorMessage(`Failed to load yaml-extend schema: ${err}`);
    }
}
export const onConfigChange = vscode.workspace.onDidChangeConfiguration(async (e) => {
    await handleConfig();
});
// read config for the first time
await handleConfig();
//# sourceMappingURL=schema.js.map