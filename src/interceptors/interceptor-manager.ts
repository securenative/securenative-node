import { IInterceptor } from './interceptor';
import ModuleManager from '../module-manager';
import ExpressInterceptor from './express-interceptor';
import KoaInterceptor from './koa-interceptor';
import HapiInterceptor from './hapi-interceptor';
import HttpServerInterceptor from './http-server-interceptor';
import HttpsServerInterceptor from './https-server-interceptor';

export default class InterceptorManager {
  private static getAllInterceptors(moduleManager: ModuleManager): Array<IInterceptor> {
    return [
      new ExpressInterceptor(moduleManager),
      new KoaInterceptor(moduleManager),
      new HapiInterceptor(moduleManager),
      new HttpServerInterceptor(moduleManager),
      new HttpsServerInterceptor(moduleManager)
    ];
  }

  static applyInterceptors(moduleManager: ModuleManager, reqMiddleware: any, errMiddleware: any) {
    const interceptors = InterceptorManager.getAllInterceptors(moduleManager);
    interceptors.forEach(interceptor => interceptor.intercept(reqMiddleware, errMiddleware));
  }
}
