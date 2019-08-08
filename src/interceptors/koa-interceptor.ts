import Interceptor from './interceptor';
import ModuleManager from '../module-manager';
import InterceptModules from './intercept-modules';

export default class KoaInterceptor implements Interceptor {

  constructor(private moduleManger: ModuleManager) { }

  getModule() {
    return this.moduleManger.Modules[InterceptModules.Koa];
  }

  canExecute(): boolean {
    return this.getModule() !== null;
  }

  intercept(middleware) {
    if (this.canExecute()) {
      const koaModule = this.getModule();
      const lazyrouter = koaModule.exports.application.lazyrouter;

      koaModule.exports.application.lazyrouter = function () {
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
