import { RiskLevel } from "./risk-level";

type VerifyResult = {
  riskLevel: RiskLevel;
  score: number;
  triggers: Array<string>;
};

export default VerifyResult;