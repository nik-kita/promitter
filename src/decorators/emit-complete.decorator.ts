import EventEmitter from 'events';
import { COMPLETE_PREFIX } from '../globals/emitter-prefixes.globals';
import { TOnCb } from '../types/on-cb.type';

export function EmitComplete() {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    const { value: origin } = descriptor;

    descriptor.value = function(label: string, cb: TOnCb) {
      origin.call(this, label, cb);
      

      if (label.includes(COMPLETE_PREFIX)) return;

      (this as any).emitter.emit(`${COMPLETE_PREFIX}${label}`)
    }

    return descriptor;
  }
}