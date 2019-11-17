import Interceptor from './interceptor';
import ModuleManager from './../module-manager';
import InterceptModules from './intercept-modules';

export default class ExpressInterceptor implements Interceptor {
  private name = 'express';
  constructor(private moduleManger: ModuleManager) { }

  getModule() {
    return this.moduleManger.Modules[InterceptModules.Express];
  }

  canExecute(): boolean {
    return this.getModule() !== null;
  }

  intercept(reqMiddleware, errMiddleware) {
    if (this.canExecute()) {
      this.moduleManger.framework = this.name;
      const expressModule = this.getModule();
      const lazyrouter = expressModule.exports.application.lazyrouter;

      expressModule.exports.application.lazyrouter = function () {
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
