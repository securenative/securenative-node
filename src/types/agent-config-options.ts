import Rule from "../rules/rule";
import Action from "../actions/action";

export type AgentConfigOptions = {
  rules: Array<Rule>;
  actions: Array<Action>;
  ts: number;
};
