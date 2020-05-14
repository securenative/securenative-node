import { IInterceptor, Interceptor } from './interceptor';
import ModuleManager from '../module-manager';
import InterceptionModule from '../enums/interception-module';
import SessionManager from './../session-manager';
import { wrapListener } from '../utils/shimer';
import { Logger } from '../logger';
import Hook from 'require-in-the-middle';
import { wrap } from 'shimmer';
import ActionsList from './../actions-list';
import { clientIpFromRequest, contextFromRequest, contextFromResponse } from './../utils/utils';
import { SecureNativeOptions } from '../types/securenative-options';
import { getDeviceFp } from './../utils/utils';
import SetType from '../enums/set-type';
import { v4 } from 'uuid';
import EventType from '../enums/event-type';
import ApiManager from '../api-manager';

export default class HttpServerInterceptor extends Interceptor implements IInterceptor {
  private name = 'http-server';

  constructor(private moduleManger: ModuleManager, private apiManager: ApiManager, private options: SecureNativeOptions) {
    super();
  }

  getModule() {
    return InterceptionModule.Http;
  }

  canExecute(): boolean {
    Logger.debug(`Checking ${InterceptionModule.Http} module , found: ${true}`);
    return true;
  }

  intercept(reqMiddleware, errMiddleware) {
    if (this.canExecute()) {
      Logger.debug(`Creating ${this.name} interceptor`);
      const module = this.getModule();

      Hook([module], (exports, name, basedir) => {
        wrapListener(exports.Server.prototype, 'emit', 'request', (event, req, res) => {
          if (req.method === 'OPTIONS') {
            return true;
          }
          const snuid = v4();
          Logger.debug(`Intercept request: ${req.url}, method: ${req.method}`);
          SessionManager.setSession(snuid, { req, res });
          const url = req.url;
          const clientIp = clientIpFromRequest(req);
          const deviceFP = getDeviceFp(req, this.options);

          if (
            ActionsList.whitelist.has(SetType.IP, clientIp) ||
            ActionsList.whitelist.has(SetType.USER, deviceFP) ||
            ActionsList.whitelist.has(SetType.PATH, url)
          ) {
            req.sn_whitelisted = true;
          } else if (ActionsList.blackList.has(SetType.IP, clientIp) || ActionsList.blackList.has(SetType.USER, deviceFP)) {
            super.intercept(snuid, 'block');
          }
          return true;
        });

        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'setHeader', (original) => {
          return function () {
            if (this && this.sn_finished) {
              return true;
            }
            return original.apply(this, arguments);
          };
        });

        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'writeHead', (original) => {
          const intercept = super.intercept.bind(this);
          return function () {
            if (this && this.sn_finished) {
              return;
            }
            if (arguments && arguments.length > 0 && arguments[0] !== undefined) {
              intercept(this.req && this.req.sn_uid, 'write');
            }
            return original.apply(this, arguments);
          };
        });

        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'write', (original) => {
          const intercept = super.intercept.bind(this);
          return function () {
            if (this && this.sn_finished) {
              return;
            }
            intercept(this.req && this.req.sn_uid, 'write');
            return original.apply(this, arguments);
          };
        });

        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'end', (original) => {
          const intercept = super.intercept.bind(this);
          const risk = this.apiManager.risk.bind(this.apiManager);
          return function () {
            if (this && this.sn_finished) {
              SessionManager.cleanSession(this.req && this.req.sn_uid);
              return;
            }

            if (this.req && this.req.method !== 'OPTIONS') {
              intercept(this.req.sn_uid, 'end');
              const { req, res } = SessionManager.getSession(this.req?.sn_uid);
              if (req && res) {
                risk({ event: EventType.RISK, context: { req: contextFromRequest(req), res: contextFromResponse(res) } });
              }
              SessionManager.cleanSession(this.req.sn_uid);
            }
            return original.apply(this, arguments);
          };
        });

        return exports;
      });
    }
  }
}
