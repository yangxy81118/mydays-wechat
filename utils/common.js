const warning = function(content) {
  wx.showToast({
    title: content,
    image: '/images/warning.png',
    duration: 2000
  })
}

const success = function(content) {
  wx.showToast({
    title: content,
    duration: 2000
  })
}

const loading = function (content) {
  wx.showToast({
    title: content,
    image:'loading',
    duration: 2000
  })
}

module.exports = {
  warning: warning,
  success:success,
  loading: loading
}
