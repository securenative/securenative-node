import { createHmac, timingSafeEqual } from 'crypto';
import { cookieIdFromRequest, clientIpFromRequest, userAgentFromRequest } from '../utils/utils';
import { decrypt } from '../utils/utils';
import EventTypes from './../event-types';
import ActionType from "./../action-type";
import RiskResult from './../risk-result';
import { Logger } from './../logger';

const SIGNATURE_KEY = 'x-securenative';

export interface IMiddleware {
  verifyWebhook(...params: any[]);
  verifyRequest(...params: any[]);
  errorHandler(...params: any[]);
}

export abstract class Middleware {
  verifySignature(headers, body, apiKey): Boolean {
    const signature = headers[SIGNATURE_KEY] || '';
    // calculating signature
    const hmac = createHmac('sha512', apiKey);
    const comparison_signature = hmac.update(JSON.stringify(body)).digest('hex');

    // comparing signatures
    if (!timingSafeEqual(Buffer.from(signature.toString()), Buffer.from(comparison_signature))) {
      return false;
    }

    return true;
  }

  async executeRisk(req, secureNative): Promise<RiskResult> {
    const cookie = cookieIdFromRequest(req, {});
    let resp: RiskResult = null;

    if (!cookie) {
      Logger.debug("Cookie not found");
      resp = await secureNative.risk({
        eventType: EventTypes.RISK,
        ip: clientIpFromRequest(req),
        userAgent: userAgentFromRequest(req)
      }, req);
    } else {
      const cookieDecoded = decrypt(cookie, secureNative.apiKey);
      resp = JSON.parse(cookieDecoded) || {};
      Logger.debug("Cookie found", resp);
    }

    return resp;
  }
}
