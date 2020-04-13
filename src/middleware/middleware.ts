import { createHmac, timingSafeEqual } from 'crypto';
import EventType from '../enums/event-type';
import RiskResult from '../types/risk-result';
import { Logger } from './../logger';
import SecureNative from './../securenative';
import { contextFromRequest } from '../utils/utils';
import AgentManager from '../agent-manager';

const SIGNATURE_KEY = 'x-securenative';

export interface IMiddleware {
  verifyWebhook(...params: any[]);
  verifyRequest(...params: any[]);
  errorHandler(...params: any[]);
}

export abstract class Middleware {
  constructor(protected agentManager: AgentManager) {}

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
}
