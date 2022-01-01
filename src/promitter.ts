import EventEmitter from 'events';
import { EmitComplete } from './decorators/emit-complete.decorator';
import { COMPLETE_PREFIX, REJECT_PREFIX } from './globals/emitter-prefixes.globals';
import { TOnCb } from './types/on-cb.type';

/**
 * You should specify all labels for better types code-control
 * 
 * For example:
 * 
 * const p = new Promitter<'open' | 'close' | 'success'>();
 */
export class Promitter<TLabel extends string = string> {
  private emitter = new EventEmitter();

  public emit(label: TLabel, data?: any) {
    this.emitter.emit(label, data);
    
    return this;
  }
  
  public emitReject(label: TLabel, data?: any) {
    this.emitter.emit(REJECT_PREFIX + label, data);
    
    return this;
  }
  
  @EmitComplete()
  public once(label: TLabel, cb: TOnCb) {
    this.emitter.once(label, cb);

    return this;
  }
  
  @EmitComplete()
  public on(label: TLabel, cb: TOnCb) {
    this.emitter.on(label, cb);

    return this;
  }

  public wait<T = unknown>(label: TLabel) {
    return new Promise<T>((resolve, reject) => {
      this
        .emitter
        .once(label, (data: T) => {
          resolve(data);
        })
        .once(REJECT_PREFIX + label, (data: unknown) => {
          reject(data);
        });
    });
  }

  public emitAndWaitComplete(label: TLabel, data?: unknown) {
    const waitComplete = new Promise<unknown>((resolve, reject) => {
      this
        .emitter
        .once(COMPLETE_PREFIX + label, (_data: unknown) => {
          resolve(_data);
        })
        .once(REJECT_PREFIX + label, (_data: unknown) => {
          reject(_data);
        });
    });

    this.emitter.emit(label, data)
  }
}
