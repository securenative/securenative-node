import { processors } from './../processors';
import Rule from './rule';

export default class RulesManager {
  private static rules = [];

  static getRules(method, listner) {
    return RulesManager.rules.filter(h => h.method == method && h.listner == listner);
  }

  private static registerRule(rule) {
    RulesManager.rules.push(rule);
  }

  static clean = () => {
    RulesManager.rules = [];
  }

  static enforceRules = (rules: Array<Rule>) => {
    //clean previous rules
    RulesManager.clean();
    
    rules.forEach((rule: Rule) => {
      const { data, interception } = rule;
      const { module, method, processor } = interception;

      const [func, listner = ''] = method.split(":");

      RulesManager.registerRule({
        data,
        module,
        method: func,
        listner,
        processor: (rule, session) => new processors[processor](rule).apply(session)
      });
    });
  }
}
