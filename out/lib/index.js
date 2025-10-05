import { LiveLoader } from "yaml-extend";
const liveLoader = new LiveLoader();
export function addModule(path) {
    const value = liveLoader.addModule(path, undefined);
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
//# sourceMappingURL=index.js.map