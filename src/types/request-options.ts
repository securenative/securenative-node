import EventType from '../enums/event-type';
import { RequestContext, ResponseContext } from './request-context';
import { CustomParams } from './custom-params';

export type RequestOptions = {
  eventType: EventType | string;
  reqContext?: RequestContext;
  resContext?: ResponseContext;
  timestamp?: number;
  params?: CustomParams;
};
