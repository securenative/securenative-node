import KoaMiddleware from './koa-middleware';
import ExpressMiddleware from './express-middleware';
import IMiddleware from './middleware';
import ModuleManager from '../module-manager';
import InterceptModules from '../interceptors/intercept-modules';
import SecureNative from '../securenative';

export function createMiddleware(secureNative: SecureNative): IMiddleware {
  if (secureNative.moduleManager.Modules[InterceptModules.Express]) {
    return new ExpressMiddleware(secureNative);
  } else {
    if (secureNative.moduleManager.Modules[InterceptModules.Express]) {
      return new KoaMiddleware(secureNative);
    }
  }
} 