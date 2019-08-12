import { readFile } from 'fs';
import { join } from 'path';

export default class ModuleManager {
  private _modules: Object;

  constructor() {
    this._modules = this.getLoadedModules();
  }

  get Modules(): Object {
    return this._modules;
  }

  private getAllRegisteredModules() {
    const registeredModules = {};
    const basePath = process.cwd();
    const packagesPath = join(basePath, 'packages.json');

    readFile(packagesPath, 'utf-8', (err, content) => {
      if (err) {
        return;
      }
      const pkg = JSON.parse(content);
      pkg.dependencies;
    })
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