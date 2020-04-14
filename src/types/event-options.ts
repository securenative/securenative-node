import EventType from '../enums/event-type';
import { IncomingHttpHeaders } from 'http2';
import { CustomParams } from './custom-params';

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
  params?: CustomParams;
};
