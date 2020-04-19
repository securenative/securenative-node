import EventType from '../enums/event-type';
import { IncomingHttpHeaders } from 'http2';
import { CustomProperties } from './custom-properties';

export type Context = {
  clientToken?: string;
  ip?: string;
  remoteIp?: string;
  headers?: IncomingHttpHeaders;
};

export type EventOptions = {
  event: EventType | string;
  userId?: string;
  userTraits?: {
    name?: string;
    email?: string;
    createdAt?: Date;
  };
  context?: Context;
  properties?: CustomProperties;
  timestamp?: Date;
};
