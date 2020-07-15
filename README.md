<p align="center">
  <a href="https://www.securenative.com"><img src="https://user-images.githubusercontent.com/45174009/77826512-f023ed80-7120-11ea-80e0-58aacde0a84e.png" alt="SecureNative Logo"/></a>
</p>

<p align="center">
  <b>A Cloud-Native Security Monitoring and Protection for Modern Applications</b>
</p>
<p align="center">
  <a href="https://github.com/securenative/securenative-node">
    <img alt="Github Actions" src="https://github.com/securenative/securenative-node/workflows/Build/badge.svg">
  </a>
  <a href="https://codecov.io/gh/securenative/securenative-node">
    <img src="https://codecov.io/gh/securenative/securenative-node/branch/master/graph/badge.svg" />
  </a>
  <a href="https://badge.fury.io/js/%40securenative%2Fsdk">
    <img src="https://badge.fury.io/js/%40securenative%2Fsdk.svg" alt="npm version" height="20">
  </a>
  <a href="https://github.com/semantic-release/semantic-release">
    <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="npm version">
  </a>
</p>
<p align="center">
  <a href="https://docs.securenative.com">Documentation</a> |
  <a href="https://docs.securenative.com/quick-start">Quick Start</a> |
  <a href="https://blog.securenative.com">Blog</a> |
  <a href="">Chat with us on Slack!</a>
</p>
<hr/>

[SecureNative](https://www.securenative.com/) performs user monitoring by analyzing user interactions with your application and various factors such as network, devices, locations and access patterns to stop and prevent account takeover attacks.

## Install the SDK

Navigate to your application project folder and enter:

```bash
npm i @securenative/sdk
```

Verify that `@securenative/sdk` appears in your package to your `package.json`.

## Initialize the SDK

To get your *API KEY*, login to your SecureNative account and go to project settings page:

```js
import { SecureNative, EventTypes } from "@securenative/sdk";
or;
const { SecureNative, EventTypes } = require("@securenative/sdk"); // if your using ES5
``` 

### Option 1: Initialize via Config file
SecureNative can automatically load your config from *securenative.json* that you can add to your application folder.

```shell script
cat > securenative.json <<EOF
{
  "SECURENATIVE_APP_NAME": "YOUR_APPLICATION_NAME",
  "SECURENATIVE_API_KEY": "YOUR_API_KEY"
}
EOF
```

### Option 2: Initialize via config options

```java
SecureNative.init({ apiKey: "Your API_KEY" });
```

## Getting SecureNative instance
Once initialized, sdk will create a singleton instance which you can get: 
```java
const secureNative = SecureNative.getInstance();
```

## Tracking events

Once the SDK has been initialized, tracking requests sent through the SDK
instance. Make sure you build event with the EventBuilder:


```js
import { SecureNative, EventTypes, contextFromRequest } from "@securenative/sdk";

secureNative.track({
  event: EventTypes.LOG_IN,
  userId: '1234',
  userTraits: {
    name: 'Your Name',
    email: 'name@gmail.com',
    phone: '+1234567890'
  },
  context: contextFromRequest(req)
});
``` 

If you don't have acess to request object you can construct the context manually:

```js
secureNative.track({
  event: EventTypes.LOG_IN,
  userId: '1234',
  userTraits: {
    name: 'Your Name',
    email: 'name@gmail.com',
    phone: '+1234567890'
  },
  context: {
    ip: '10.0.0.0',
    clientToken: 'Token from client',
    headers: {
      "user-agent": 'Mozilla/5.0 (iPad; U; CPU OS 3_2_1 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Mobile/7B405"'
    }
  }
});
``` 

## Verify events
```js

  const verifyResult = await secureNative.verify({
    event: EventTypes.LOG_IN,
    userId: '1234',
    userTraits: {
      name: 'Your Name',
      email: 'name@gmail.com',
      phone: '+1234567890'
    },
    context: contextFromRequest(req)
  })

  verifyResult.riskLevel // Low, Medium, High
  verifyResult.score  // Risk score: 0 -1 (0 - Very Low, 1 - Very High)
  verifyResult.triggers // ["TOR", "New IP", "New City"]
}
```

## Configuration

| Option                          | Type    | Optional | Default Value                             | Description                                       |
| ------------------------------- | ------- | -------- | ----------------------------------------- | ------------------------------------------------- |
| SECURENATIVE_API_KEY            | string  | false    | none                                      | SecureNative api key                              |
| SECURENATIVE_APP_NAME           | string  | false    | package.json                              | Name of application source                        |
| SECURENATIVE_API_URL            | string  | true     | https://api.securenative.com/v1/collector | Default api base address                          |
| SECURENATIVE_INTERVAL           | number  | true     | 1000                                      | Default interval for SDK to try to persist events |                |
| SECURENATIVE_MAX_EVENTS         | number  | true     | 1000                                      | Max in-memory events queue                        |
| SECURENATIVE_TIMEOUT            | number  | true     | 1500                                      | API call timeout in ms                            |
| SECURENATIVE_AUTO_SEND          | Boolean | true     | true                                      | Should api auto send the events                   |
| SECURENATIVE_DISABLE            | Boolean | true     | true                                      | Allow to disable agent functionality              |
| SECURENATIVE_LOG_LEVEL          | string | true     | fatal                                     | Displays debug info to stdout                     |

## Compatibility

This agent is compatible with Node.js 8 and higher.

For other compatibility related information, please visit [the compatibility page](https://docs.securenative.com/nodejs/compatibility/).

## Documentation

For more details, please visit documentation page, available on [docs.securenative.com](https://docs.securenative.com/agent/nodejs).
