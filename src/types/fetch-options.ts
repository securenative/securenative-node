import { RequestInit, RequestInfo } from 'node-fetch';

export type FetchOptions = {
  url: RequestInfo;
  options: RequestInit;
  retry?: boolean;
};
