import { v4 } from 'uuid';
import fetch from 'node-fetch';
import { EventOptions } from './event-options';
import EventTypes from './event-types';
import { Request } from 'express';
import { Event } from './event';
import { cookieIdFromRequest, clientIpFromRequest, remoteIpFromRequest, userAgentFromRequest } from './utils';
import { SecureNativeOptions } from './securenative-options';
import { ActionResult } from './action-result';
import { FetchOptions } from './fetch-options';
import { promiseTimeout } from './utils';
import { version } from './../package.json';

export default class EventManager {
  private defaultFetchOptions: FetchOptions;
  private events: Array<FetchOptions> = [];
  private sendEnabled: Boolean = true;

  constructor(private options: SecureNativeOptions) {
    this.defaultFetchOptions = {
      url: options.apiUrl || 'https://api.securenative.com/v1/collector',
      options: {
        method: 'post',
        headers: {
          'User-Agent': 'SecureNative-node',
          'SN-Version': version,
          'Authorization': options.apiKey
        }
      }
    };

    this.startEventsPersist();
  }

  public buildEvent(req: Request, opts: EventOptions): Event {
    const cookie = cookieIdFromRequest(req, this.options) || '{}';
    const cookieDecoded = Buffer.from(cookie, 'base64').toString('utf8') || '{}';
    const clientFP = JSON.parse(cookieDecoded) || {};
    const eventType = opts.eventType || EventTypes.LOG_IN;

    return {
      eventType,
      cid: clientFP.cid || '',
      vid: v4(),
      fp: clientFP.fp || '',
      ip: opts.ip || clientIpFromRequest(req),
      remoteIP: opts.remoteIp || remoteIpFromRequest(req),
      userAgent: opts.userAgent || userAgentFromRequest(req),
      user: opts.user || {
        id: 'anonymous'
      },
      ts: Date.now(),
      device: opts.device || {}
    }
  }

  public async sendSync(event: Event, requestUrl: string): Promise<ActionResult> {
    const eventOptions = Object.assign({}, this.defaultFetchOptions.options, {
      body: JSON.stringify(event)
    });

    try {
      const resp = await promiseTimeout(fetch(requestUrl, eventOptions), this.options.timeout);
      const body = await resp.json();
      return body;
    } catch (ex) {
      return {
        action: "allow",
        riskScore: 0,
        triggers: []
      }
    }
  }

  public sendAsync(event: Event, requestUrl: string) {
    if (this.events.length >= this.options.maxEvents) {
      this.events.unshift();
    }

    const eventOptions = Object.assign({}, this.defaultFetchOptions.options, {
      body: JSON.stringify(event)
    });

    this.events.push({
      url: requestUrl,
      options: eventOptions
    });
  }

  private async sendEvents() {
    if (this.events.length > 0 && this.sendEnabled) {
      const fetchEvent = this.events.shift();

      await fetch(fetchEvent.url, fetchEvent.options).catch((err) => {
        this.events.unshift(fetchEvent);
        const backOff = Math.ceil(Math.random() * 10) * 1000;
        this.sendEnabled = false;
        setTimeout(() => this.sendEnabled = true, backOff);
      });
    }
  }

  private startEventsPersist() {
    if (this.options.autoSend) {
      setInterval(async () => { await this.sendEvents() }, this.options.interval);
    }
  }
}
