import { Request, Response, NextFunction } from 'express';
import SecureNative from './../securenative';
import { Middleware, IMiddleware } from './middleware';
import ActionType from '../action-type';

export default class ExpressMiddleware extends Middleware implements IMiddleware {
  private _routes: Array<string> = [];
  constructor(private secureNative: SecureNative) {
    super();
  }

  verifyWebhook(req: Request, res: Response, next: NextFunction) {
    const { body = null, headers = null } = req;

    if (!body || !headers) {
      return res.status(400).send('Bad Request');
    }

    if (!super.verifySignature(headers, body, this.secureNative.apiKey)) {
      return res.status(401).send('Mismatched signatures');
    }

    return next();
  }

  async verifyRequest(req: Request, res: Response, next: NextFunction) {

    if (this._routes.length == 0) {
      req.app._router.stack.forEach(middleware => {
        if (middleware.route) {
          this._routes.push(middleware.route.path);
        }
      });
    }

    if (this._routes.includes(req.path)) {
      const resp = await super.executeRisk(req, this.secureNative);

      switch (resp.action) {
        case ActionType.ALLOW:
          return next()
        case ActionType.BLOCK:
          if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.status(400).json({ message: 'Request Blocked' });
          } else {
            res.status(400).sendFile(process.cwd() + '/node_modules/@securenative/sdk/dist/src/templates/block.html');
          }
          break;
        case ActionType.CHALLENGE:
          res.status(200).sendFile(process.cwd() + '/node_modules/@securenative/sdk/dist/src/templates/challenge.html');
          break;
      }
    }
  }

  async errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    next(err);
  }
}
