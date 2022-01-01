import EventEmitter from 'events';
import { ALL_PREFIXES, COMPLETE_PREFIX, REJECT_PREFIX } from './globals/emitter-prefixes.globals';
import { TListenersMapValue } from './types/listeners-map-value.type';
import { TOnCb } from './types/on-cb.type';

/**
 * You should specify all labels for better types code-control
 * 
 * For example:
 * 
 * const p = new Promitter<'open' | 'close' | 'success'>();
 */
export class Promitter<TLabel extends string = string> {
  private listenersMap = new Map<string, TListenersMapValue>();

  private emitter = new EventEmitter();

  private getCbType(label: string): '' | typeof COMPLETE_PREFIX | typeof REJECT_PREFIX {
    return label.includes(COMPLETE_PREFIX)
      ? COMPLETE_PREFIX 
      : label.includes(REJECT_PREFIX)
        ? REJECT_PREFIX
        : '';
  }

  private compileAndSaveCb(label: string, cb: TOnCb) {  
    const cbType = this.getCbType(label);
    const _cb = (...args: any[]) => {
      cb(...args);


      if (cbType === COMPLETE_PREFIX || cbType === REJECT_PREFIX) return;

      this.emitter.emit(COMPLETE_PREFIX + label);
    };
    const key = label + cb.toString();
    let value = this.listenersMap.get(key) ?? (() => {
      const _value = {};
      this.listenersMap.set(key, _value);
  
      return _value as TListenersMapValue;
    })();

    value[cbType] = _cb;

    console.log('KEY:', key);
    console.log('VALUE:', value);

    return _cb;
  }

  public emit(label: TLabel, data?: any) {
    this.emitter.emit(label, data);

    return this;
  }

  public emitReject(label: TLabel, data?: any) {
    this.emitter.emit(REJECT_PREFIX + label, data);

    return this;
  }


  public once(label: TLabel, cb: TOnCb) {
    
    this.emitter.once(label, this.compileAndSaveCb(label, cb));

    return this;
  }

  public on(label: TLabel, cb: TOnCb) {
    this.emitter.on(label, this.compileAndSaveCb(label, cb));

    return this;
  }

  public wait<T = unknown>(label: TLabel) {
    return new Promise<T>((resolve, reject) => {
      this
        .once(label, (data: T) => {
          resolve(data);
        })
        .once((REJECT_PREFIX + label as any), (data: unknown) => {
          reject(data);
        });
    });
  }

  public emitAndWaitComplete<T = unknown>(label: TLabel, data?: unknown) {
    const waitComplete = new Promise<T>((resolve, reject) => {
      this
        .once((COMPLETE_PREFIX + label as any), (_data: T) => {
          resolve(_data);
        })
        .once((REJECT_PREFIX + label as any), (_data: unknown) => {
          reject(_data);
        });
    });

    this.emitter.emit(label, data)

    return waitComplete;
  }

  public rmListeners(label?: TLabel, cbs: TOnCb[] = []) {
    if (!label) {
      this.emitter.removeAllListeners();

      return this;
    }

    if (cbs.length) {
      cbs.forEach((cb) => {
        console.log('label + cb.ToString():', label + cb.toString())
        const cbs = this.listenersMap.get(label + cb.toString());
        console.log('CBS:', cbs);

        if (!cbs) return;

        Object.entries(cbs).forEach(([prefix, value]) => {
          if (!value) return;

          const key = prefix + label + cb.toString();

          console.log(key, value);
          this.emitter.removeListener(key, value);
        });
      });

      return this;
    }

    this.emitter.removeAllListeners(label);
    ALL_PREFIXES.forEach((prefix) => this.emitter.removeAllListeners(prefix + label));

    return this;
  }
}
