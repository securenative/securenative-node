import KoaMiddleware from './koa-middleware';
import ExpressMiddleware from './express-middleware';
import { IMiddleware } from './middleware';
import InterceptModules from '../interceptors/intercept-modules';
import SecureNative from '../securenative';

export function createMiddleware(secureNative: SecureNative): IMiddleware {
  if (secureNative.moduleManager.Modules[InterceptModules.Koa]) {
    return new KoaMiddleware(secureNative);
  }
  //make express as default middleware
  return new ExpressMiddleware(secureNative);
} 
