import axios from 'axios'
import { merge, cloneDeep } from 'lodash-es'
import { formatDateMs } from './utils/formatTime'
import { debounce } from './utils/index'

const LEVEL_ARR = ['debug', 'info', 'warn', 'error']
export class Monitor {
  constructor ({ logLevel = 'info', url, commonParams = {} } = {}) {
    // 日志等级
    this.level = logLevel
    // 公参
    this.commonParams = merge(commonParams || {})
    // 上报的路径
    this.url = url
    this.logs = []
    this.http = axios.create({
      withCredentials: false,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
  }
  /**
   * 设置公参
   * @param {commonParams} commonParams - 公参，value为基本类型、函数类型、异步函数类型
   */
  setCommonParams (commonParams) {
    this.commonParams = merge(this.commonParams || {}, commonParams)
  }
  // 获取已经设置的公参数
  getCommonParams () {
    return {...this.commonParams }
  }
  /**
   * 日志记录
   * @private
   * @param {string} level - 日志等级
   * @param {log_args} arr - 参数数组
   */
  logging (level, arr) {
    try {
      const isAdaptLogLevelConfig = LEVEL_ARR.indexOf(this.level) <= LEVEL_ARR.indexOf(level) // 适配日志上报级别

      if (isAdaptLogLevelConfig) {
        // 生成日志
        const { name, logContent, options } = this.getCleanParams(arr)
        const timestamp = Date.now()
        const clientTime = formatDateMs(Date.now(), 1)
        const commonParams = { ...this.commonParams, name, level, timestamp, clientTime }
        const extraData = {
          title: document.title,
          url: location.href
        }
        const logs = { ...commonParams, ...extraData, content: logContent }
        // 存储日志
        this.logs.push(logs)
        // 检查上报条件进行上报
        const isErrorLog = level === 'error'
        const isImmediately = options.isImmediately
        if (isErrorLog || isImmediately) {
          this.send()
        } else {
          this.delaySend()
        }
      } else {
        return Promise.resolve(true)
      }
    } catch (err) {
      throw new Error(err)
    }
  }
  /**
   * 获取干净的API参数
   * @private
   * @param {log_args} args - 参数数组
   */
  getCleanParams (args) {
    // eslint-disable-next-line prefer-const
    let [name, logContent = {}, options = {}] = args
    if (!(logContent instanceof Object)) {
      return { name, logContent: { desc: logContent }, options }
    } else {
      try {
        logContent = cloneDeep(logContent) // 对日志主体进行深拷贝
      } catch (err) {
        console.log('deep copy error', err.message)
      }
      return { name, logContent, options }
    }
  }
  delaySend () {
    debounce(() => {
      this.send()
    }, 5000)
    // throttle(() => {
    //   this.send()
    // }, 5000)
  }
  debug (...rest) {
    return this.logging('debug', rest)
  }
  info (...rest) {
    return this.logging('info', rest)
  }
  warn (...rest) {
    return this.logging('warn', rest)
  }
  error (...rest) {
    return this.logging('error', rest)
  }
  async send () {
    if (this.logs && this.logs.length > 0) {
      const logs = [...this.logs]
      this.logs = []
      try {
        // 上报日志服务器
        if (this.url) { // 本地开发url为空时，不上报
          const out = await this.http.post(this.url, JSON.stringify(logs))
          return out
        }Monitor
      } catch (err) {
        // 上传失败，将日志再存到内存中
        // this.logs = _.concat(this.logs, logs)
        console.log(err)
      }
    }
  }
}
