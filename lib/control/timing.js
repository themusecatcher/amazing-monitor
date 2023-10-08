import onload from '../utils/onload'
import getLastEvent from '../utils/getLastEvent'
import getSelector from '../utils/getSelector'
import { formatTime } from '../utils/formatTime'
export function timing (tracker) {
  let FMP, LCP
  // 增加一个性能条目的观察者
  new PerformanceObserver((entryList, observer) => {
    const perfEntries = entryList.getEntries()
    FMP = perfEntries[0]
    observer.disconnect() // 不再观察了
  }).observe({ entryTypes: ['element'] }) // 观察页面中有意义的元素
  // 增加一个性能条目的观察者
  new PerformanceObserver((entryList, observer) => {
    const perfEntries = entryList.getEntries()
    const lastEntry = perfEntries[perfEntries.length - 1]
    LCP = lastEntry
    observer.disconnect() // 不再观察了
  }).observe({ entryTypes: ['largest-contentful-paint'] }) // 观察页面中最大的元素
  // 增加一个性能条目的观察者
  new PerformanceObserver((entryList, observer) => {
    const lastEvent = getLastEvent()
    const firstInput = entryList.getEntries()[0]
    if (firstInput) {
      // 开始处理的时间 - 开始点击的时间，差值就是处理的延迟
      const inputDelay = firstInput.processingStart - firstInput.startTime
      const duration = firstInput.duration // 处理的耗时
      if (inputDelay > 0 || duration > 0) {
        tracker.info('firstInputDelay', {
          kind: 'experience', // 用户体验指标
          inputDelay: inputDelay ? formatTime(inputDelay) : 0, // 延迟的时间
          duration: duration ? formatTime(duration) : 0,
          startTime: firstInput.startTime, // 开始处理的时间
          selector: lastEvent ? getSelector(lastEvent.path || lastEvent.target) : ''
        })
      }
    }
    observer.disconnect() // 不再观察了
  }).observe({ type: 'first-input', buffered: true }) // 第一次交互

  // | FP  | First Paint(首次绘制)                    | 包括了任何用户自定义的背景绘制，它是首先将像素绘制到屏幕的时刻
  // | FCP | First Content Paint(首次内容绘制)         | 是浏览器将第一个 DOM 渲染到屏幕的时间,可能是文本、图像、SVG等,这其实就是白屏时间
  // | FMP | First Meaningful Paint(首次有意义绘制)    | 页面有意义的内容渲染的时间
  // | LCP | (Largest Contentful Paint)(最大内容渲染)  | 代表在viewport中最大的页面元素加载的时间
  // | DCL | (DomContentLoaded)(DOM加载完成)          | 当 HTML 文档被完全加载和解析完成之后, DOMContentLoaded事件被触发，无需等待样式表、图像和子框架的完成加载
  // | L   | (onLoad)                                | 当依赖的资源全部加载完毕之后才会触发
  // | TTI | (Time to Interactive) 可交互时间          | 用于标记应用已进行视觉渲染并能可靠响应用户输入的时间点
  // | FID | First Input Delay(首次输入延迟)           | 用户首次和页面交互(单击链接，点击按钮等)到页面响应交互的时间

  // 刚开始页面内容为空，等页面渲染完成，再去做判断
  onload(function () {
    setTimeout(() => {
      const {
        fetchStart,
        connectStart,
        connectEnd,
        requestStart,
        responseStart,
        responseEnd,
        domLoading,
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        loadEventStart
      } = window.performance.timing
      // 发送时间指标
      // type: 'timing', // 统计每个阶段的时间
      tracker.info('timing', {
        kind: 'experience', // 用户体验指标
        connectTime: connectEnd - connectStart, // TCP连接耗时
        ttfbTime: responseStart - requestStart, // 首字节到达时间
        responseTime: responseEnd - responseStart, // response响应耗时
        parseDOMTime: loadEventStart - domLoading, // DOM解析渲染的时间
        domContentLoadedTime: domContentLoadedEventEnd - domContentLoadedEventStart, // DOMContentLoaded事件回调耗时
        timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
        loadTime: loadEventStart - fetchStart // 完整的加载时间
      })
      // 发送性能指标
      // console.log(performance)
      const FP = performance.getEntriesByName('first-paint')[0]
      const FCP = performance.getEntriesByName('first-contentful-paint')[0]
      tracker.info('paint', {
        kind: 'experience',
        type: 'paint',
        firstPaint: FP ? formatTime(FP.startTime) : 0,
        firstContentPaint: FCP ? formatTime(FCP.startTime) : 0,
        firstMeaningfulPaint: FMP ? formatTime(FMP.startTime) : 0,
        largestContentfulPaint: LCP ? formatTime(LCP.renderTime || LCP.loadTime) : 0
      })
    }, 3000)
  })
}
