import { Request, Response, NextFunction } from 'express';
import SecureNative from './../securenative';
import { Middleware, IMiddleware } from './middleware';
import ActionType from '../enums/action-type';
import { Logger } from './../logger';
import AgentManager from '../agent-manager';

export default class ExpressMiddleware extends Middleware implements IMiddleware {
  private _routes: Array<string> = [];
  constructor(agentManager: AgentManager) {
    super(agentManager);
  }

  verifyWebhook(req: Request, res: Response, next: NextFunction) {
    const { body = null, headers = null } = req;

    if (!body || !headers) {
      return res.status(400).send('Bad Request');
    }

    if (!super.verifySignature(headers, body, this.agentManager.apiKey)) {
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
      Logger.debug('Intercepting request');
    }

    return next();
  }

  async errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    // report error
    super.agentManager.apiManager.agentError(err);
    next(err);
  }
}
