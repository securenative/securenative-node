import { createHmac, timingSafeEqual } from 'crypto';
import {
  cookieIdFromRequest, clientIpFromRequest, remoteIpFromRequest,
  userAgentFromRequest, headersFromRequest
} from '../utils/utils';
import { decrypt } from '../utils/utils';
import EventType from '../enums/event-type';
import ActionType from "../enums/action-type";
import RiskResult from '../types/risk-result';
import { Logger } from './../logger';
import SecureNative from './../securenative';
import { KeyValuePair } from '../types/key-value-pair';
import { RequestOptions } from '../types/request-options';
import { v4 } from 'uuid';

const SIGNATURE_KEY = 'x-securenative';

export interface IMiddleware {
  verifyWebhook(...params: any[]);
  verifyRequest(...params: any[]);
  errorHandler(...params: any[]);
}

export abstract class Middleware {
  constructor(protected secureNative: SecureNative) { }

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

  async executeRisk(req): Promise<RiskResult> {
    const { url, method, body } = req;
    const cookie = cookieIdFromRequest(req, {});
    const cookieDecoded = decrypt(cookie, this.secureNative.apiKey);
    const clientFP = JSON.parse(cookieDecoded) || {};

    const resp = await this.secureNative.risk({
      url,
      method,
      userAgent: userAgentFromRequest(req),
      headers: headersFromRequest(req),
      body,
      ip: clientIpFromRequest(req),
      remoteIp: remoteIpFromRequest(req),
      fp: clientFP.fp || '',
      cid: clientFP.cid || '',
      vid: v4()
    });

    Logger.debug("Risk", resp);
    return resp;
  }
}
