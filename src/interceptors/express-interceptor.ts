import { join } from "path";
import { IInterceptor } from './interceptor';
import ModuleManager from './../module-manager';
import InterceptionModule from '../enums/interception-module';
import { isModuleExists } from './../utils/utils';
import { Logger } from './../logger';

export default class ExpressInterceptor implements IInterceptor {
  private name = 'express';
  private modulePath = join(process.cwd(), InterceptionModule.Express);

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
      Logger.debug(`Creating ${this.name} interceptor`);
      this.moduleManger.framework = this.name;
      const expressModule = this.getModule();

      const lazyrouter = expressModule.application.lazyrouter;

      expressModule.application.lazyrouter = function () {
        const res = lazyrouter.apply(this, arguments);
        if (!this.middlewareLoaded) {
          this._router.use(reqMiddleware);

          this.middlewareLoaded = true;
        }

        if (!this.errMiddlewareLoaded) {
          this._router.use(errMiddleware);

          this.errMiddlewareLoaded = true;
        }
        return res;
      };
    }
  }
}
