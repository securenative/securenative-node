import Rule from './../rules/rule';
import { Session } from './../session-manager';

export default class ModifyHeaders {
  constructor(private rule: Rule) { }

  apply(session: Session) {
    if (session.res && session.res.setHeader && !session.res._header) {
      session.res.setHeader(this.rule.data.key, this.rule.data.value);
    }
  }
}
