export default interface Action {
  name: string;
  ttl: number;
  ts: number;
  values: Array<string>;
}
