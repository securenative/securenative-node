import { join } from "path";
import { IInterceptor } from './interceptor';
import ModuleManager from '../module-manager';
import InterceptionModule from '../enums/interception-module';
import { isModuleExists } from './../utils/utils';
import { Logger } from './../logger';

export default class HapiInterceptor implements IInterceptor {
  private name = 'hapi';
  private modulePath = join(process.cwd(), InterceptionModule.Hapi);
  constructor(private moduleManger: ModuleManager) { }

  getModule() {
    return require(this.modulePath);
  }

  canExecute(): boolean {
    const exists = isModuleExists(this.modulePath);
    Logger.debug(`Checking ${InterceptionModule.Express} module, found: ${exists}`);
    return exists;
  }

  intercept(reqMiddleware, errMiddleware) {
    if (this.canExecute()) {
      this.moduleManger.framework = this.name;
      const HapiModule = this.getModule();
      const original = HapiModule.exports.prototype.register;

      HapiModule.exports.prototype.register = function () {
        if (!this.middlewareLoaded) {
          this.middlewareLoaded = true;
          original.call(this, { plugin: reqMiddleware });
        }
        original.apply(this, arguments);
      }
    }
  }
}
