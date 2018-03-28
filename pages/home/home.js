//获取应用实例
var windowHeight = 0
var favor = false

const commonTool = require("../../utils/common.js")

Page({
  data: {
    listHeight:0,
    navAllClass:"selected",
    navFavorClass:"",
    layoutBtnClass:"icon-liebiao",
    layout:2,
    modelShow:"none",
    queryFavor:false
  },
  // onShareAppMessage: funeditActionction(options){
  //   console.log(options)
  // },
  onShow: function (option) {

    //清空一些可能的多余状态
    this.setData({
      modelShow: "none",
      newId:0
    })

    var that = this
    wx.getSystemInfo({
      success: function (res) {
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

    //如果navigateBack能够带参数，就不需要这么绕了
    var newDayId = wx.getStorageSync('newDayId')   
    console.log("home页获取：" + newDayId)
    if(newDayId){
      this.setData({ newId: newDayId})
      wx.removeStorageSync('newDayId')
    }
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
        navFavorClass: "selected",
        queryFavor:true
      })
    }else{
      this.setData({
        navAllClass: "selected",
        navFavorClass: "",
        queryFavor:false
      })
    }

    var userId = wx.getStorageSync('userId')   
    loadDays(this, userId)
  },
  editAction:function(e){
    var dayId = e.currentTarget.dataset.dayid
    wx.showLoading({
      title: '加载中',
    })
    
    wx.navigateTo({
      url: '/pages/edit/edit?dayId=' + dayId
    })

  },
  delAction:function(e){

    var that = this
    wx.showModal({
      title: '删除',
      content: '确认要删除吗？',
      success: function(res) {
        if (res.confirm) {
          var dayId = e.currentTarget.dataset.dayid
          var userId = wx.getStorageSync('userId')   
      
          wx.request({
            url: 'https://www.yubopet.top/customDay?dayId='+dayId,
            method: 'DELETE',
            success: function (res) {
              console.log(res)
              that.onShow()
              commonTool.success('删除成功')
              that.setData({modelShow:"none"})
            },
            fail: function (res) {
              console.log(res)
              commonTool.warning('删除失败')
            }
          })
        } 
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
  modelTapAction:function(e){
    if(e.currentTarget.id=="popBk"){
      this.setData({ modelShow: "none" })
    }
  },
  quitModel:function(e){
    this.setData({ modelShow: "none"})
  },
  shareAction:function(e){
    commonTool.warning("暂未开放~")
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
      that.setData({
        days: daysData
      })
      
    }
  })
}

