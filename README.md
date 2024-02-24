# Useful JavaScript utilities


### State Machine
Make implementing state machines less error prone.

```typescript
import { makeStateMachine } from "@lsdsoftware/utils"

const sm = makeStateMachine({
  IDLE: {
    startIt() {
      //do something
      return "BUSY"
    }
  },
  BUSY: {
    stopIt() {
      //stop doing it
      return "IDLE"
    },
    stopAfterDelay() {
      return "STOPPING"
    }
  },
  STOPPING: {
    onTransitionIn(this: any) {
      //do some clean up
      this.timer = setTimeout(() => sm.trigger("onDone"), 3000)
    },
    onDone() {
      return "IDLE"
    },
    stopIt() {
      console.log("Already stopping, be patient!")
      //return void to stay in same state
    },
    forceIt(this: any) {
      clearTimeout(this.timer)
      return "IDLE"
    }
  }
})

sm.trigger("startIt")
sm.getState()   //BUSY
```



### Message Dispatcher
Dispatch messages to handlers.  This utility assumes messages are one of three types: request, response, or notification; and follow a predefined format (see type definition below).

```typescript
interface Request {
  to: string
  type: "request"
  id: "string"
  method: string
  args: Record<string, unknown>
}

interface Notification {
  to: string
  type: "notification"
  method: string
  args: Record<string, unknown>
}

interface Response {
  type: "response"
  id: string
  error: unknown
  result: unknown
}
```

Call `dispatch` to dispatch a message you received.  Requests and notifications are dispatched to request handlers that you provide at construction.  Responses are dispatched to response listeners; to listen for a response, call `waitForResponse` with the request ID.

A _myAddress_ parameter provided at construction is used to filter messages.  Only requests and notifications whose _to_ attribute matches _myAddress_ will be processed.

```typescript
import { makeMessageDispatcher } from "@lsdsoftware/utils"

const requestHandlers = {
  method1({paramA, paramB}, sender) {
    //do something
    return result
  },
  async method2({x, y, z}, sender) {
    //do something
    return result
  }
}

const dispatcher = makeMessageDispatcher("myAddress", requestHandlers)

//sample usage

//processing requests and responses
window.addEventListener("message", event => {
  const sender = {window: event.source, origin: event.origin}
  const sendResponse = response => sender.window.postMessage(response, sender.origin)
  dispatcher.dispatch(event.data, sender, sendResponse)
})

//sending requests
const id = String(Math.random())
const request = {to: "someAddress", type: "request", id, method: "someMethod", args: {}}
iframeWindow.postMessage(request, "*")
dispatcher.waitForResponse(id)
  .then(result => console.log(result))
  .catch(console.error)
```



### Rate Limiter
Basic rate limiter using the token bucket algorithm.

```typescript
import { RateLimiter } from "@lsdsoftware/utils"

const limiter = new RateLimiter({tokensPerInterval: 5, interval: 60*1000})

function handleRequest(userId, req) {
  if (limiter.tryRemoveTokens(userId, 1)) return processRequest(req)
  else throw "Rate limit exceeded"
}
```



### Line Reader
Split text into lines

```typescript
import { makeLineReader } from "@lsdsoftware/utils"

myStream.pipe(makeLineReader(line => console.log(line)))
```
