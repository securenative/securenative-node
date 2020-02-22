import { IncomingMessage, ServerResponse } from "http";

export interface Session {
  req: IncomingMessage | any;
  res: ServerResponse | any;
}

export default class SessionManager {
  private static session: Session;

  static getSession(): Session {
    return SessionManager.session;
  }

  static setSession(session: Session) {
    SessionManager.session = session;
  }
}
