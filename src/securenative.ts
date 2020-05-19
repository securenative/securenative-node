import { SecureNativeOptions } from './types/securenative-options';
import { EventOptions } from './types/event-options';
import EventManager from './event-manager';
import ApiManager from './api-manager';
import VerifyResult from './types/verify-result';

export default class SecureNative {
  private apiManager: ApiManager;
  
  constructor(eventManager: EventManager, options: SecureNativeOptions) {
    if (!eventManager || !options) {
      throw new Error('Unable to create SecureNative instance, invalid config provided');
    }
    this.apiManager = new ApiManager(eventManager, options);
  }

  public track(opts: EventOptions) {
    return this.apiManager.track(opts);
  }

  public async verify(opts: EventOptions): Promise<VerifyResult> {
    return await this.apiManager.verify(opts);
  }
}
