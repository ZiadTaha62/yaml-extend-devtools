import { LiveLoader } from "yaml-extend";
import { handleError } from "./erros.js";
const liveLoader = new LiveLoader({
    unsafe: true,
    ignoreTags: true,
    onError(path, error) {
        handleError(path, error);
    },
});
export async function addModule(path) {
    const value = await liveLoader.addModuleAsync(path, undefined);
    return value;
}
export function getModule(path, ignorePrivate) {
    return liveLoader.getModule(path, ignorePrivate);
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
//# sourceMappingURL=liveLoader.js.map