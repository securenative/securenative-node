
import { Request } from 'express';
import { SecureNativeOptions } from './securenative-options';
import { Event } from './event';
import { EventOptions } from './event-options';
import EventManager from './event-manager';
import { RiskResult } from './risk-result';
import Middleware from './middleware';

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
  public middleware: Middleware;

  constructor(public apiKey: string, options: SecureNativeOptions = defaultOptions) {
    if (!apiKey) {
      throw new Error('You must pass your SecureNative api key');
    }
    this.options = Object.assign({}, defaultOptions, options);
    this.eventManager = new EventManager(apiKey, this.options);
    this.middleware = new Middleware(this);
    this.middleware.verifyWebhook = this.middleware.verifyWebhook.bind(this.middleware); 
    this.middleware.verifyRequest = this.middleware.verifyRequest.bind(this.middleware); 
  }

  public track(opts: EventOptions, req?: Request) {
    if (opts && opts.params && opts.params.length > MAX_CUSTOM_PARAMS) {
      throw new Error(`You can only specify maximum of ${MAX_CUSTOM_PARAMS} params`);
    }

    const requestUrl = `${this.options.apiUrl}/track`;
    const event: Event = this.eventManager.buildEvent(req, opts);
    this.eventManager.sendAsync(event, requestUrl);
  }

  public verify(opts: EventOptions, req?: Request): Promise<RiskResult> {
    const requestUrl = `${this.options.apiUrl}/verify`;
    const event: Event = this.eventManager.buildEvent(req, opts);
    return this.eventManager.sendSync(event, requestUrl);
  }

  public flow(flowId: number, opts: EventOptions, req?: Request): Promise<RiskResult> {
    const requestUrl = `${this.options.apiUrl}/flow/${flowId}`;
    const event: Event = this.eventManager.buildEvent(req, opts);
    return this.eventManager.sendSync(event, requestUrl);
  }
}
