import { IncomingMessage, ServerResponse } from 'http';
import { Logger } from './logger';
import { createNamespace, Namespace } from 'cls-hooked';

export interface Session {
  req: IncomingMessage | any;
  res: ServerResponse | any;
}

export default class SessionManager {
  private static stack: Array<Session> = [];
  private static ns = createNamespace('sn_session');
  static getLastSession(): Session {
    const [session = { req: null, res: null }] = SessionManager.stack;
    return session;
  }

  static getSession(id: string): Session {
    return SessionManager.stack.find((s) => s.req.sn_uid === id) || { req: null, res: null };
  }

  static setSession(id: string, session: Session) {
    Logger.debug(`[SessionManager] Setting session: ${id}`);
    session.req.sn_uid = id;
    session.res.sn_uid = id;
    //add session
    SessionManager.stack.push(session);
  }

  static cleanSession(id: string) {
    Logger.debug(`[SessionManager] Cleaning session: ${id}`);
    // delete item
    const inx = SessionManager.stack.findIndex((s) => s.req.sn_uid === id);
    if (inx !== -1) {
      SessionManager.stack.splice(inx, 1);
    }
  }

  static cleanAllSessions() {
    Logger.debug(`[SessionManager] Cleaning all sessions`);
    SessionManager.stack = [];
  }

  static getNs(): Namespace {
    return SessionManager.ns;
  }
}
