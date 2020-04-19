import EventType from '../enums/event-type';
import { RequestContext, ResponseContext } from './request-context';

export type RequestOptions = {
  event: EventType | string;
  reqContext?: RequestContext;
  resContext?: ResponseContext;
  timestamp?: Date;
};
