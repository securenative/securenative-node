import { Request, Response, NextFunction } from 'express';
import { Middleware, IMiddleware } from './middleware';
import { SecureNativeOptions } from '../types/securenative-options';

export default class ExpressMiddleware extends Middleware implements IMiddleware {
  private _routes: Array<string> = [];
  constructor(options: SecureNativeOptions) {
    super(options);
  }

  verifyWebhook(req: Request, res: Response, next: NextFunction) {
    const { body = null, headers = null } = req;

    if (!body || !headers) {
      return res.status(400).send('Bad Request');
    }

    if (!super.verifySignature(headers, body, this.options.apiKey)) {
      return res.status(401).send('Mismatched signatures');
    }

    return next();
  }
}
