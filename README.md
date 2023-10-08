# Amazing Monitor

日志监控库

## 安装

```bash
pnpm i amazing-monitor user-agent
# or
npm install amazing-monitor user-agent
# or
yarn add amazing-monitor user-agent
```

## 创建实例

- 创建 `src/monitor.js`

```js
import Monitor from 'amazing-monitor'
const userAgent = require('user-agent')
var apiUrl
const host = window.location.host
if (host === 'www.test.cn') { // 测试域名
  apiUrl = 'https://www.monitor.cn/log/api'
}
if (host === 'www.prod.com') { // 生产域名
  apiUrl = 'https://www.monitor.com/log/api'
}
function createMonitor () {
  return new Monitor({
    logLevel: 'info',
    url: apiUrl,
    commonParams: {
      platformName: 'project-name',
      ua: userAgent.parse(navigator.userAgent).full,
      domain: document.domain,
      sessionId: ''
    }
  })
}
const monitor = createMonitor()

export function setCommonParams () {
  // 获取 token
  const token = someData.get('token')
  if (token) {
    const { sessionId } = monitor.getCommonParams()
    // 只有发生改变时候才会设置
    if (sessionId !== token) {
      const commonParams = {
        sessionId: token
      }
      monitor.setCommonParams(commonParams)
    }
  }
}
export default monitor
```

- 创建 `monitorInit.js`

```js
import { injectJsError, injectXHR, blankScreen, timing, pv, longTask } from 'amazing-monitor/lib/control'
import monitor from './monitor'
injectJsError(monitor)
injectXHR(monitor)
pv(monitor)
blankScreen(monitor)
timing(monitor)
longTask(monitor)
```

## 引入并使用

在 `main.js` 中引入

```js
import './monitorInit' // global monitor
```

在 `router/index.js` 中全局设置

```js
import { setCommonParams } from './monitor'

router.beforeEach((to, from, next) => {
  // 获取 token
  const token = someData.get('token')
  if (token) {
    setCommonParams()
  }
})
```
