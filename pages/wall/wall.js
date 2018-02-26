Page({
  onLoad: function () {

    // 登录
    wx.login({
      success: res => {
        console.log(res)
        wx.request({
          url: 'https://www.yubopet.top/login?code='+res.code,
          success: function (loginRes) {
            wx.setStorageSync('userId', loginRes.data)
            wx.redirectTo({
              url:'/pages/home/home'
            })
          }
        })
      }
    })
  }
})