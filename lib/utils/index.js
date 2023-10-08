export function debounce (fn, delay = 500) {
  let timer = null
  if (timer) clearTimeout(timer)
  timer = setTimeout(function () {
    fn && fn()
  }, delay)
}
export function throttle (fn, delay = 500) {
  let timer = null
  if (timer) return
  timer = setTimeout(() => {
    fn && fn()
    timer = null
  }, delay)
}

//判断是不是json对象或者json字符串，如果是转换为json对象返回，否则返回null
export function parseJSON(value) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value); // 尝试解析 JSON 字符串为对象
    } catch (e) {
      return null; // 解析失败，返回空
    }
  } else if (typeof value === "object" && value !== null) {
    try {
      return JSON.parse(JSON.stringify(value)); // 尝试将对象转换为 JSON 字符串再解析为对象
    } catch (e) {
      return null; // 转换或解析失败，返回空
    }
  } else {
    return null; // 非字符串和对象，返回空
  }
}
