import { IncomingMessage, ServerResponse } from 'http';

export interface Session {
  req: IncomingMessage | any;
  res: ServerResponse | any;
}

export default class SessionManager {
  private static lastSessionId = '';
  private static session: Map<string, Session> = new Map<string, Session>();

  static getLastSession(): Session {
    return SessionManager.session.get(SessionManager.lastSessionId) || { req: null, res: null };
  }

  static getSession(id: string): Session {
    return SessionManager.session.get(id) || { req: null, res: null };
  }

  static setSession(id: string, session: Session) {
    session.req.sn_uid = id;
    session.res.sn_uid = id;
    SessionManager.session.set(id, session);

    //save last session
    SessionManager.lastSessionId = id;
  }

  static cleanSession(id: string) {
    SessionManager.session.delete(id);
  }
}
