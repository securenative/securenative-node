import KoaMiddleware from './koa-middleware';
import ExpressMiddleware from './express-middleware';
import { IMiddleware } from './middleware';
import InterceptionModule from '../enums/interception-module';
import ModuleManager from '../module-manager';
import { SecureNativeOptions } from '../types/securenative-options';

export function createMiddleware(moduleManager: ModuleManager, options: SecureNativeOptions): IMiddleware {
  if (moduleManager.Modules[InterceptionModule.Koa]) {
    return new KoaMiddleware(options);
  }

  //make express as default middleware
  return new ExpressMiddleware(options);
}
