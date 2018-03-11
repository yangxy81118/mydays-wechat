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
      url: 'https://www.yubopet.top/graphql/days',
      method: 'POST',
      data: '{day(dayId:' + dayId + ') { id name year month date image remain custom engName brief suggestions { content } }}',
      header: {
        'content-type': 'text/plain'
      },
      success: function (res) {

        var dayData = res.data.data.day
        console.log(dayData)
        that.setData({
          day: dayData,
          sugs: dayData.suggestions
        })
      }
    })
  }
})