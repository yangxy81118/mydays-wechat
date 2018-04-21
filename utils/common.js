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
  var userInfo = wx.getStorageSync("userInfo")
  var daysCount = userInfo.daysCount
  var daysLimit = userInfo.limit
  return daysCount >= daysLimit 
}

const daysChange = function(change){
  var userInfo = wx.getStorageSync("userInfo")
  userInfo.daysCount += change 
}

const request = function (obj) {
  wx.request({
    url: 'https://www.yubopet.top/' + obj.url,
    method: obj.method,
    data: obj.data,
    header: obj.header,
    success: obj.callback
  })
}


const graphReq = function (graphObj){
  var obj = {
    url: 'graphql/' + graphObj.module,
    method:'POST',
    header: { 'content-type': 'text/plain' },
    data: graphObj.data,
    callback: graphObj.callback
  }
  request(obj)
}


const replaceEmoji = function(content){
  return unescape(escape(content).replace(/\%uD.{3}/g, ''))
}


module.exports = {
  warning: warning,
  success:success,
  loading: loading,
  checkError: checkError,
  showLastAction: showLastAction,
  checkDaysCount: checkDaysCount,
  daysChange : daysChange,
  request: request,
  graphReq: graphReq,
  replaceEmoji: replaceEmoji 
}
