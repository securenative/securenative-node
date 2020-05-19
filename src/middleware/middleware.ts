import { createHmac, timingSafeEqual } from 'crypto';
import { SecureNativeOptions } from '../types/securenative-options';
 
const SIGNATURE_KEY = 'x-securenative';

export interface IMiddleware {
  verifyWebhook(...params: any[]);
}

export abstract class Middleware {
  constructor(protected options: SecureNativeOptions) {}

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
