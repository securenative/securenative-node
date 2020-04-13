import { join } from "path";
import { IInterceptor } from './interceptor';
import ModuleManager from '../module-manager';
import InterceptionModule from '../enums/interception-module';
import { isModuleExists } from './../utils/utils';
import { Logger } from './../logger';

export default class KoaInterceptor implements IInterceptor {
  private name = 'koa';
  private modulePath = join(process.cwd(), InterceptionModule.Koa);
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
      const koaModule = this.getModule();
      const app = koaModule.exports.prototype.use;

      koaModule.exports.prototype.use = function () {
        app.apply(this, arguments);
        if (!this.middlewareLoaded) {
          this.middlewareLoaded = true;
          this.middleware.unshift(reqMiddleware);
        }
      }
    }
  }
}
