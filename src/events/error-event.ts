import IEvent from './event';
import { EventTypes } from '..';

export default class ErrorEvent implements IEvent {
  private message: string;
  private stackTrace: string;
  eventType: string = EventTypes.ERROR;
  ts: number;

  constructor(err: Error) {
    this.message = err.message;
    this.stackTrace = err.stack;
    this.ts = Date.now();
  }
}