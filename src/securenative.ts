
import { Request } from 'express';
import { SecureNativeOptions } from './securenative-options';
import { Event } from './event';
import { EventOptions } from './event-options';
import EventManager from './event-manager';
import { ActionResult } from './action-result';

export default class SecureNative {
  private eventManager: EventManager

  constructor(private options: SecureNativeOptions = {
    apiKey: "",
    apiUrl: 'https://api.securenative.com/v1/collector',
    interval: 1000,
    maxEvents: 1000,
    timeout: 1500,
    autoSend: true
  }) {
    if (!options.apiKey) {
      throw new Error('You must pass your SecureNative api key');
    }
    this.eventManager = new EventManager(options);
  }

  public track(opts: EventOptions, req?: Request) {
    const requestUrl = `${this.options.apiUrl}/v1/track`;
    const event: Event = this.eventManager.buildEvent(req, opts);
    this.eventManager.sendAsync(event, requestUrl);
  }

  public verify(opts: EventOptions, req?: Request): Promise<ActionResult> {
    const requestUrl = `${this.options.apiUrl}/v1/verify`;
    const event: Event = this.eventManager.buildEvent(req, opts);
    return this.eventManager.sendSync(event, requestUrl);
  }

  public flow(flowId: number, opts: EventOptions, req?: Request): Promise<ActionResult> {
    const requestUrl = `${this.options.apiUrl}/v1/flow/${flowId}`;
    const event: Event = this.eventManager.buildEvent(req, opts);
    return this.eventManager.sendSync(event, requestUrl);
  }
}
