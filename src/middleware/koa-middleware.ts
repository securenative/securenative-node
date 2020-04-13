import { Context } from 'koa';
import {} from 'koa-bodyparser';
import SecureNative from './../securenative';
import { Middleware, IMiddleware } from './middleware';
import ActionType from '../enums/action-type';
import { readFile } from 'fs';
import AgentManager from '../agent-manager';

export default class KoaMiddleware extends Middleware implements IMiddleware {
  constructor(agentManager: AgentManager) {
    super(agentManager);
  }

  verifyWebhook(ctx: Context, next: Function) {
    const { request: { body } = null, req: { headers } = null } = ctx;

    if (!body || !headers) {
      return ctx.throw(400, 'Bad Request');
    }

    if (!super.verifySignature(headers, body, this.agentManager.apiKey)) {
      return ctx.throw(401, 'Mismatched signatures');
    }

    return next();
  }

  async verifyRequest(ctx: Context, next: Function) {}

  async errorHandler(...params: any[]) {
    throw new Error('Method not implemented.');
  }
}
