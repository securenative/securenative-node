import { v4 } from 'uuid';
import fetch from 'node-fetch';
import { EventOptions } from './event-options';
import EventTypes from './event-types';
import { Event } from './event';
import { cookieIdFromRequest, secureheaderFromRequest, clientIpFromRequest, remoteIpFromRequest, userAgentFromRequest } from './utils';
import { SecureNativeOptions } from './securenative-options';
import { FetchOptions } from './fetch-options';
import { promiseTimeout, decrypt } from './utils';
import { version } from './../package.json';
import { ILogger } from './logger';

export default class EventManager {
  private defaultFetchOptions: FetchOptions;
  private events: Array<FetchOptions> = [];
  private sendEnabled: Boolean = true;

  constructor(private apiKey: string, private options: SecureNativeOptions, private logger: ILogger) {
    this.defaultFetchOptions = {
      url: options.apiUrl || 'https://api.securenative.com/v1/collector',
      options: {
        method: 'post',
        headers: {
          'User-Agent': 'SecureNative-node',
          'SN-Version': version,
          'Authorization': apiKey
        }
      }
    };

    this.startEventsPersist();
  }

  public buildEvent(req: any, opts: EventOptions): Event {
    const cookie = cookieIdFromRequest(req, this.options) || secureheaderFromRequest(req) || '{}';
    this.logger.debug("Cookie from request", cookie);
    const cookieDecoded = decrypt(cookie, this.apiKey);
    this.logger.debug("Cookie decoded", cookieDecoded);
    const clientFP = JSON.parse(cookieDecoded) || {};
    this.logger.debug("Extracted user FP:", clientFP);
    const eventType = opts.eventType || EventTypes.LOG_IN;

    const event = {
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
      device: opts.device || {},
      params: opts.params
    }
    this.logger.debug("Built new event", event);
    return event;
  }

  public async sendSync(event: Event, requestUrl: string): Promise<any> {
    const eventOptions = Object.assign({}, this.defaultFetchOptions.options, {
      body: JSON.stringify(event)
    });

    try {
      const resp = await promiseTimeout(fetch(requestUrl, eventOptions), this.options.timeout);
      this.logger.debug("Successfuly sent event ", eventOptions);
      const body = await resp.json();
      return body;
    } catch (ex) {
      this.logger.debug("Failed to sent event ", eventOptions);
      return Promise.reject();
    }
  }

  public sendAsync(event: Event, requestUrl: string) {
    if (this.events.length >= this.options.maxEvents) {
      this.events.shift();
    }

    const eventOptions = Object.assign({}, this.defaultFetchOptions.options, {
      body: JSON.stringify(event)
    });

    this.events.push({
      url: requestUrl,
      options: eventOptions
    });
    this.logger.debug("Added event to persist queue", eventOptions.body);
  }

  private async sendEvents() {
    if (this.events.length > 0 && this.sendEnabled) {
      const fetchEvent = this.events.shift();
      await promiseTimeout(fetch(fetchEvent.url, fetchEvent.options), this.options.timeout).then(() => {
        this.logger.debug("Event successfully sent", fetchEvent);
      }).catch((err) => {
        this.logger.debug("Failed to send event", err);
        this.events.unshift(fetchEvent);
        const backOff = Math.ceil(Math.random() * 10) * 1000;
        this.logger.debug("BackOff automatic sending by", backOff);
        this.sendEnabled = false;
        setTimeout(() => this.sendEnabled = true, backOff);
      });
    }
  }

  private startEventsPersist() {
    if (this.options.autoSend) {
      this.logger.debug("Starting automatic event persistence");
      setInterval(async () => { await this.sendEvents() }, this.options.interval);
    } else {
      this.logger.debug("Automatic event persistence diabled, you should manualy persist events");
    }
  }
}
