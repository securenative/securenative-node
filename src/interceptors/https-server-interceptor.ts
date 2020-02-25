import { IInterceptor, Interceptor } from './interceptor';
import ModuleManager from '../module-manager';
import InterceptionModule from '../enums/interception-module';
import SessionManager from './../session-manager';
import { wrapListener } from '../utils/shimer';
import { Logger } from '../logger';

export default class HttpsServerInterceptor extends Interceptor implements IInterceptor {
  private name = 'https-server';
  private method = 'emit';
  private listner = 'request';

  constructor(private moduleManger: ModuleManager) {
    super();
  }

  getModule() {
    return require(InterceptionModule.Https);
  }

  canExecute(): boolean {
    Logger.debug(`Checking ${InterceptionModule.Https} module , found: ${true}`);
    return true;
  }

  intercept(reqMiddleware, errMiddleware) {
    if (this.canExecute()) {
      Logger.debug(`Creating ${this.name} interceptor`);
      const module = this.getModule();

      wrapListener(module.Server.prototype, this.method, this.listner, (event, req, res) => {
        SessionManager.setSession({ req, res });
        super.intercept(this.method, this.listner);
      });
    }
  }
}
