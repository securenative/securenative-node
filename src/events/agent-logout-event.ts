import EventType from '../enums/event-type';
import IEvent from './event';

export default class AgentLogoutEvent implements IEvent {
  public eventType = EventType.AGENT_LOG_OUT;
  public ts: number;

  constructor() {
    this.ts = Date.now();
  }
}
