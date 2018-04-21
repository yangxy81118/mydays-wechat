//app.js

App({
  onLaunch: function () {

    console.log("appLaunch")

    //重置数据
    wx.setStorageSync('RESET_OPEN_HOME', true)

    // 登录
    if(!wx.getStorageSync("userId")){
      wx.login({
        success: res => {
          console.log(res)
          wx.request({
            url: 'https://www.yubopet.top/login?code=' + res.code,
            success: function (loginRes) {
              wx.setStorageSync('userId', loginRes.data)
            }
          })
        }
      })
    }else{
      initUserBaseData(wx.getStorageSync("userId"))

      //TODO 异步更新用户最近登陆时间


    }

  },
  globalData: {
    userInfo: null
  }
})


function initUserBaseData(userId) {

  //查询额度信息
  var userId = wx.getStorageSync('userId')
  wx.request({
    url: 'https://www.yubopet.top/graphql/days',
    method: 'POST',
    data: '{user(userId:' + userId + '){limit daysCount nickName avatarUrl} }',
    header: {
      'content-type': 'text/plain'
    },
    success: function (res) {

      var u = res.data.data.user
      wx.setStorageSync('userInfo', u)
      // wx.setStorageSync("daysLimit", u.limit)
      // wx.setStorageSync("daysCount", u.daysCount)
      console.log("limit:" + u.limit + ",count:" + u.daysCount)
    }
  });
}