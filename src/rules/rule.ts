interface RuleInterception {
  module: string;
  method: string;
  processor: string;
}

interface RuleData {
  key: string;
  value: string;
}

export default interface Rule {
  name: string;
  data: RuleData;
  interception: RuleInterception
}
