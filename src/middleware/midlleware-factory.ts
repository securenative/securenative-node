import KoaMiddleware from './koa-middleware';
import ExpressMiddleware from './express-middleware';
import { IMiddleware } from './middleware';
import InterceptionModule from '../enums/interception-module';
import SecureNative from '../securenative';

export function createMiddleware(secureNative: SecureNative): IMiddleware {
  if (secureNative.moduleManager.Modules[InterceptionModule.Koa]) {
    return new KoaMiddleware(secureNative);
  }
  //make express as default middleware
  return new ExpressMiddleware(secureNative);
} 
