import IEvent from './event';
import { KeyValuePair } from '../types/key-value-pair';
import { EventOptions } from '../types/event-options';
import { decrypt, mergeRequestContexts, contextFromRequest, contextFromResponse } from '../utils/utils';
import { Logger } from '../logger';
import { v4 } from 'uuid';
import { SecureNativeOptions } from '../types/securenative-options';
import SessionManager from '../session-manager';
import { IncomingHttpHeaders } from 'http2';

export default class SDKEvent implements IEvent {
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
  public ts: number;
  public params?: Array<KeyValuePair>;

  constructor(event: EventOptions, options: SecureNativeOptions) {
    Logger.debug('Building SDK event');
    const decryptedToken = decrypt(event.context?.clientToken, options.apiKey);
    Logger.debug('Decrypted client token', decryptedToken);
    const parsedToken = JSON.parse(decryptedToken) || {};
    Logger.debug('Parsed client token:', parsedToken);

    const user: any = event.user || {};

    // extract info from session
    const { req } = SessionManager.getLastSession();

    const reqCtx = mergeRequestContexts(event.context || {}, contextFromRequest(req));
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
      ip: reqCtx.ip || '',
      remoteIp: reqCtx.remoteIp || '',
      method: reqCtx.method || '',
      url: reqCtx.url,
      body: reqCtx.body || '',
      headers: reqCtx.headers || {}
    };
    this.ts = event.timestamp || Date.now();
    this.params = event.params || [];
  }
}
