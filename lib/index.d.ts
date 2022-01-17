/// <reference types="node" />
import { EventEmitter } from 'events';
import http2 from 'http2';
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
export interface EventSourceOpts {
    headers: http2.OutgoingHttpHeaders;
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
    constructor(url: string, opts?: EventSourceOpts);
    addEventListener(type: string, callback: (event: MessageEvent) => any): this;
    dispatchEvent(type: string, event: MessageEvent): boolean;
    close(): void;
    private parseEventStreamLine;
    private connect;
}
export default EventSource;
//# sourceMappingURL=index.d.ts.map