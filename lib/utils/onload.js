export default function (callback) {
  if (document.readyState === 'complete') {
    callback && callback()
  } else {
    window.addEventListener('load', callback)
  }
}
