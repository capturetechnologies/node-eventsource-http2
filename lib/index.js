"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const http2_1 = __importDefault(require("http2"));
const url_1 = require("url");
const BOM = [239, 187, 191];
const SPACE_KEY = 32;
const ENTER_KEY = 13;
const COLON_KEY = 58;
const LINE_FEED_KEY = 10;
const hasBom = (buf) => BOM.every((char, idx) => buf[idx] === char);
class EventSource extends events_1.EventEmitter {
    constructor(url) {
        super();
        this.readyState = EventSource.CONNECTING;
        this.data = '';
        this.eventName = '';
        this.lastEventId = '';
        this.discardTrailingNewline = false;
        this.url = new url_1.URL(url);
        this.reconnectInterval = 1000;
        const client = http2_1.default.connect(this.url.origin);
        this.request = client.request({
            ':path': this.url.pathname,
            "Accept": 'text/event-stream',
            'Cache-Control': 'no-cache',
        });
        this.connect();
    }
    // for backwards compatibility
    addEventListener(type, callback) {
        return this.addListener(type, callback);
    }
    dispatchEvent(type, event) {
        this.emit(type, event);
        return true;
    }
    parseEventStreamLine(buf, pos, fieldLength, lineLength) {
        if (lineLength === 0) {
            if (this.data.length > 0) {
                const type = this.eventName || 'message';
                const event = {
                    data: this.data.slice(0, -1),
                    lastEventId: this.lastEventId,
                    origin: this.url.origin,
                    type,
                };
                this.emit(type, event);
                this.data = '';
            }
            this.eventName = '';
        }
        else if (fieldLength > 0) {
            const noValue = fieldLength < 0;
            let step = 0;
            const field = buf
                .slice(pos, pos + (noValue ? lineLength : fieldLength))
                .toString();
            if (noValue) {
                step = lineLength;
            }
            else if (buf[pos + fieldLength + 1] !== SPACE_KEY) {
                step = fieldLength + 1;
            }
            else {
                step = fieldLength + 2;
            }
            pos += step;
            const valueLength = lineLength - step;
            const value = buf.slice(pos, pos + valueLength).toString();
            if (field === 'data') {
                this.data += value + '\n';
            }
            else if (field === 'event') {
                this.eventName = value;
            }
            else if (field === 'id') {
                this.lastEventId = value;
            }
            else if (field === 'retry') {
                const retry = parseInt(value, 10);
                if (!Number.isNaN(retry)) {
                    this.reconnectInterval = retry;
                }
            }
        }
    }
    async connect() {
        this.request.on('response', (headers, flags) => {
            const status = headers[':status'];
            if (!status || [500, 502, 503, 504].includes(status)) {
                const event = {
                    data: `endpoint status ${status}`,
                    type: 'event',
                };
                this.emit('error', event);
            }
            this.readyState = EventSource.OPEN;
            this.emit('open', { type: 'open' });
            let isFirst = true;
            let buf;
            this.request
                .on('data', chunk => {
                buf = buf ? Buffer.concat([buf, chunk]) : Buffer.from(chunk);
                if (isFirst && hasBom(buf)) {
                    buf = buf.slice(BOM.length);
                }
                isFirst = false;
                let pos = 0;
                const length = buf.length;
                while (pos < length) {
                    if (this.discardTrailingNewline) {
                        if (buf[pos] === LINE_FEED_KEY) {
                            pos += 1;
                        }
                        this.discardTrailingNewline = false;
                    }
                    let lineLength = -1;
                    let fieldLength = -1;
                    let char;
                    for (let i = pos; lineLength < 0 && i < length; ++i) {
                        char = buf[i];
                        if (char === COLON_KEY && fieldLength < 0) {
                            fieldLength = i - pos;
                        }
                        else if (char === ENTER_KEY) {
                            this.discardTrailingNewline = true;
                            lineLength = i - pos;
                        }
                        else if (char === LINE_FEED_KEY) {
                            lineLength = i - pos;
                        }
                    }
                    if (lineLength < 0) {
                        break;
                    }
                    this.parseEventStreamLine(buf, pos, fieldLength, lineLength);
                    pos += lineLength + 1;
                }
                if (pos === length) {
                    buf = Buffer.from([]);
                }
                else if (pos > 0) {
                    buf = buf.slice(pos);
                }
            })
                .on('end', () => {
                this.readyState = EventSource.CLOSED;
                setTimeout(() => this.connect(), this.reconnectInterval);
            });
        });
    }
}
EventSource.CONNECTING = 0;
EventSource.OPEN = 1;
EventSource.CLOSED = 2;
exports.EventSource = EventSource;
exports.default = EventSource;
