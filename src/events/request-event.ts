import IEvent from './event';
import { KeyValuePair } from '../types/key-value-pair';
import { decrypt } from '../utils/utils';
import { Logger } from '../logger';
import { v4 } from 'uuid';
import { SecureNativeOptions } from '../types/securenative-options';
import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http2';
import { RequestOptions } from '../types/request-options';

export default class RequestEvent implements IEvent {
  public rid: string;
  public eventType: string;
  public user: {
    id: string;
    name: string;
    email: string;
  };
  public request: {
    cid: string;
    vid: string;
    fp: string;
    ip: string;
    remoteIp: string;
    headers: IncomingHttpHeaders;
    url: string;
    method: string;
    body: string;
  };
  public response: {
    status: number;
    headers: OutgoingHttpHeaders;
  };
  public ts: number;
  public params?: Array<KeyValuePair>;

  constructor(event: RequestOptions, options: SecureNativeOptions) {
    Logger.debug('Building SDK event');
    const decryptedToken = decrypt(event.reqContext?.clientToken, options.apiKey);
    Logger.debug('Decrypted client token', decryptedToken);
    const parsedToken = JSON.parse(decryptedToken) || {};
    Logger.debug('Parsed client token:', parsedToken);

    const user: any = {};
    const reqContext = event.reqContext || {};
    const resContext = event.resContext || {};

    this.rid = v4();
    this.eventType = event.eventType;
    this.user = {
      id: user.id || '',
      name: user.name || '',
      email: user.email || '',
    };

    this.request = {
      cid: parsedToken.cid || '',
      vid: parsedToken.vid || '',
      fp: parsedToken.fp || '',
      ip: reqContext.ip || '',
      remoteIp: reqContext.remoteIp || '',
      method: reqContext.method || '',
      url: reqContext.url,
      body: reqContext.body || '',
      headers: reqContext.headers || {},
    };

    this.response = {
      status: resContext.status || 0,
      headers: resContext.headers || {},
    };

    this.ts = event.timestamp || Date.now();
    this.params = event.params || [];
  }
}
