//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    appWidth:375,
  },
  onLoad: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          appWidth: res.windowWidth
        })  
      }
    })

    var userId = wx.getStorageSync('userId') 

    wx.request({
      url: 'https://www.yubopet.top/graphql/days',
      method: 'POST',
      data: '{days(userId:' + userId + ') { id name year month date custom}}',
      header: {
        'content-type': 'text/plain'
      },
      success: function (res) {
        that.setData({
          days:res.data.data.days
        })
      }
    })
  }
})