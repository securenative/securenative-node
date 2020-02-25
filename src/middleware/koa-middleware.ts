import { Context } from 'koa';
import { } from 'koa-bodyparser';
import SecureNative from './../securenative';
import { Middleware, IMiddleware } from './middleware';
import ActionType from '../enums/action-type';
import { readFile } from 'fs';

export default class KoaMiddleware extends Middleware implements IMiddleware {
  constructor(secureNative: SecureNative) {
    super(secureNative);
  }

  verifyWebhook(ctx: Context, next: Function) {
    const { "request": { body } = null, req: { headers } = null } = ctx;

    if (!body || !headers) {
      return ctx.throw(400, 'Bad Request');
    }

    if (!super.verifySignature(headers, body, this.secureNative.apiKey)) {
      return ctx.throw(401, 'Mismatched signatures');
    }

    return next();
  }

  async verifyRequest(ctx: Context, next: Function) {
    const resp = await super.executeRisk(ctx.req);

    switch (resp.action) {
      case ActionType.ALLOW:
        return next();
      case ActionType.BLOCK:
        if (ctx.get('X-Requested-With') === 'XMLHttpRequest' || ctx.accepts('json')) {
          ctx.status = 400;
          ctx.body = {
            json: { message: 'Request Blocked' }
          };
        } else {
          readFile(process.cwd() + '/node_modules/@securenative/sdk/dist/src/templates/block.html', 'utf-8', (err, content) => {
            if (err) {
              return;
            }
            ctx.status = 200;
            ctx.body = content;
          });
        }
        break;
      case ActionType.CHALLENGE:
        readFile(process.cwd() + '/node_modules/@securenative/sdk/dist/src/templates/challenge.html', 'utf-8', (err, content) => {
          if (err) {
            return;
          }
          ctx.status = 200;
          ctx.body = content;
        });
        break;
    }
  }

  async errorHandler(...params: any[]) {
    throw new Error("Method not implemented.");
  }
}
