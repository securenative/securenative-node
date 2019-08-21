
import { SecureNativeOptions } from './securenative-options';
import { Event } from './event';
import { EventOptions } from './event-options';
import EventManager from './event-manager';
import RiskResult from './risk-result';
import VerifyResult from './verify-result';
import { IMiddleware } from './middleware/middleware';
import { createMiddleware } from './middleware/midlleware-factory';
import ModuleManager from './module-manager';
import InterceptorManager from './interceptors/interceptor-manager';
import { decrypt } from './utils';
import ActionType from './action-type';
import { Logger } from './logger';

const MAX_CUSTOM_PARAMS = 6;
const defaultOptions: SecureNativeOptions = {
  apiUrl: 'https://api.securenative.com/collector/api/v1',
  interval: 1000,
  maxEvents: 1000,
  timeout: 1500,
  autoSend: true
};

export default class SecureNative {
  private eventManager: EventManager;
  private options: SecureNativeOptions;
  public middleware: IMiddleware;
  public moduleManager: ModuleManager;

  constructor(public apiKey: string, options: SecureNativeOptions = defaultOptions) {
    if (!apiKey) {
      throw new Error('You must pass your SecureNative api key');
    }
    Logger.initLogger(options);
    this.options = Object.assign({}, defaultOptions, options);
    this.eventManager = new EventManager(apiKey, this.options);
    this.moduleManager = new ModuleManager();

    this.middleware = createMiddleware(this);
    this.middleware.verifyWebhook = this.middleware.verifyWebhook.bind(this.middleware);
    this.middleware.verifyRequest = this.middleware.verifyRequest.bind(this.middleware);

    if (options.enableInterception) {
      InterceptorManager.applyInterceptors(this.moduleManager, this.middleware.verifyRequest);
    }
  }

  public track(opts: EventOptions, req?: any) {
    Logger.debug("Track event call", opts);
    if (opts && opts.params && opts.params.length > MAX_CUSTOM_PARAMS) {
      throw new Error(`You can only specify maximum of ${MAX_CUSTOM_PARAMS} params`);
    }

    const requestUrl = `${this.options.apiUrl}/track`;
    const event: Event = this.eventManager.buildEvent(req, opts);
    this.eventManager.sendAsync(event, requestUrl);
  }

  public async verify(opts: EventOptions, req?: any): Promise<VerifyResult> {
    Logger.debug("Verify risk call", opts);
    const requestUrl = `${this.options.apiUrl}/verify`;
    const event: Event = this.eventManager.buildEvent(req, opts);

    try {
      const result = await this.eventManager.sendSync(event, requestUrl);
      Logger.debug("Successfuly called virify", result);
      return result;
    } catch (ex) {
      Logger.debug("Failed to call virify", ex);
      return {
        riskLevel: "low",
        score: 0,
        triggers: []
      }
    }
  }

  public async risk(opts: EventOptions, req?: any): Promise<RiskResult> {
    Logger.debug("Risk call", opts);
    const requestUrl = `${this.options.apiUrl}/risk`;
    const event: Event = this.eventManager.buildEvent(req, opts);
    try {
      const result = await this.eventManager.sendSync(event, requestUrl);
      const data = decrypt(result.data, this.apiKey);
      Logger.debug("Successfuly performed risk", data);
      return JSON.parse(data);
    } catch (ex) {
      Logger.debug("Failed to perform risk call", ex);
      return {
        action: ActionType.ALLOW,
        riskLevel: "low",
        score: 0
      }
    }
  }

  public flow(flowId: number, opts: EventOptions, req?: any): Promise<RiskResult> {
    Logger.debug("Flow call:", flowId);
    const requestUrl = `${this.options.apiUrl}/flow/${flowId}`;
    const event: Event = this.eventManager.buildEvent(req, opts);
    return this.eventManager.sendSync(event, requestUrl);
  }
}
