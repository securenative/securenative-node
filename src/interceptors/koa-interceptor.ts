import Interceptor from './interceptor';
import ModuleManager from '../module-manager';
import InterceptModules from './intercept-modules';

export default class KoaInterceptor implements Interceptor {
  private name = 'koa';
  constructor(private moduleManger: ModuleManager) { }

  getModule() {
    return this.moduleManger.Modules[InterceptModules.Koa];
  }

  canExecute(): boolean {
    return this.getModule() !== null && this.getModule() !== undefined;
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
