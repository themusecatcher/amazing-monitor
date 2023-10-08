export function formatTime (time) {
  if (typeof time !== 'number') {
    return
  }
  // 毫秒转换成秒 返回
  if (time > 1000) {
    return (time / 1000).toFixed(2) + 's'
  }
  // 默认返回毫秒
  return Math.round(time) + 'ms'
}
// 时间补0
export function toDouble (iNum) {
  return iNum < 10 ? '0' + iNum : iNum
}
/*
 * 时间戳格式化成日期格式
 */
export function formatDateMs (num, type) {
  if (typeof num !== 'number') {
    return '--'
  }
  const d = new Date(num)
  const fullYear = d.getFullYear()
  const month = toDouble(d.getMonth() + 1)
  const date = toDouble(d.getDate())
  const hour = toDouble(d.getHours())
  const minute = toDouble(d.getMinutes())
  const second = toDouble(d.getSeconds())
  switch (type) {
    case 1:
      return fullYear + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second
    case 2:
      return fullYear + '-' + month + '-' + date
  }
}
