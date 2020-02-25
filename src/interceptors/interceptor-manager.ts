import { IInterceptor } from './interceptor';
import ModuleManager from '../module-manager';
import { SecureNativeOptions } from '../types/securenative-options';
import ExpressInterceptor from './express-interceptor';
import KoaInterceptor from './koa-interceptor';
import HapiInterceptor from './hapi-interceptor';
import HttpServerInterceptor from './http-server-interceptor';
import HttpsServerInterceptor from './https-server-interceptor';

export default class InterceptorManager {
  private static getAllInterceptors(moduleManager: ModuleManager, options: SecureNativeOptions): Array<IInterceptor> {
    return [
      new HttpServerInterceptor(moduleManager, options),
      //new HttpsServerInterceptor(moduleManager),
      new ExpressInterceptor(moduleManager),
      new KoaInterceptor(moduleManager),
      new HapiInterceptor(moduleManager)
    ];
  }

  static applyInterceptors(moduleManager: ModuleManager, options: SecureNativeOptions, reqMiddleware: any, errMiddleware: any) {
    const interceptors = InterceptorManager.getAllInterceptors(moduleManager, options);
    interceptors.forEach(interceptor => interceptor.intercept(reqMiddleware, errMiddleware));
  }
}
