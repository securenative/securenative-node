import { Logger } from './logger';
import { createEvent } from './events/event-factory';
import { EventOptions } from './types/event-options';
import SDKEvent from './events/sdk-event';
import { SecureNativeOptions } from './types/securenative-options';
import EventManager from './event-manager';
import VerifyResult from './types/verify-result';
import ApiRoute from './enums/api-route';
import FailoveStrategy from './enums/failover-strategy';

const MAX_CUSTOM_PROPERTIES = 10;

export default class ApiManager {
  constructor(private eventManager: EventManager, private options: SecureNativeOptions) {}

  public track(opts: EventOptions) {
    Logger.debug('Track event call', opts);
    if (opts && opts.properties && Object.keys(opts.properties).length > MAX_CUSTOM_PROPERTIES) {
      throw new Error(`You can only specify maximum of ${MAX_CUSTOM_PROPERTIES} custom properties`);
    }

    const requestUrl = `${this.options.apiUrl}/${ApiRoute.Track}`;
    const event = createEvent(SDKEvent, opts, this.options);
    this.eventManager.sendAsync(event, requestUrl);
  }

  public async verify(opts: EventOptions): Promise<VerifyResult> {
    Logger.debug('Verify risk call', opts);

    const requestUrl = `${this.options.apiUrl}/${ApiRoute.Verify}`;
    const event = createEvent(SDKEvent, opts, this.options);

    try {
      const result = await this.eventManager.sendSync<VerifyResult>(event, requestUrl);
      Logger.debug('Successfuly called verify', result);
      return result;
    } catch (ex) {
      Logger.error('Failed to call verify', ex);
      return this.options.failoverStrategy === FailoveStrategy.FailOpen
        ? { riskLevel: 'low', score: 0, triggers: [] }
        : { riskLevel: 'high', score: 1, triggers: [] };
    }
  }
}
