import { IInterceptor, Interceptor } from './interceptor';
import ModuleManager from '../module-manager';
import InterceptionModule from '../enums/interception-module';
import SessionManager from './../session-manager';
import { wrapListener } from '../utils/shimer';
import { Logger } from '../logger';
import Hook from 'require-in-the-middle';
import ActionsList from './../actions-list';
import { clientIpFromRequest } from './../utils/utils';
import { SecureNativeOptions } from '../types/securenative-options';
import { getDeviceFp } from './../utils/utils';
import SetType from '../enums/set-type';
import { v4 } from 'uuid';
import ApiManager from '../api-manager';

export default class HttpServerInterceptor extends Interceptor implements IInterceptor {
  private name = 'https-server';

  constructor(private moduleManger: ModuleManager, private apiManager: ApiManager, private options: SecureNativeOptions) {
    super();
  }

  getModule() {
    return InterceptionModule.Https;
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

        return exports;
      });
    }
  }
}
