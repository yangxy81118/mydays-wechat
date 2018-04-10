const commonTool = require("../../utils/common.js")

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
            initUserBaseData(loginRes.data)
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

function initUserBaseData(userId){

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
      if (commonTool.checkError(res)) return
      var u = res.data.data.user
      wx.setStorageSync('userInfo', u)
      wx.setStorageSync("daysLimit", u.limit)
      wx.setStorageSync("daysCount", u.daysCount)
      console.log("limit:"+u.limit+",count:"+u.daysCount)

      wx.redirectTo({
        url: '/pages/home/home'
      })
    }
  });
}