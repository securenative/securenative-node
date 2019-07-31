import Interceptor from './interceptor';
import ModuleManager from './../module-manager';
import InterceptModules from './intercept-modules';

export default class ExpressInterceptor implements Interceptor {

  constructor(private moduleManger: ModuleManager) { }

  getModule() {
    return this.moduleManger.Modules[InterceptModules.Express];
  }

  canExecute(): boolean {
    return this.getModule() !== null;
  }

  intercept(middleware) {
    if (this.canExecute()) {
      const expressModule = this.getModule();
      const lazyrouter = expressModule.exports.application.lazyrouter;

      expressModule.exports.application.lazyrouter = function () {
        const res = lazyrouter.apply(this, arguments);
        if (!this.middlewareLoaded) {
          this._router.use(middleware);

          this.middlewareLoaded = true;
        }
        return res;
      };
    }
  }
}
