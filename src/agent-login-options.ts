import Rule from "./rules/rule";

export type AgentLoginOptions = {
  sessionId: string;
  rules: Array<Rule>;
  actions: Array<any>;
};
