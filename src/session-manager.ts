import { IncomingMessage, ServerResponse } from 'http';
import { Logger } from './logger';
export interface Session {
  req: IncomingMessage | any;
  res: ServerResponse | any;
}

export default class SessionManager {
  private static lastSessionId = '';
  private static session: Map<string, Session> = new Map<string, Session>();

  static getLastSession(): Session {
    const session = SessionManager.session.get(SessionManager.lastSessionId) || { req: null, res: null };
    Logger.debug(`[SessionManager] Getting last session by: ${SessionManager.lastSessionId}, is: ${session.req?.sn_uid}`);
    return session;
  }

  static getSession(id: string): Session {
    return SessionManager.session.get(id) || { req: null, res: null };
  }

  static setSession(id: string, session: Session) {
    Logger.debug(`[SessionManager] Setting session: ${id}`);
    session.req.sn_uid = id;
    session.res.sn_uid = id;
    SessionManager.session.set(id, session);

    //save last session
    SessionManager.lastSessionId = id;
  }

  static cleanSession(id: string) {
    Logger.debug(`[SessionManager] Cleaning session: ${id}`);
    SessionManager.session.delete(id);
  }
}
