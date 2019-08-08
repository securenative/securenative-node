import { Context } from 'koa';
import SecureNative from './../securenative';
import { Middleware, IMiddleware } from './middleware';

export default class KoaMiddleware extends Middleware implements IMiddleware {
  constructor(private secureNative: SecureNative) {
    super();
  }

  verifyWebhook(ctx: Context, next: Function) {
    const { body = null, req: { headers } = null } = ctx;

    if (!body || !headers) {
      return ctx.throw(400, 'Bad Request');
    }

    if (!super.verifySignature(headers, body, this.secureNative.apiKey)) {
      return ctx.throw(401, 'Mismatched signatures');
    }

    return next();
  }

  verifyRequest(...params: any[]) {
    throw new Error("Method not implemented.");
  }
}
