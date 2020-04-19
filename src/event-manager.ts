import IEvent from './events/event';
import { SecureNativeOptions } from './types/securenative-options';
import { FetchOptions } from './types/fetch-options';
import { promiseTimeout } from './utils/utils';
import { Logger } from './logger';

export default class EventManager {
  private defaultFetchOptions: FetchOptions;
  private events: Array<FetchOptions> = [];
  private sendEnabled: Boolean = false;
  private timeoutId = null;

  constructor(private fetcher: any, private options: SecureNativeOptions) {
    this.defaultFetchOptions = {
      url: options.apiUrl,
      options: {
        method: 'post',
        headers: {
          Authorization: this.options.apiKey,
        },
      },
    };
  }

  public setSessionId(sessionId: string) {
    this.defaultFetchOptions.options.headers['SN-Agent-Session'] = sessionId;
  }

  public async sendSync<T>(event: IEvent, requestUrl: string, timeout: number = this.defaultFetchOptions.options.timeout): Promise<T> {
    const eventOptions = Object.assign(
      {},
      this.defaultFetchOptions.options,
      {
        body: JSON.stringify(event),
      },
      { timeout }
    );
    Logger.debug('Attempting to send event', eventOptions);
    try {
      const resp = await this.fetcher(requestUrl, eventOptions);
      //special handling to unathorized status
      if (resp.status === 401) {
        Logger.fatal('Unauthorized call to SecureNative API, api key is invalid');
        throw new Error(resp.statusText);
      }
      // if response not ok, or without body, we will reject it
      if (!resp.ok) {
        throw new Error(resp.statusText);
      }
      Logger.debug('Successfuly sent event', eventOptions);
      return await resp.json();
    } catch (ex) {
      Logger.error('Failed to send event', ex);
      return Promise.reject(ex);
    }
  }

  public sendAsync(event: IEvent, requestUrl: string, retry: boolean = true) {
    if (this.events.length >= this.options.maxEvents) {
      this.events.shift();
    }

    const eventOptions = Object.assign({}, this.defaultFetchOptions.options, {
      body: JSON.stringify(event),
    });

    this.events.push({
      url: requestUrl,
      options: eventOptions,
      retry: retry,
    });
    Logger.debug('Added event to persist queue', eventOptions.body);
  }

  private async sendEvents() {
    if (this.events.length > 0 && this.sendEnabled) {
      const fetchEvent = this.events.shift();

      try {
        const resp = await this.fetcher(fetchEvent.url, fetchEvent.options);
        if (resp.status === 401) {
          fetchEvent.retry = false;
        }
        if (!resp.ok) {
          throw new Error(resp.statusText);
        }
        Logger.debug('Event successfully sent', fetchEvent);
      } catch (ex) {
        Logger.error('Failed to send event', ex);
        if (fetchEvent.retry) {
          this.events.unshift(fetchEvent);
          const backOff = Math.ceil(Math.random() * 10) * this.options.timeout;
          Logger.debug('BackOff automatic sending by', backOff);
          this.sendEnabled = false;
          setTimeout(() => (this.sendEnabled = true), backOff);
        }
      }
    }
  }

  public startEventsPersist() {
    if (this.options.autoSend && !this.timeoutId) {
      Logger.debug('Starting automatic event persistence');
      this.sendEnabled = true;
      this.timeoutId = setInterval(async () => {
        await this.sendEvents();
      }, this.options.interval);
    } else {
      Logger.debug('Automatic event persistence disabled, you should manualy persist events');
    }
  }

  public async stopEventsPersist() {
    if (this.timeoutId) {
      Logger.debug('Stopping automatic event persistence');
      clearInterval(this.timeoutId);
      // drain event queue
      await this.sendEvents();
      this.sendEnabled = false;
      Logger.debug('Stoped event persistence');
    }
  }
}
