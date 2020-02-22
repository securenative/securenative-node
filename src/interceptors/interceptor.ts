import SessionManager from "./../session-manager";
import RulesManager from './../rules/rule-manager';

export interface IInterceptor {
  getModule();
  canExecute(): boolean;
  intercept(reqMiddleware, errMiddleware);
}

export abstract class Interceptor {
  intercept(method: string, listener: string) {
    const rules = RulesManager.getRules(method, listener);
    const session = SessionManager.getSession();
    rules.forEach((rule) => {
      rule.processor.call(this, rule, session);
    });
  }
}
