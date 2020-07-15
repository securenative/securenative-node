import EventType from '../enums/event-type';
import { CustomProperties } from './custom-properties';
import { RequestContext } from './request-context';

export type EventOptions = {
  event: EventType | string;
  userId?: string;
  userTraits?: {
    name?: string;
    email?: string;
    phone?: string;
    createdAt?: Date;
  };
  context?: RequestContext;
  properties?: CustomProperties;
  timestamp?: Date;
};
