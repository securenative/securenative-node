import { RiskLevel } from "./risk-level";

export type RiskResult = {
  riskLevel: RiskLevel;
  score: number;
  triggers: Array<string>;
};
