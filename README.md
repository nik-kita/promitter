# Promitter

> This class provide a simple API for symbioses EventEmitter's and Promise's natures
> Inspired by RXJS

## Updates
__wait()__ and __emitAndWaitComplete__ has additional optional parameter _resolveIfWasInPast__:boolean = false
Default behavior is like in previous versions.
Behavior for __true__ value:
If event on which first emittion you want resolve your promise was emitted before this waiting - it will be resolve instansly.
Why it may be needed?
Example - wait on Socket connection. But if connection is already open you will be resolve even if hang this promise after it;
__P. S.__
You may clean all memory about past completed mimimum one time events by calling '__resetCompleted()__' method.

## Declaration:

**`Promitter<TLabel extends string = string>`**

> You may use 'TLabel' for more implicitly type declaration of your code

---

**emit**(label: TLabel, data?: any): Promitter

> Like 'EventEmitter.**emit(...)**'

---

**emitReject**(label: TLabel, data?: any): Promitter;

> The pending promises, given by 'some label' from 'promitter.**wait('some label')**' or from 'promitter.**emitAndWaitComplete**('some label')', these promises will be fullfilled with reject.

---

**once**(label: TLabel, cb: TOnCb): Promitter;

> Like 'EventEmitter.**once**(...)'.

---

**on**(label: TLabel, cb: TOnCb): Promitter;

> Like 'EventEmitter.**on\_**(...)'

---

**wait**<T = unknown>(label: TLabel): Promise<T>;

> Return Promise, that will be fullfilled with first promitter's 'label' emitting anywhere in your code after this moment.

---

**emitAndWaitComplete**<T = unknown>(label: TLabel, data?: unknown): Promise<T>;

> You emit like 'EventEmitter.**emit**(label, data)' but will return a Promise, that will be fullfilled with first listener completion.

---

**rmListeners**(label?: TLabel, cbs?: TOnCb[]): Promitter;

> Without arguments - absolutelly clean your Promitter instance from listeners
> With label - remove all listeners for this label for your Promitter instance
> With label + callback's array - remove concrete listeners... So like with EventEmitter, if you want to delete listener in future - save its callback for this (don't pass it like anonimus function, but first - save in variable)

## Usage example with Socket:

```
import Ws, { WebSocket } from 'ws';
import Promitter from '@nik-kita/promitter';

type MessageExampleType = {
    channel: 'channel1' | 'channel2',
    data: any,
}
let isPause = false;
const promitter = new Promitter<
    'open' | 'close' | 'error' | 'message' | 'channel1' | 'channel2' | 'pause' | 'continue' | 'job'
>().on('continue', () => {
        isPause = false;
    })
    .on('pause', () => {
        isPause = true;
    });

const ws = new Ws('ws://your-socket-connection')
    .on('open', () => {
        promitter.emit('open');
    })
    .on('close', () => {
        promitter.emit('close');
    })
    .on('error', () => {
        promitter.emit('error');
    })
    .on('message', (data: string) => {
        const message = JSON.parse(data) as MessageExampleType;

        if (isPause) return;

        promitter.emit(message.channel, message);
    });

setTimeout(() => promitter.emit('pause'), 4000);

(async () => {
    await promitter.wait('open');
    ws.send('subscribe.channel2');

    promitter.on('message', console.log);

    await promitter.wait('pause');

    console.log('FIRST PAUSE');

    await new Promise((resolve) => setTimeout(resolve, 4000));

    await promitter.emitAndWaitComplete('continue');

    console.log('CONTINUE');
})();

// Example little strange... but hope it will explain the possibilities and goals of this package
```
