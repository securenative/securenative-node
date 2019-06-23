import { createHmac, timingSafeEqual } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { cookieIdFromRequest, clientIpFromRequest, userAgentFromRequest } from './utils';
import SecureNative from './securenative';

const SIGNATURE_KEY = 'x-securenative';

export default class Middleware {
  constructor(private secureNative: SecureNative) { }

  verifyWebhook(req: Request, res: Response, next: NextFunction) {
    const { body = null, headers = null } = req;

    if (!body || !headers) {
      return res.status(400).send('Bad Request');
    }

    const signature = headers[SIGNATURE_KEY] || '';
    // calculating signature
    const hmac = createHmac('sha512', this.secureNative.apiKey);
    const comparison_signature = hmac.update(JSON.stringify(body)).digest('hex');

    // comparing signatures
    if (!timingSafeEqual(Buffer.from(signature.toString()), Buffer.from(comparison_signature))) {
      return res.status(401).send('Mismatched signatures');
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

      if (resp.riskLevel === 'low') {
        res.end();
      }
    }

    return next();
  }
}
