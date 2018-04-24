//app.js

App({
  onLaunch: function () {

    console.log("appLaunch")

    //重置数据
    wx.setStorageSync('RESET_OPEN_HOME', true)
    // wx.removeStorageSync('token')

    var userId = wx.getStorageSync("userId")
    var token = wx.getStorageSync("token")

    console.log("app:[" + userId+"],["+token+"]")

    if(userId > 0 && token.length > 0){
      initUserBaseData(userId)
    }else{
      // 登录
      wx.login({
        success: res => {
          console.log(res)
          wx.request({
            url: 'https://www.yubopet.top/login?code=' + res.code,
            success: function (loginRes) {
              wx.setStorageSync('userId', loginRes.data.userId)
              wx.setStorageSync('token', loginRes.data.token)
              console.log('app获取到用户data:' + wx.getStorageSync('userId') + "," + wx.getStorageSync('token'))
              initUserBaseData(wx.getStorageSync('userId'))
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null
  }
})


function initUserBaseData(userId) {

  //查询额度信息
  var userId = wx.getStorageSync('userId')
  var token = wx.getStorageSync('token')
  wx.request({
    url: 'https://www.yubopet.top/graphql/days?token=' + token,
    method: 'POST',
    data: '{user(userId:' + userId + '){limit daysCount nickName avatarUrl} }',
    header: {
      'content-type': 'text/plain'
    },
    success: function (res) {

      var u = res.data.data.user
      wx.setStorageSync('userInfo', u)
      console.log("limit:" + u.limit + ",count:" + u.daysCount)
    }
  });
}