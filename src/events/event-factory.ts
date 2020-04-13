import IEvent from './event';

export function createEvent<T extends IEvent>(c: new (...params) => T, ...params: any[]): T {
  return new c(...params);
} 
