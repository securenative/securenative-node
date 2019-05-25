import { createHmac } from 'crypto';
import { Request, Response, NextFunction } from 'express';

const HEADER_KEY = 'X-SECURENATIVE';

export default class Middleware{
  constructor(private secret: string) {}

  verifySecureNativeWebhook(req: Request, res: Response, next: NextFunction){
    const payload = JSON.stringify(req.body);
    if (!payload) {
      return next('Request body is empty');
    }
  
    const hmac = createHmac('sha1', this.secret);
    const digest = 'sha1=' + hmac.update(payload).digest('hex');
    const checksum = req.headers[HEADER_KEY];
  
    if (!checksum || !digest || checksum !== digest) {
      return next(`Request body digest (${digest}) did not match ${HEADER_KEY} (${checksum})`);
    }
    return next();
  }
}
