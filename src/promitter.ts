import EventEmitter from 'events';
import { ALL_PREFIXES, COMPLETE_PREFIX, PREFIX_DELIMITER, REJECT_PREFIX } from './globals/emitter-prefixes.globals';
import { TOnCb } from './types/on-cb.type';

/**
 * You should specify all labels for better types code-control
 * 
 * For example:
 * 
 * const p = new Promitter<'open' | 'close' | 'success'>();
 */
export class Promitter<TLabel extends string = string> {
  /**
   * JSON pseudo representation of listenersMap:
   *   { label: { uniqueLabel: TOnCb } }
   */
  private listenersMap = new Map<string, Map<string, TOnCb>>();

  private emitter = new EventEmitter();


  private compileAndSaveCb(label: string, cb: TOnCb) {  
    const isOriginalCb = label.split(PREFIX_DELIMITER).length === 1;
    console.log('isOriginal', isOriginalCb);
    const _cb = (...args: any[]) => {
      cb(...args);

      if (!isOriginalCb) return;
  
      this.emitter.emit(COMPLETE_PREFIX + label);
    };

    if (!isOriginalCb) return cb;

    const childKey = label + cb.toString();

    let childMap = this.listenersMap.get(label) ?? (() => {
      const _childMap = new Map<string, TOnCb>();
      
      this.listenersMap.set(label, _childMap);
  
      return _childMap;
    })();

    if (childKey.includes('message')){
      console.log('child key', childKey);
      console.log('_cb', _cb.toString());
    } 

    childMap.set(childKey, _cb);

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
        const childKey = label + cb.toString();
        const childMap = this.listenersMap.get(label);
        
        console.log('CHILDKEY', childKey);
        if (!childMap) return;

        const _cb = childMap.get(childKey);

        console.log('_CB', _cb?.toString());
        if (!_cb) return;

        if (childMap.size === 1) {
          ALL_PREFIXES.forEach((p) => this.emitter.removeAllListeners(p + label)); 
        }

        this.emitter.removeListener(label, _cb);
        

        childMap.delete(childKey);
      });

      return this;
    }

    this.emitter.removeAllListeners(label);
    ALL_PREFIXES.forEach((prefix) => this.emitter.removeAllListeners(prefix + label));

    return this;
  }
}
