import { IInterceptor } from './interceptor';
import ModuleManager from '../module-manager';
import { SecureNativeOptions } from '../types/securenative-options';
import ExpressInterceptor from './express-interceptor';
import KoaInterceptor from './koa-interceptor';
import HapiInterceptor from './hapi-interceptor';
import HttpServerInterceptor from './http-server-interceptor';
import HttpsServerInterceptor from './https-server-interceptor';
import ApiManager from '../api-manager';

export default class InterceptorManager {
  constructor(private moduleManager: ModuleManager, private apiManager: ApiManager, private options: SecureNativeOptions) {}

  private getAllInterceptors(): Array<IInterceptor> {
    return [
      new HttpServerInterceptor(this.moduleManager, this.apiManager, this.options),
      new HttpsServerInterceptor(this.moduleManager,this.apiManager, this.options),
      new ExpressInterceptor(this.moduleManager),
      new KoaInterceptor(this.moduleManager),
      new HapiInterceptor(this.moduleManager),
    ];
  }

  applyInterceptors(reqMiddleware: any, errMiddleware: any) {
    const interceptors = this.getAllInterceptors();
    interceptors.forEach((interceptor) => interceptor.intercept(reqMiddleware, errMiddleware));
  }
}
