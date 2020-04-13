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

SecureNative Node.JS agent provides application security monitoring and protection from OWASP TOP 10 security threats at run-time through dynamic instrumentation of business logic and user behaviour.

SecureNative monitors and protects applications from common security threats such as:

- Bad bots
- 3rd party packages vulnerabilities
- SQL/NoSQL injections
- XSS attacks
- Massive security scans
- Raise of HTTP errors (40X, 50X)
- Anomaly Usage
- Content Scrapping
- Adaptive Authentication, prevent ATO (Account Takeover)

## Installation

Please create free account at [register](https://console.securenative.com/register) to get api key.

Install SecureNative agent:

```bash
npm i @securenative/agent
```

Verify that `@securenative/agent` appears in your package to your `package.json`.

```shell script
cat > securenative.json <<EOF
{
  "SECURENATIVE_APP_NAME": "YOUR_APPLICATION_NAME",
  "SECURENATIVE_API_KEY": "YOUR_API_KEY"
}
EOF
```

Add SecureNative as first dependency to your main module

```js
require('securenative');
```

## Configuration

| Option                          | Type    | Optional | Default Value                             | Description                                       |
| ------------------------------- | ------- | -------- | ----------------------------------------- | ------------------------------------------------- |
| SECURENATIVE_API_KEY            | string  | false    | none                                      | SecureNative api key                              |
| SECURENATIVE_APP_NAME           | string  | false    | package.json                              | Name of application source                        |
| SECURENATIVE_API_URL            | string  | true     | https://api.securenative.com/v1/collector | Default api base address                          |
| SECURENATIVE_INTERVAL           | number  | true     | 1000                                      | Default interval for SDK to try to persist events |
| SECURENATIVE_HEARTBEAT_INTERVAL | number  | true     | 1000                                      | Default agent hearbeat interval                   |
| SECURENATIVE_MAX_EVENTS         | number  | true     | 1000                                      | Max in-memory events queue                        |
| SECURENATIVE_TIMEOUT            | number  | true     | 1500                                      | API call timeout in ms                            |
| SECURENATIVE_AUTO_SEND          | Boolean | true     | true                                      | Should api auto send the events                   |
| SECURENATIVE_DISABLE            | Boolean | true     | true                                      | Allow to disable agent functionality              |
| SECURENATIVE_DEBUG_MODE         | Boolean | true     | false                                     | Displays debug info to stdout                     |

## Compatibility

This agent is compatible with Node.js 8 and higher.

For other compatibility related information, please visit [the compatibility page](https://docs.securenative.com/nodejs/compatibility/).

## Documentation

For more details, please visit documentation page, available on [docs.securenative.com](https://docs.securenative.com/agent/nodejs).
