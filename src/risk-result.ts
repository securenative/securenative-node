import ActionType from "./action-type";
import { RiskLevel } from "./risk-level";

type RiskResult = {
  action: ActionType;
  riskLevel: RiskLevel;
  score: number;
};

export default RiskResult;