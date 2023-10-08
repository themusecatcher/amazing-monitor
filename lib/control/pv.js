
export function pv (tracker) {
  const connection = navigator.connection || ''
  tracker.info('init', {
    kind: 'business',
    effectiveType: connection.effectiveType, // 网络环境
    rtt: connection.rtt, // 往返时间
    screen: `${window.screen.width}x${window.screen.height}` // 设备分辨率
  })
  const startTime = Date.now()
  window.addEventListener(
    'unload',
    () => {
      const stayTime = Date.now() - startTime
      tracker.info('stayTime', {
        kind: 'business',
        stayTime
      })
    },
    false
  )
  const bindEventListener = function (type) {
    const history = window.history
    const historyEvent = history[type]
    return function () {
      const newEvent = historyEvent.apply(this, arguments)
      const e = new Event(type)
      e.arguments = { ...arguments }
      // e.type = type
      window.dispatchEvent(e)
      return newEvent
    }
  }
  history.pushState = bindEventListener('pushState')
  history.replaceState = bindEventListener('replaceState')
  let tempHref = ''
  const historyFn = async (e) => {
    const currentHref = e.currentTarget.location.href
    if (tempHref === currentHref) {
      return false
    } else {
      tempHref = currentHref
    }
    // const isImmediately = e.type === 'pushState'
    tracker.info('page', {
      kind: 'business',
      currentHref: tempHref,
      type: e.type
    })
  }
  window.addEventListener('replaceState', historyFn)
  window.addEventListener('pushState', historyFn)
  document.addEventListener('visibilitychange', () => {
    const stayTime = Date.now() - startTime
    const documentHidden = document.hidden
    tracker.info('visibilitychange', {
      kind: 'business',
      stayTime,
      documentHidden
    })
  })
}
