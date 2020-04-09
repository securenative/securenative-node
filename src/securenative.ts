import { SecureNativeOptions } from './types/securenative-options';
import { createEvent } from './events/event-factory';
import { EventOptions } from './types/event-options';
import EventManager from './event-manager';
import RiskResult from './types/risk-result';
import { IMiddleware } from './middleware/middleware';
import { createMiddleware } from './middleware/midlleware-factory';
import ModuleManager from './module-manager';
import InterceptorManager from './interceptors/interceptor-manager';
import { decrypt } from './utils/utils';
import ActionType from './enums/action-type';
import { Logger } from './logger';
import ApiRoute from './enums/api-route';
import AgentManager from './agent-manager';
import SDKEvent from './events/sdk-event';
import ErrorEvent from './events/error-event';
import ApiManager from './api-manager';

export default class SecureNative {
  private agentManager: AgentManager;
  public apiManager: ApiManager;
  public middleware: IMiddleware;

  constructor(public moduleManager: ModuleManager, eventManager: EventManager, private options: SecureNativeOptions) {
    if (!moduleManager || !eventManager || !options) {
      throw new Error('Unable to create SecureNative instance, invalid config provided');
    }

    this.apiManager = new ApiManager(eventManager, options);
    this.agentManager = new AgentManager(moduleManager, this.apiManager, eventManager, options);

    if (!options.disable) {
      // create middleware
      this.middleware = createMiddleware(this);
      this.middleware.verifyWebhook = this.middleware.verifyWebhook.bind(this.middleware);
      this.middleware.verifyRequest = this.middleware.verifyRequest.bind(this.middleware);

      // apply interceptors
      InterceptorManager.applyInterceptors(moduleManager, this.options, this.middleware.verifyRequest, this.middleware.errorHandler);
    }
  }

  public get apiKey(): string {
    return this.options.apiKey;
  }

  public get agent(): AgentManager {
    return this.agentManager;
  }

  public get SDK() {
    return {
      track: this.apiManager.track,
      verify: this.apiManager.verify,
    };
  }
}
