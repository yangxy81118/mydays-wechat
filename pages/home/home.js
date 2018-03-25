//获取应用实例
var windowHeight = 0
var favor = false

const commonTool = require("../../utils/common.js")

Page({
  data: {
    listHeight:0,
    navAllClass:"selected",
    navFavorClass:"",
    maskClass:"",
    layoutBtnClass:"icon-all",
    layout:1,
    modelShow:"none"
  },
  // onShareAppMessage: function(options){
  //   console.log(options)
  // },
  onShow: function () {
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        console.log(res.windowWidth)
        console.log(res.windowHeight)
        windowHeight = res.windowHeight;
        that.setData({
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

    this.setData({ maskClass:""})
    
  },
  layoutAction:function(e){
    if(this.data.layout==1){
      this.setData({
        layoutBtnClass: "icon-liebiao",
        layout:2
      })
    }else{
      this.setData({
        layoutBtnClass: "icon-all",
        layout: 1
      })
    }
    
  },
  listNavAction:function(e){
    favor = Boolean(e.currentTarget.dataset.favor)

    //还要检查无效操作 
    if(favor){
      this.setData({
        navAllClass: "",
        navFavorClass: "selected"
      })
    }else{
      this.setData({
        navAllClass: "selected",
        navFavorClass: ""
      })
    }

    var userId = wx.getStorageSync('userId')   
    loadDays(this, userId)
  },
  editAction:function(e){
    commonTool.warning('编辑暂未开放')
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
        commonTool.success('删除成功')
      },
      fail: function (res) {
        console.log(res)
        commonTool.warning('删除失败')
      }
    })
  },
  popupAction:function(e){
    var dayId = e.currentTarget.dataset.dayid

    //优化体验
    this.setData({
      popUpDay:{
        name:"...",
        age:"...",
        favor:false,
        remain:"..."
      },
      modelShow: "block"
    })

    var that = this
    wx.request({
      url: 'https://www.yubopet.top/graphql/days',
      method: 'POST',
      data: '{day(dayId:' + dayId + ') { id name year month date remain custom lunar age favor }}',
      header: {
        'content-type': 'text/plain'
      },
      success: function (res) {
        var dayData = res.data.data.day
        that.setData({
          popUpDay: dayData
        })
      }
    })
  },
  quitModel:function(e){
    this.setData({ modelShow: "none"})
  }


})

function loadDays(that,userId){
  wx.request({
    url: 'https://www.yubopet.top/graphql/days',
    method: 'POST',
    data: '{days(userId:' + userId + ',favor:' + favor + ') { id name year month date remain custom lunar age favor }}',
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

