//index.js
//获取应用实例
const app = getApp()
var dayId = 8

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
      url: 'https://www.yubopet.top/graphql/days',
      method: 'POST',
      data: '{day(dayId:' + dayId + ') { id name year month date image remain custom engName }}',
      header: {
        'content-type': 'text/plain'
      },
      success: function (res) {
        console.log(res)
        that.setData({
          day: res.data.data.day
        })
      }
    })
  }
})