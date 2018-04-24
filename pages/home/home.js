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

    //首先判断userId是否已经获取到
    var userId = wx.getStorageSync('userId')
    var token = wx.getStorageSync('token')

    console.log('首次进入home查询用户ID:'+userId)

    //如果获取到了，直接进入到正常数据获取流程
    if (userId > 0 && token.length > 0){
      console.log("居然有数据？userId:["+userId+"]")
      initOnOpen(this)
    }else{
      console.log("果然没数据! userId:["+userId+"]")
      //如果没有，则显示加载中，并等待2秒后重试
      wx.showLoading({
        title:'登陆中,请稍等'
      })
      setTimeout(initOnOpen,2000,this) 
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
            tokenAppend:true,
            url:'customDay?dayId='+dayId,
            method:'DELETE',
            callback:function (res) {
              if (commonTool.checkError(res)) return

              commonTool.daysChange(-1)

              that.onShow()
              that.setData({
                modelShow:"none",
                isFull: commonTool.checkDaysCount()
              })
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
        wxModelShow: "flex"
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
    modelShow: "flex"
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

function loadDays(page,userId){

  commonTool.graphReq({
      module:'days',
      data: '{days(userId:' + userId + ',favor:' + favor + ') { id name year month date remain custom lunar age favor } user(userId:'+userId+') { nickName avatarUrl } }',
      callback:function (res) {
        if (commonTool.checkError(res)) return

        //如果一切正常
        if(res.data.data){
          var daysData = res.data.data.days
          var hasUserInfo = false
          if (res.data.data.user.nickName.length > 0) hasUserInfo = true

          //这里还要多检查一次用户的额度，因为有可能这时候有其他用户填写完邀请，数量其实就发生了变化
          var daysCnt = daysData.length
          var userInfo = wx.getStorageSync("userInfo")
          userInfo.daysCount = daysCnt
          wx.setStorageSync("userInfo", userInfo)

          page.setData({
            days: daysData,
            daysCnt: daysCnt,
            hasUserInfo: hasUserInfo,
            isFull: daysCnt >= userInfo.limit
          })
        }

        //如果出现异常
        else{
          page.setData({
            days: [],
            daysCnt: 0,
            hasUserInfo: false
          })
        }           
      }
  })
}

function initOnOpen(page){

    var userId = wx.getStorageSync('userId')

    console.log("initOpen,userId:["+userId+"]")

    //额度
    var isFull = commonTool.checkDaysCount()

    //第一次打开
    var firstOpen = wx.getStorageSync('RESET_OPEN_HOME')
    var shareTipClass = ""
    if (firstOpen) shareTipClass = "show-block"
    
    //清空一些可能的多余状态
    page.setData({
      modelShow: "none",
      newId: 0,
      isFull: isFull,
      shareTipClass: shareTipClass
    })
    wx.setStorageSync('RESET_OPEN_HOME', false)


    loadDays(page,userId)

    //如果navigateBack能够带参数，就不需要这么绕了
    var newDayId = wx.getStorageSync('newDayId')   
    if(newDayId){
      page.setData({ newId: newDayId})
      wx.removeStorageSync('newDayId')
    }

    wx.hideLoading()
}

