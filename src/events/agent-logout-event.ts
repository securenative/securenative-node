import EventTypes from '../event-types';
import IEvent from './event';

export default class AgentLogoutEvent implements IEvent {
  public eventType = EventTypes.AGENT_LOG_OUT;
  public ts: number;

  constructor() {
    this.ts = Date.now();
  }
}
