import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http2";

export type RequestContext = {
  clientToken?: string;
  ip?: string;
  remoteIp?: string;
  headers?: IncomingHttpHeaders;
  url?: string;
  method?: string;
  body?: string;
};

export type ResponseContext = {
  status?: number;
  headers?: OutgoingHttpHeaders;
};
