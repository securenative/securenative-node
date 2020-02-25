import Rule from "../rules/rule";
import Action from "../actions/action";

export type AgentLoginOptions = {
  sessionId: string;
  rules: Array<Rule>;
  actions: Array<Action>;
};
