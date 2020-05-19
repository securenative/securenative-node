import IEvent from './event';
import { EventOptions } from '../types/event-options';
import { decrypt } from '../utils/utils';
import { Logger } from '../logger';
import { v4 } from 'uuid';
import { SecureNativeOptions } from '../types/securenative-options';
import { IncomingHttpHeaders } from 'http2';
import { CustomProperties } from '../types/custom-properties';

export default class SDKEvent implements IEvent {
  public rid: string;
  public eventType: string;
  public userId: string;
  public userTraits: {
    name: string;
    email: string;
    createdAt: string;
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
  };
  public timestamp: string;
  public properties?: CustomProperties;

  constructor(event: EventOptions, options: SecureNativeOptions) {
    Logger.debug('Building SDK event');

    const decryptedToken = decrypt(event.context?.clientToken, options.apiKey);
    Logger.debug('Decrypted client token', decryptedToken);
    const parsedToken = JSON.parse(decryptedToken) || {};
    Logger.debug('Parsed client token:', parsedToken);

    const user: any = event.userTraits || {};
    this.rid = v4();
    this.eventType = event.event;
    this.userId = event.userId || '';
    this.userTraits = {
      name: user.name || '',
      email: user.email || '',
      createdAt: user.createdAt?.toISOString() || new Date(0).toISOString(),
    };
    this.request = {
      cid: parsedToken.cid || '',
      vid: parsedToken.vid || '',
      fp: parsedToken.fp || '',
      ip: event.context.ip || '',
      remoteIp: event.context.remoteIp || '',
      method: event.context.method || '',
      url: event.context.url,
      headers: event.context.headers || {},
    };
    this.timestamp = event.timestamp?.toISOString() || new Date().toISOString();
    this.properties = event.properties || {};
  }
}
