export default class ModuleManager {
  private _modules: Object;

  constructor() {
    this._modules = this.getLoadedModules();
  }

  get Modules(): Object {
    return this._modules;
  }

  private getLoadedModules() {
    const loadedModules = {};
    const dirname = process.cwd();
    const modules = require.cache;


    Object.entries(modules).forEach(([key, val]) => {
      const moduleName = key.replace(dirname, '');
      loadedModules[moduleName] = val;
    });

    return loadedModules;
  }
}