import EventType from '../enums/event-type';
import { KeyValuePair } from './key-value-pair';
import { RequestContext, ResponseContext } from './request-context';

export type RequestOptions = {
  eventType: EventType | string;
  reqContext?: RequestContext;
  resContext?: ResponseContext;
  timestamp?: number;
  params?: Array<KeyValuePair>;
};
