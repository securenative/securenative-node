import Interceptor from './interceptor';
import ExpressInterceptor from './express-interceptor';
import ModuleManager from '../module-manager';

export default class InterceptorManager {
  private static getAllInterceptors(moduleManager: ModuleManager): Array<Interceptor> {
    return [new ExpressInterceptor(moduleManager)];
  }

  static applyInterceptors(moduleManager: ModuleManager, middleware: any) {
    const interceptors = InterceptorManager.getAllInterceptors(moduleManager);
    interceptors.forEach(interceptor => interceptor.intercept(middleware));
  }
}
