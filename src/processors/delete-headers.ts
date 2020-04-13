import Rule from './../rules/rule';
import { Session } from './../session-manager';

export default class DeleteHeaders {
  constructor(private rule: Rule) { }

  apply(session: Session) {
    if (session.res && session.res.setHeader && !session.res._header) {
      session.res.removeHeader(this.rule.data.key);
    }
  }
}
