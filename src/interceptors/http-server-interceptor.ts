import { IInterceptor, Interceptor } from './interceptor';
import ModuleManager from '../module-manager';
import InterceptModules from './intercept-modules';
import SessionManager from './../session-manager';
import { wrapListener } from '../utils/shimer';
import { Logger } from '../logger';
import Hook from 'require-in-the-middle';
import { wrap } from 'shimmer';

export default class HttpServerInterceptor extends Interceptor implements IInterceptor {
  private name = 'http-server';

  constructor(private moduleManger: ModuleManager) {
    super();
  }

  getModule() {
    return InterceptModules.Http;
  }

  canExecute(): boolean {
    Logger.debug(`Checking ${InterceptModules.Http} module , found: ${true}`);
    return true;
  }

  intercept(reqMiddleware, errMiddleware) {
    if (this.canExecute()) {
      Logger.debug(`Creating ${this.name} interceptor`);
      const module = this.getModule();

      console.log('BEFORE HOOKING');

      Hook([module], (exports, name, basedir) => {


        wrapListener(exports.Server.prototype, 'emit', 'request', (event, req, res) => {
          SessionManager.setSession({ req, res });
          //super.intercept('emit', 'request');
        });

        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'setHeader', function (original) {
          return function () {
            return original.apply(this, arguments);
          };
        });


        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'writeHead', function (original) {
          return function () {
            return original.apply(this, arguments);
          };
        });

        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'write', (original) => {
          const intercept = super.intercept.bind(this, 'write', '');
          return function () {
            intercept();
            return original.apply(this, arguments);
          };
        });

        wrap(exports && exports.ServerResponse && exports.ServerResponse.prototype, 'end', function (original) {
          return function () {
            return original.apply(this, arguments);
          }
        });

        return exports;
      });
    }
  }
}
