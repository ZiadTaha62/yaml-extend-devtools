import * as vscode from "vscode";
import { addModule, deleteModule, getAllModules, deleteAllModules, } from "../lib/load.js";
export const onOpen = vscode.workspace.onDidOpenTextDocument(async (e) => {
    if (e.languageId === "yaml") {
        await addModule(e.fileName);
        console.debug(`${e.fileName} is added.`);
        const modules = getAllModules();
        console.debug(`Remaining modules: ${Object.keys(modules).join(", ")}`);
    }
});
export const onClose = vscode.workspace.onDidCloseTextDocument((e) => {
    if (e.languageId === "yaml") {
        deleteModule(e.fileName);
        console.debug(`${e.fileName} is deleted.`);
        const modules = getAllModules();
        console.debug(`Remaining modules: ${Object.keys(modules).join(", ")}`);
    }
});
export const onDeactivate = () => deleteAllModules();
//# sourceMappingURL=index.js.map