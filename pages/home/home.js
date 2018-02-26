//index.js
//获取应用实例
const app = getApp()
var startTouchX = 0;
var MAX_IDX = 0;
var curIdx = 1;
var windowHeight = 0;

Page({
  data: {
    appWidth:375,
    toView:'day-1',
    largeBk:'',
    scrollOffset:0,
    isApple:false,
  },
  onLoad: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        windowHeight = res.windowHeight;
        that.setData({
          appWidth: res.windowWidth
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
      url: 'https://www.yubopet.top/days/list?userId=' + userId,
      success: function(res) {
        console.log(res.data)
        MAX_IDX = res.data.length;
        that.setData({
          days:res.data,
          curDay:res.data[0],
          largeBk: res.data[0].image
        })
        
      }
    })
  },
  touchstart: function (e) {
    startTouchX = e.changedTouches[0].pageX;
  },
  touchend:function(e){
    var endTouchX = e.changedTouches[0].pageX;
    if (startTouchX - endTouchX > 0){
      if (startTouchX - endTouchX > 50) {
        nextDay(this)
      } 
    }
   
    if (endTouchX - startTouchX > 0) {
      if (endTouchX - startTouchX > 50) {
        prevDay(this)
      } 
    }
  },

  toNext:function(e){
    nextDay(this)
  },
  toPrev: function (e) {
    prevDay(this)
  },
  bkLoad:function(e) {
    //获取图片实际比例
    var rate = e.detail.width / e.detail.height;
    console.log(rate)
    this.setData({
      bkHeight: windowHeight,
      bkWidth: windowHeight*rate
    })
  }
   
})

function nextDay(app){
  if (curIdx >= MAX_IDX) {
    curIdx = MAX_IDX;
  } else {
    curIdx = curIdx + 1;
  }

  var newDay = app.data.days[curIdx - 1]
  var newBk = app.data.days[curIdx - 1].image;
  app.setData({
    curDay: newDay,
    largeBk: newBk
  });

  var width = app.data.appWidth
  app.setData({
    scrollOffset: width*(curIdx-1)
  })
    
}

function prevDay(app) {
  if (curIdx <= 1) {
    curIdx = 1;
  } else {
    curIdx = curIdx - 1;
  }

  var newDay = app.data.days[curIdx - 1]
  var newBk = app.data.days[curIdx - 1].image;
  app.setData({
    curDay: newDay,
    largeBk: newBk
  });

  var width = app.data.appWidth
  app.setData({
    scrollOffset: width * (curIdx - 1)
  })
}