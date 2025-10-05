import { LiveLoader, type ModuleLoadCache } from "yaml-extend";
import { handleError } from "./erros.js";

const liveLoader = new LiveLoader({
  unsafe: true,
  ignoreTags: true,
  onError(path, error) {
    handleError(path, error);
  },
});

export async function addModule(path: string): Promise<unknown | undefined> {
  const value = await liveLoader.addModuleAsync(path, undefined);
  return value;
}

export function getModule(
  path: string,
  ignorePrivate: boolean
): unknown | undefined {
  return liveLoader.getModule(path, ignorePrivate);
}

export function getAllModules(): Record<string, unknown> {
  return liveLoader.getAllModules();
}

export function getCache(path: string): ModuleLoadCache | undefined {
  return liveLoader.getCache(path);
}

export function getAllCache(): Record<string, ModuleLoadCache> {
  return liveLoader.getAllCache();
}

export function deleteModule(path: string) {
  liveLoader.deleteModule(path);
}

export function deleteAllModules() {
  liveLoader.deleteAllModules();
}

export default liveLoader;
