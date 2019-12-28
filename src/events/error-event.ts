import IEvent from './event';
import { EventTypes } from '..';

export default class ErrorEvent implements IEvent {
  private name: string;
  private message: string;
  private stackTrace: string;
  eventType: string = EventTypes.ERROR;
  ts: number;

  constructor(err: Error) {
    this.name = err.name;
    this.message = err.message;
    this.stackTrace = err.stack;
    this.ts = Date.now();
  }
}