export default interface Interceptor {
  getModule();
  canExecute(): boolean;
  intercept(reqMiddleware, errMiddleware);
}
