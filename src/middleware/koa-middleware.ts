import { Context } from 'koa';
import {} from 'koa-bodyparser';
import { Middleware, IMiddleware } from './middleware';
import { SecureNativeOptions } from '../types/securenative-options';

export default class KoaMiddleware extends Middleware implements IMiddleware {
  constructor(options: SecureNativeOptions) {
    super(options);
  }

  verifyWebhook(ctx: Context, next: Function) {
    const { request: { body } = null, req: { headers } = null } = ctx;

    if (!body || !headers) {
      return ctx.throw(400, 'Bad Request');
    }

    if (!super.verifySignature(headers, body, this.options.apiKey)) {
      return ctx.throw(401, 'Mismatched signatures');
    }

    return next();
  }
}
