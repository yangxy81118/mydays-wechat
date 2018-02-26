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
    wx.request({
      url: 'https://www.yubopet.top/days/list?userId=1',
      success: function(res) {
        that.setData({
          days:res.data
        })
      }
    })
  }
})