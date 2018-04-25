//app.js

App({
  globalData: {
    host: "https://www.yubopet.top"
    // host: "http://139.199.73.105"
  },
  onLaunch: function () {

    var that = this

    //重置数据
    wx.setStorageSync('RESET_OPEN_HOME', true)
    // wx.removeStorageSync('token')

    var userId = wx.getStorageSync("userId")
    var token = wx.getStorageSync("token")

    console.log("app:[" + userId+"],["+token+"]")

    if(userId > 0 && token.length > 0){
      initUserBaseData(userId,that)
    }else{
      // 登录
      wx.login({
        success: res => {
          console.log(res)
          wx.request({
            url: that.globalData.host + '/login?code=' + res.code,
            success: function (loginRes) {
              wx.setStorageSync('userId', loginRes.data.userId)
              wx.setStorageSync('token', loginRes.data.token)
              console.log('app获取到用户data:' + wx.getStorageSync('userId') + "," + wx.getStorageSync('token'))
              initUserBaseData(wx.getStorageSync('userId'),that)
            }
          })
        }
      })
    }
  }
})


function initUserBaseData(userId,app) {

  //查询额度信息
  var userId = wx.getStorageSync('userId')
  var token = wx.getStorageSync('token')
  wx.request({
    url: app.globalData.host + '/graphql/days?token=' + token,
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