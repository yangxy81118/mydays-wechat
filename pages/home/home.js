
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
    loadDays(that,userId)
    
  },
  editAction:function(e){
    wx.showToast({
      title: '此功能暂未开放',
      image:'/images/warning.png'
    })
  },
  delAction:function(e){

    var dayId = e.currentTarget.dataset.dayid
    var userId = wx.getStorageSync('userId')   
    var that = this

    wx.request({
      url: 'https://www.yubopet.top/customDay?dayId='+dayId,
      method: 'DELETE',
      success: function (res) {
        console.log(res)
        // loadDays(that, userId)
        that.onShow()
        wx.showToast({
          title: '删除成功',
          duration: 1000
        })
      },
      fail: function (res) {
        console.log(res)
        toastWarning('删除失败')
      }
    })
  }
  
   
})

function loadDays(that,userId){
  wx.request({
    url: 'https://www.yubopet.top/graphql/days',
    method: 'POST',
    data: '{days(userId:' + userId + ') { id name year month date remain custom lunar age }}',
    header: {
      'content-type': 'text/plain'
    },
    success: function (res) {
      var daysData = res.data.data.days
      console.log(daysData)
      that.setData({
        days: daysData
      })
    }
  })
}

function toastWarning(content) {
  wx.showToast({
    title: content,
    image: '/images/warning.png',
    duration: 2000
  })
}

