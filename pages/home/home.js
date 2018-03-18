
//获取应用实例
const app = getApp()
var startTouchX = 0;
var MAX_IDX = 0;
var curIdx = 1;
var windowHeight = 0;

Page({
  data: {
    appWidth:375,
    listHeight:0,
  },
  onShareAppMessage: function(options){
    console.log(options)
  },
  onShow: function () {
    console.log('onLoad!!!')
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        windowHeight = res.windowHeight;
        that.setData({
          appWidth: res.windowWidth,
          listHeight: res.windowHeight-80
        })
        if (res.model.indexOf("iPhone") >= 0){
          that.setData({
            isApple: true
          })
        }
      }
    })

    var userId =  wx.getStorageSync('userId')   

    wx.request({
      url: 'https://www.yubopet.top/graphql/days',
      method: 'POST',
      data: '{days(userId:'+userId+') { id name year month date remain custom lunar age }}',
      header: {
        'content-type': 'text/plain'
      },
      success: function (res) {
        console.log(res)
        var daysData = res.data.data.days
        MAX_IDX = daysData.length;
        console.log(daysData)
        that.setData({
          days: daysData,
          curDay: daysData[0]
        })

      }
    })
  }
  
   
})
