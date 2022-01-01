import EventEmitter from 'events';
import { ALL_PREFIXES, COMPLETE_PREFIX, REJECT_PREFIX } from './globals/emitter-prefixes.globals';
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

  public once(label: TLabel, cb: TOnCb) {
    this.emitter.once(label, (...args: any[]) => {
      cb(...args);

      if (label.includes(COMPLETE_PREFIX)) return;

      this.emitter.emit(COMPLETE_PREFIX + label);
    });

    return this;
  }

  public on(label: TLabel, cb: TOnCb) {
    this.emitter.on(label, (...args: any[]) => {
      cb(...args);

      if (label.includes(COMPLETE_PREFIX)) return;

      this.emitter.emit(COMPLETE_PREFIX + label);
    });

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

  public emitAndWaitComplete<T = unknown>(label: TLabel, data?: unknown) {
    const waitComplete = new Promise<T>((resolve, reject) => {
      this
        .emitter
        .once(COMPLETE_PREFIX + label, (_data: T) => {
          resolve(_data);
        })
        .once(REJECT_PREFIX + label, (_data: unknown) => {
          reject(_data);
        });
    });

    this.emitter.emit(label, data)

    return waitComplete;
  }

  public rmListeners(label?: TLabel, cbs: TOnCb[] = []) {
    console.log(label);
    console.log('===');
    console.log(cbs[0].toString());
    console.log('===');
    if (!label) {
      this.emitter.removeAllListeners();

      return this;
    }

    if (cbs.length) {
      cbs.forEach((cb) => {
        this.emitter.removeListener(label, cb);
      });

      return this;
    }

    this.emitter.removeAllListeners(label);
    ALL_PREFIXES.forEach((prefix) => this.emitter.removeAllListeners(prefix + label));

    return this;
  }
}
