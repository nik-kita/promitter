import { COMPLETE_PREFIX, REJECT_PREFIX } from "../globals/emitter-prefixes.globals";
import { TOnCb } from "./on-cb.type";

export type TListenersMapValue = {
    ''?: TOnCb,
    [COMPLETE_PREFIX]?: TOnCb,
    [REJECT_PREFIX]?: TOnCb,
  }
  