//index.js
//获取应用实例
const app = getApp()
var dayId = -1

Page({
  data: {
    appWidth:375,
  },
  onLoad:function(options){
    var that = this
    dayId = options.dayId
    wx.request({
      url: 'https://www.yubopet.top/suggestion/list?dayId='+dayId,
      success:function(res){
        that.setData({
          sugs:res.data
        })
      }
    })

    wx.request({
      url: 'https://www.yubopet.top/days/get?dayId=' + dayId,
      success: function (res) {
        that.setData({
          day: res.data
        })
      }
    })
  }
})