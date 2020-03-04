# SecureNative Node Agent

## Installation

Add the `@securenative/agent` package to your `package.json`.

```bash
npm i @securenative/agent
```

## Configuration

```js
require('@securenative/agent');
```

| Option | Type | Optional | Default Value | Description |
| -------| -------| -------| -------| -------------------------------------------------|
| SECURENATIVE_API_KEY | string | false | none | SecureNative api key |
| SECURENATIVE_APP_NAME | string | false | package.json | Name of application source |
| SECURENATIVE_API_URL | string | true | https://api.securenative.com/v1/collector | Default api base address|
| SECURENATIVE_INTERVAL| number | true | 1000 | Default interval for SDK to try to persist events|
| SECURENATIVE_HEARTBEAT_INTERVAL| number | true | 1000 | Default agent hearbeat interval|    
| SECURENATIVE_MAX_EVENTS | number | true | 1000 | Max in-memory events queue| 
| SECURENATIVE_TIMEOUT | number | true | 1500 | API call timeout in ms|
| SECURENATIVE_AUTO_SEND | Boolean | true | true | Should api auto send the events|
| SECURENATIVE_DISABLE | Boolean | true | true | Allow to disable agent functionality |
| SECURENATIVE_DEBUG_MODE | Boolean | true | false | Displays debug info to stdout |

## Manual Event tracking

```js
const { secureNative, EventTypes } = require('@securenative/agent');

secureNative.track({
    eventType: EventTypes.LOG_IN,
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405',
    user: {
      id: '12345'
    }
}, req);
```

## WebHook

Use ```verifyWebhook``` middleware to ensure that webhook is comming from SecureNative

```js
app.post("/securewebhook", securenative.middleware.verifyWebhook, (req, res) => {

}
```
