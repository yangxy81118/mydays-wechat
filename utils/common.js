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

const checkError = function(res){
  if(res.statusCode != 200){
    warning("系统故障...")
    return true
  }else{
    return false
  }
  
}

const showLastAction = function(){
  var state = wx.getStorageSync("lastActionState")
  if(!state || state.length == 0)
    return

  var array = state.split(":")
  if(array[0] == "success"){
    wx.showToast({
      title: array[1],
      duration: 8000
    })
  }

  wx.removeStorageSync("lastActionState")
}

const checkDaysCount = function(){
  var daysCount = wx.getStorageSync("daysCount")
  var daysLimit = wx.getStorageSync("daysLimit")
  return daysCount >= daysLimit
}

module.exports = {
  warning: warning,
  success:success,
  loading: loading,
  checkError: checkError,
  showLastAction: showLastAction,
  checkDaysCount: checkDaysCount
}
