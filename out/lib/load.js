import { LiveLoader } from "yaml-extend";
import { handleError, clearErrors } from "../errors/index.js";
const liveLoader = new LiveLoader({
    unsafe: true,
    onUpdate(path, newLoad) {
        // clear errors on successful load
        clearErrors(path);
        // debugging
        console.debug(`File: ${path} is updated`);
        console.debug("New load:", newLoad);
        const modules = liveLoader.getAllModules();
        console.debug(`Remaining modules: ${Object.keys(modules).join(", ")}`);
    },
    onError(path, error) {
        // add error
        handleError(path, error);
        // debugging
        console.debug(`File: ${path} threw an error`);
        console.debug("Error:", error);
        const modules = liveLoader.getAllModules();
        console.debug(`Remaining modules: ${Object.keys(modules).join(", ")}`);
    },
});
export async function addModule(path) {
    const value = await liveLoader.addModuleAsync(path, undefined);
    return value;
}
export function getModule(path) {
    return liveLoader.getModule(path);
}
export function getAllModules() {
    return liveLoader.getAllModules();
}
export function getCache(path) {
    return liveLoader.getCache(path);
}
export function getAllCache() {
    return liveLoader.getAllCache();
}
export function deleteModule(path) {
    liveLoader.deleteModule(path);
}
export function deleteAllModules() {
    liveLoader.deleteAllModules();
}
export default liveLoader;
//# sourceMappingURL=load.js.map