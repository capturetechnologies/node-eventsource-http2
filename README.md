# node-eventsource-http2

## why
Eventsource nodejs client https://github.com/EventSource/eventsource
doesn't support http/2.

This package fixes it build on top of `http2`, so it fully supports it

## install
```
npm install node-eventsource-http2
```

## usage

**[Spec](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)**
```js
const EventSource = require('node-eventsource')
const sse = new EventSource('your.endpoint/sse');
sse.addEventListener('type', (event) => {
  // your code goes here
})
```

