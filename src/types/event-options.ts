import EventType from '../enums/event-type';
import { KeyValuePair } from './key-value-pair';
import { IncomingHttpHeaders } from 'http2';

export type Context = {
  clientToken?: string;
  ip?: string;
  remoteIp?: string;
  headers?: IncomingHttpHeaders;
};

export type EventOptions = {
  eventType: EventType | string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  context?: Context;
  timestamp?: number;
  params?: Array<KeyValuePair>;
};
