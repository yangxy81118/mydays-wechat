//app.js

App({
  onLaunch: function () {

    console.log("appLaunch")

    //重置数据
    wx.setStorageSync('RESET_OPEN_HOME', true)


    // 登录
    wx.login({
      success: res => {
        console.log(res)
        wx.request({
          url: 'https://www.yubopet.top/login?code=' + res.code,
          success: function (loginRes) {
            wx.setStorageSync('userId', loginRes.data)
            initUserBaseData(loginRes.data)
          }
        })
      }
    })

    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //     console.log(res)
    //     wx.request({
    //       url: 'https://www.yubopet.top/login?code='+res.code,
    //       success: function (loginRes) {
    //         wx.setStorageSync('userId', loginRes.data)
    //       }
    //     })
    //   }
    // })
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
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
      wx.setStorageSync("daysLimit", u.limit)
      wx.setStorageSync("daysCount", u.daysCount)
      console.log("limit:" + u.limit + ",count:" + u.daysCount)
    }
  });
}