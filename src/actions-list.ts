import { ActionSet } from './action-set';

const whitelist = new ActionSet("WhiteList");
const blackList = new ActionSet("BlackList");

export = {
  whitelist,
  blackList
}