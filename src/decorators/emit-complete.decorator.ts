import EventEmitter from 'events';
import { COMPLETE_PREFIX } from '../globals/emitter-prefixes.globals';
import { TOnCb } from '../types/on-cb.type';

export function EmitComplete() {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const { value: origin } = descriptor;

    descriptor.value = (label: string, cb: TOnCb) => {
      origin.apply(target.constructor.prototype, label, cb);
      
      if (label.includes(COMPLETE_PREFIX)) return;

      target.emitter.emit(`${COMPLETE_PREFIX}${label}`)
    }

    return descriptor;
  }
}