import KoaMiddleware from './koa-middleware';
import ExpressMiddleware from './express-middleware';
import { IMiddleware } from './middleware';
import InterceptionModule from '../enums/interception-module';
import SecureNative from '../securenative';
import AgentManager from '../agent-manager';

export function createMiddleware(agentManager: AgentManager): IMiddleware {
  if (agentManager.moduleManager.Modules[InterceptionModule.Koa]) {
    return new KoaMiddleware(agentManager);
  }
  //make express as default middleware
  return new ExpressMiddleware(agentManager);
} 
