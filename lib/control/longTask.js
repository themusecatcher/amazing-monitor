import { formatTime } from '../utils/formatTime'
import getLastEvent from '../utils/getLastEvent'
import getSelector from '../utils/getSelector'

export function longTask (tracker) {
  new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      if (entry.duration > 100) {
        const lastEvent = getLastEvent()
        if (lastEvent) {
          requestIdleCallback(() => {
            tracker.info('longTask', {
              kind: 'experience',
              eventType: lastEvent.type,
              startTime: formatTime(entry.startTime), // 开始时间
              duration: formatTime(entry.duration), // 持续时间
              selector: lastEvent ? getSelector(lastEvent.path || lastEvent.target) : ''
            })
          })
        }
      }
    })
  }).observe({ entryTypes: ['longtask'] })
}
