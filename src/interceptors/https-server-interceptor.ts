import { IInterceptor, Interceptor } from './interceptor';
import ModuleManager from '../module-manager';
import InterceptionModule from '../enums/interception-module';
import SessionManager from './../session-manager';
import { wrapListener } from '../utils/shimer';
import { Logger } from '../logger';
import Hook from 'require-in-the-middle';
import { wrap } from 'shimmer';
import ActionsList from './../actions-list';
import { clientIpFromRequest } from './../utils/utils';
import { SecureNativeOptions } from '../types/securenative-options';
import { getDeviceFp } from './../utils/utils';
import SetType from '../enums/set-type';
import { v4 } from 'uuid';

export default class HttpsServerInterceptor extends Interceptor implements IInterceptor {
  private name = 'https-server';
  
  constructor(private moduleManger: ModuleManager, private options: SecureNativeOptions) {
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
          const snuid = v4();
          SessionManager.setSession(snuid, { req, res });

          const url = req.url;
          const clientIp = clientIpFromRequest(req);
          const deviceFP = getDeviceFp(req, this.options);

          if (ActionsList.whitelist.has(SetType.IP, clientIp) || ActionsList.whitelist.has(SetType.USER, deviceFP) || ActionsList.whitelist.has(SetType.PATH, url)) {
            req.sn_whitelisted = true;
          } else if (ActionsList.blackList.has(SetType.IP, clientIp) || ActionsList.blackList.has(SetType.USER, deviceFP)) {
            req.sn_finished = true;
            super.intercept(snuid, 'blockRequest');
            return false;
          }

          return true;
        });

        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'setHeader', function (original) {
          return function () {
            if (this.sn_finished) {
              return;
            }
            return original.apply(this, arguments);
          };
        });


        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'writeHead', function (original) {
          return function () {
            if (this.sn_finished) {
              return;
            }
            return original.apply(this, arguments);
          };
        });

        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'write', (original) => {
          const intercept = super.intercept.bind(this);
          return function () {
            if (this.sn_finished) {
              return;
            }
            intercept(this.sn_uid, 'write');
            return original.apply(this, arguments);
          };
        });

        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'end', function (original) {
          return function () {
            SessionManager.cleanSession(this.req.sn_uid);
            if (this.sn_finished) {
              return;
            }
            return original.apply(this, arguments);
          }
        });

        return exports;
      });
    }
  }
}
