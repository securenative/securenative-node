import EventType from '../enums/event-type';
import { KeyValuePair } from './key-value-pair';

export type RequestContext = {
  clientToken?: string;
  ip?: string;
  remoteIp?: string;
  headers?: Array<KeyValuePair>;
  url?: string;
  method?: string;
  body?: string;
};

export type EventOptions = {
  eventType: EventType | string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
  context: RequestContext;
  timestamp?: number;
  params?: Array<KeyValuePair>;
};
