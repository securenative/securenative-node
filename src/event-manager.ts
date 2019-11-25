import { v4 } from 'uuid';
import fetch from 'node-fetch';
import { EventOptions } from './event-options';
import EventTypes from './event-types';
import IEvent from './events/event';
import { cookieIdFromRequest, secureheaderFromRequest, clientIpFromRequest, remoteIpFromRequest, userAgentFromRequest } from './utils';
import { SecureNativeOptions } from './securenative-options';
import { FetchOptions } from './fetch-options';
import { promiseTimeout, decrypt } from './utils';
import { Logger } from './logger';

export default class EventManager {
  private defaultFetchOptions: FetchOptions;
  private events: Array<FetchOptions> = [];
  private sendEnabled: Boolean = false;
  private timeoutId = null;

  constructor(private options: SecureNativeOptions) {
    this.defaultFetchOptions = {
      url: options.apiUrl,
      options: {
        method: 'post',
        timeout: this.options.timeout,
        headers: {
          'Authorization': this.options.apiKey
        }
      }
    };
  }

  public setSessionId(sessionId: string) {
    this.defaultFetchOptions.options.headers['SN-Agent-Session'] = sessionId;
  }

  public async sendSync(event: IEvent, requestUrl: string): Promise<any> {
    const eventOptions = Object.assign({}, this.defaultFetchOptions.options, {
      body: JSON.stringify(event)
    });

    try {
      const resp = await fetch(requestUrl, eventOptions);
      Logger.debug("Successfuly sent event", eventOptions);
      const body = await resp.json();
      return body;
    } catch (ex) {
      Logger.debug("Failed to sent event", eventOptions);
      return Promise.reject();
    }
  }

  public sendAsync(event: IEvent, requestUrl: string) {
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
    Logger.debug("Added event to persist queue", eventOptions.body);
  }

  private async sendEvents() {
    if (this.events.length > 0 && this.sendEnabled) {
      const fetchEvent = this.events.shift();
      await promiseTimeout(fetch(fetchEvent.url, fetchEvent.options), this.options.timeout).then(() => {
        Logger.debug("Event successfully sent", fetchEvent);
      }).catch((err) => {
        Logger.debug("Failed to send event", err);
        this.events.unshift(fetchEvent);
        const backOff = Math.ceil(Math.random() * 10) * 1000;
        Logger.debug("BackOff automatic sending by", backOff);
        this.sendEnabled = false;
        setTimeout(() => this.sendEnabled = true, backOff);
      });
    }
  }

  public startEventsPersist() {
    if (this.options.autoSend && !this.timeoutId) {
      Logger.debug("Starting automatic event persistence");
      this.sendEnabled = true;
      this.timeoutId = setInterval(async () => { await this.sendEvents() }, this.options.interval);
    } else {
      Logger.debug("Automatic event persistence disabled, you should manualy persist events");
    }
  }

  public async stopEventsPersist() {
    if (this.timeoutId) {
      Logger.debug("Stopping automatic event persistence");
      clearInterval(this.timeoutId);
      // drain event queue
      await this.sendEvents();
      this.sendEnabled = false;
      Logger.debug("Stoped event persistence");
    }
  }
}
