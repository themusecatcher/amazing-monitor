import { parseJSON } from '../utils/index'
export function injectXHR (tracker) {
  const XMLHttpRequest = window.XMLHttpRequest
  const oldOpen = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function (method, url, async) {
    // 把上报接口过滤掉
    if (!url.match(/escalation/) && !url.match(/sockjs/) && !url.match(/.css/)) {
      this.logData = { method, url, async }
    }
    return oldOpen.apply(this, arguments)
  }
  const oldSend = XMLHttpRequest.prototype.send
  XMLHttpRequest.prototype.send = function (body) {
    if (this.logData) {
      const startTime = Date.now()
      const handler = (type) => () => {
        // 持续时间
        const duration = Date.now() - startTime
        const status = this.status
        const statusText = this.statusText
        let apiUrl = this.logData.url
        if (this.logData.url.indexOf('?') > 0) {
          apiUrl = this.logData.url.slice(0, this.logData.url.indexOf('?'))
        }
        const logData = {
          kind: 'stability',
          eventType: type,
          requestUrl: this.logData.url,
          apiUrl: apiUrl,
          status: status + '-' + statusText, // 状态码
          duration,
          params: body || '', // 入参
          response: parseJSON(this.response) // 响应体
        }
        if (status === 200) {
          const contentLength = this.getResponseHeader('Content-Length')
          if (contentLength > 1024 * 1024 * 80) {
            logData.response = ''
          } else {
            logData.response = parseJSON(this.response)
          }
          tracker.info('xhr', logData)
        } else {
          tracker.error('xhr', logData)
        }
      }
      this.addEventListener('load', handler('load'), false)
      this.addEventListener('error', handler('error'), false)
      this.addEventListener('abort', handler('abort'), false)
    }
    return oldSend.apply(this, arguments)
  }
}
