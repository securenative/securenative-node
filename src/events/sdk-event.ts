import IEvent from './event';
import { KeyValuePair } from '../types/key-value-pair';
import { EventOptions, RequestContext } from '../types/event-options';
import { decrypt } from '../utils/utils';
import { Logger } from '../logger';
import { v4 } from 'uuid';
import { SecureNativeOptions } from '../types/securenative-options';

export default class SDKEvent implements IEvent {
  public id: string;
  public eventType: string;
  public user: {
    id: string;
    name: string;
    email: string;
  };
  public context: {
    cid: string;
    fp: string;
    ip: string;
    remoteIp: string;
    headers: Array<KeyValuePair>;
    url: string;
    method: string;
    body: string;
  };
  public ts: number;
  public params?: Array<KeyValuePair>;

  constructor(event: EventOptions, options: SecureNativeOptions) {
    Logger.debug('Building SDK event');
    const decryptedToken = decrypt(event.context.clientToken, options.apiKey);
    Logger.debug('Decrypted client token', decryptedToken);
    const parsedToken = JSON.parse(decryptedToken) || {};
    Logger.debug('Parsed client token:', parsedToken);

    const user: any = event.user || {};
    const context: any = event.context || {};

    this.id = v4();
    this.eventType = event.eventType;
    this.user = {
      id: user.id || '',
      name: user.name || '',
      email: user.email || '',
    };

    this.context = {
      cid: parsedToken.cid || '',
      fp: parsedToken.fp || '',
      ip: context.ip || '',
      remoteIp: context.remoteIp || '',
      body: context.body || '',
      headers: context.headers || [],
      method: context.method || '',
      url: context.url,
    };
    this.ts = event.timestamp || Date.now();
    this.params = event.params;
  }
}
