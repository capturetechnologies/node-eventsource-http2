/// <reference types="node" />
import { EventEmitter } from 'events';
export interface MessageEventOpts {
    data: string;
    origin?: string;
    lastEventId?: string;
    source?: string;
}
export interface MessageEvent {
    type: string;
    data?: string;
    origin?: string;
    lastEventId?: string;
    source?: string;
}
export declare class EventSource extends EventEmitter {
    private static CONNECTING;
    private static OPEN;
    private static CLOSED;
    readyState: number;
    private url;
    private data;
    private eventName;
    private discardTrailingNewline;
    private lastEventId;
    private request;
    private reconnectInterval;
    constructor(url: string);
    addEventListener(type: string, callback: (event: MessageEvent) => any): this;
    dispatchEvent(type: string, event: MessageEvent): boolean;
    private parseEventStreamLine;
    private connect;
}
//# sourceMappingURL=index.d.ts.map