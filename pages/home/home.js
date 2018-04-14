//获取应用实例
var windowHeight = 0
var favor = false

const commonTool = require("../../utils/common.js")

Page({
  data: {
    navAllClass:"selected",
    navFavorClass:"",
    layoutBtnClass:"icon-list",
    layout:2,
    modelShow:"none",
    queryFavor:false,
    wxModelShow:"none"
  },
  onShow: function () {

    //手机信息
    var that = this
    wx.getSystemInfo({
      success: function (res) {
        windowHeight = res.windowHeight;
        that.setData({
          listHeight: res.windowHeight-80
        })
      }
    })

    //额度
    var isFull = commonTool.checkDaysCount()
    //第一次打开
    var firstOpen = wx.getStorageSync('RESET_OPEN_HOME')
    var shareTipClass = ""
    if (firstOpen) shareTipClass = "show-block"
    //清空一些可能的多余状态
    this.setData({
      modelShow: "none",
      newId: 0,
      isFull: isFull,
      shareTipClass: shareTipClass
    })
    wx.setStorageSync('RESET_OPEN_HOME', false)

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
        layoutBtnClass: "icon-list",
        layout:2
      })
    }else{
      this.setData({
        layoutBtnClass: "icon-gallery",
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

          commonTool.request({
            url:'customDay?dayId='+dayId,
            method:'DELETE',
            callback:function (res) {
              if (commonTool.checkError(res)) return

              var daysCount = wx.getStorageSync("daysCount")
              daysCount--
              wx.setStorageSync("daysCount", daysCount)

              that.onShow()
              that.setData({modelShow:"none"})
              commonTool.success('删除成功')
            }
          })
        } 
      }
    })
    
  },
  popupAction:function(e){
    var dayId = e.currentTarget.dataset.dayid
    var idx = e.currentTarget.dataset.idx
    loadPopUp(this, dayId,idx)
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
  },
  fullAction:function(e){
    commonTool.warning("生日额度已满")
  },
  addAction:function(e){
    wx.navigateTo({
      url: '/pages/edit/edit',
    })
  },
  popSeqAction:function(e){
    if(e.currentTarget.id=="prev"){
      var currentIdx = this.data.popUpIdx
      var days = this.data.days
      currentIdx--

      this.setData({
        popUpIdx: currentIdx
      })

      // loadPopUp(this,)
      loadPopUp(this, days[currentIdx].id, currentIdx)

    }else{
      var currentIdx = this.data.popUpIdx
      var days = this.data.days
      currentIdx++

      this.setData({
        popUpIdx: currentIdx
      })

      loadPopUp(this, days[currentIdx].id, currentIdx)
    }
  },

  //微信分享验证逻辑
  shareCheckAction: function (e) {
    if(!this.data.hasUserInfo){
      this.setData({
        wxModelShow: "block"
      })
    }else{
      this.setData({
        wxModelShow: "none"
      })
      wx.navigateTo({
        url: '/pages/shareTemplate/shareTemplate',
      })
    }

  },
  getUserInfo: function (e) {

    //如果拒绝，则不做响应
    if (!e.detail.userInfo) {
      return
    }

    //去同步userInfo到数据库
    var userInfo = e.detail.userInfo
    userInfo.nickName = commonTool.replaceEmoji(userInfo.nickName)

    var userId = wx.getStorageSync('userId')
    var that = this
    commonTool.request({
      url: "user",
      method: "POST",
      data: {
        id: userId,
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      },
      callback: function (res) {
        if (commonTool.checkError(res)) return

        var localUserInfo = wx.getStorageSync("userInfo")
        localUserInfo.nickName = userInfo.nickName
        localUserInfo.avatarUrl = userInfo.avatarUrl
        wx.setStorageSync("userInfo", localUserInfo)

        //然后修改按钮状态
        that.setData({
          authFinish: true
        })
      }
    })

  },
  wxModelTapAction: function (e) {
    if (e.currentTarget.id == "wxModelBk") {
      this.setData({ wxModelShow: "none" })
    }
  },
  shareTapAction:function(e){
    this.setData({
      wxModelShow: "none"
    })

    wx.navigateTo({
      url: '/pages/shareTemplate/shareTemplate',
    })
  }

})


function loadPopUp(that,dayId,idx){
  //优化体验
  that.setData({
    popUpDay: {
      name: "...",
      age: "...",
      favor: false,
      remain: "..."
    },
    popUpIdx: idx,
    modelShow: "block"
  })

  commonTool.graphReq({
      module:'days',
      data: '{day(dayId:' + dayId + ') { id name year month date remain custom lunar age favor greeting }}',
      callback:function (res) {
        if (commonTool.checkError(res)) return

        var dayData = res.data.data.day
        that.setData({
          popUpDay: dayData
        })
      }
   })
}

function loadDays(that,userId){

  commonTool.graphReq({
        module:'days',
        data: '{days(userId:' + userId + ',favor:' + favor + ') { id name year month date remain custom lunar age favor } user(userId:'+userId+') { nickName avatarUrl } }',
        callback:function (res) {
          if (commonTool.checkError(res)) return

          var daysData = res.data.data.days
          var hasUserInfo = false
          if(res.data.data.user.nickName.length > 0)  hasUserInfo = true

          that.setData({
            days: daysData,
            daysCnt: daysData.length,
            hasUserInfo:hasUserInfo

          })
        }
    })
}

