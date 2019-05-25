import { ActionType } from "./action-type";

export type ActionResult = {
  action: ActionType;
  riskScore: number;
  triggers: Array<string>;
};
