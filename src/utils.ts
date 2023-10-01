export const isIOS = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

export const setLocal = (name, data) => {
  if (!name) return
  if (typeof data !== 'string') {
    data = JSON.stringify(data)
  }
  window.localStorage.setItem(name, data)
}

export const getLocal = (name) => {
  if (!name) return
  let item = window.localStorage.getItem(name)
  return JSON.parse(item)
}

export const removeLocal = (name) => {
  if (!name) return
  window.localStorage.removeItem(name)
}
