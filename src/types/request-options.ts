import EventType from '../enums/event-type';
import { RequestContext, ResponseContext } from './request-context';

export type RequestOptions = {
  event: EventType | string;
  context: {
    req?: RequestContext;
    res?: ResponseContext;
  }
  timestamp?: Date;
};
