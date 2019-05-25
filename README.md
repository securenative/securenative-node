# SecureNative Node SDK

## Installation

Add the `@securenative/sdk` package to your `package.json`.

```bash
npm i @securenative/sdk
```

## Configuration

```js
import { SecureNative } from '@securenative/sdk';

const secureNative = SecureNative({ apiKey: 'YOUR_API_KEY' });
```

| Option | Type | Optional | Default Value | Description |
| -------| -------| -------| -------| -------------------------------------------------|
| apiKey | string | false | none | SecureNative api key |
| apiUrl | string | true | https://api.securenative.com/v1/collector | Default api base address|
| interval| number | true | 1000 | Default interval for SDK to try to persist events|  
| maxEvents | number | true | 1000 | Max in-memory events queue| 
| timeout | number | true | 1500 | API call timeout in ms|
| autoSend | Boolean | true | true | Should api auto send the events|

## Event tracking

```js
import { SecureNative, EventTypes } from '@securenative/sdk';

const secureNative = SecureNative({ apiKey: 'YOUR_API_KEY' });

secureNative.track({
    eventType: EventTypes.LOG_IN,
    ip: '127.0.0.1',
    userAgent: 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405',
    user: {
      id: '12345'
    }
});
```