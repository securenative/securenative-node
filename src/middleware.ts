import { createHmac } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { cookieIdFromRequest, clientIpFromRequest, userAgentFromRequest } from './utils';
import SecureNative from './securenative';

const HEADER_KEY = 'x-securenative';

export default class Middleware {
  constructor(private secureNative: SecureNative) { }

  verifyWebhook(req: Request, res: Response, next: NextFunction) {
    const payload = JSON.stringify(req.body);
    if (!payload) {
      return next('Request body is empty');
    }

    const hmac = createHmac('sha512', this.secureNative.apiKey);
    const digest = hmac.update(payload).digest('hex');
    const checksum = req.headers[HEADER_KEY];

    if (!checksum || !digest || checksum !== digest) {
      return next(`Request body digest (${digest}) did not match ${HEADER_KEY} (${checksum})`);
    }
    return next();
  }

  async verifyRequest(req: Request, res: Response, next: NextFunction) {
    const cookie = cookieIdFromRequest(req, {});
    if (!cookie) {
      const resp = await this.secureNative.verify({
        eventType: "sn.verify",
        ip: clientIpFromRequest(req),
        userAgent: userAgentFromRequest(req)
      }, req);

      if (resp.action === 'block') {
        res.end();
      }

      if (resp.action === 'redirect') {
        res.redirect('/error');
      }
    }

    return next();
  }
}
