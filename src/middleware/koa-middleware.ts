import { Context } from 'koa';
import { createHmac, timingSafeEqual } from 'crypto';
import SecureNative from './../securenative';
import IMiddleware from './middleware';

const SIGNATURE_KEY = 'x-securenative';

export default class KoaMiddleware implements IMiddleware {
  constructor(private secureNative: SecureNative) { }

  verifyWebhook(ctx: Context, next: Function) {
    const { body = null, req: { headers } = null } = ctx;

    if (!body || !headers) {
      return ctx.throw(400, 'Bad Request');
    }

    const signature = headers[SIGNATURE_KEY] || '';
    // calculating signature
    const hmac = createHmac('sha512', this.secureNative.apiKey);
    const comparison_signature = hmac.update(JSON.stringify(body)).digest('hex');

    // comparing signatures
    if (!timingSafeEqual(Buffer.from(signature.toString()), Buffer.from(comparison_signature))) {
      return ctx.throw(401, 'Mismatched signatures');
    }

    return next();
  }

  verifyRequest(...params: any[]) {
    throw new Error("Method not implemented.");
  }
}
