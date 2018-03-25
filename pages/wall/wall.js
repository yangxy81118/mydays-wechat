Page({
  data:{
    change:""
  },
  onLoad: function () {
    var that = this
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

            // setTimeout(test, 1500, that)

            // console.log("finish!")
          }
        })
      }
    })
  }
})

function testTime(that){
  that.setData({change:"changed"})
}