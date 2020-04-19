import EventType from '../enums/event-type';
import IEvent from './event';

export default class AgentLogoutEvent implements IEvent {
  public eventType = EventType.AGENT_LOG_OUT;
  public timestamp: string;

  constructor() {
    this.timestamp = new Date().toISOString();
  }
}
