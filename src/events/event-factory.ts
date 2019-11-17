import IEvent from './event';
import { EventKinds } from './event-kinds';
import SDKEvent from './sdk-event';
import AgentLoginEvent from './agent-login-event';
import AgentLogoutEvent from './agent-logout-event';
import ErrorEvent from './error-event';
import PerformanceEvent from './performance-event';
import RequestEvent from './request-event';

export function createEvent(eventKind: EventKinds, ...params: any[]): IEvent {
  if (eventKind === EventKinds.AGENT_LOGIN) {
    const [framework, frameworkVersion, appName] = params;
    return new AgentLoginEvent(framework, frameworkVersion, appName);
  } else if (eventKind === EventKinds.AGENT_LOGOUT) {
    return new AgentLogoutEvent();
  } else if (eventKind === EventKinds.SDK) {
    const [req, eventOptions, snOptions] = params;
    return new SDKEvent(req, eventOptions, snOptions);
  } else if (eventKind === EventKinds.ERROR) {
    return new ErrorEvent();
  } else if (eventKind === EventKinds.PERFORMANCE) {
    return new PerformanceEvent();
  } else if (eventKind === EventKinds.REQUEST) {
    return new RequestEvent();
  }
} 
