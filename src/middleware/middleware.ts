export default interface IMiddleware {
  verifyWebhook(...params: any[]);
  verifyRequest(...params: any[]);
}
