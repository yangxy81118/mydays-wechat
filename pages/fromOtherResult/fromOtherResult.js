const commonTool = require("../../utils/common.js")

var newDayId = 0
Page({
  data: {
    title:"",
    tips:"",
    img:"",
    btnText:"我也想用",
    readyCopy:true
  },
  onLoad: function (options) {
    var resultTag = options.result
    if(resultTag == 1){
      this.setData({
        title:"已发送给好友",
        tips:"你的好友已经收到你的生日记录啦，相信TA这下不会忘记了~",
        img:"share_success.png"
      })
    }else{
      this.setData({
        title: "发送失败",
        tips: "由于您的好友额度已满或者其他系统问题，填写未成功，请联系好友或者重试~",
        img: "share_error.png"
      })
    }

    //获取新日期的id
    newDayId = options.newDayId
    
    //获取该用户是否为新用户（没有任何数据的新用户）
    var userInfo = wx.getStorageSync("userInfo")
    if (userInfo.daysCount>0){
      this.setData({
        readyCopy: false,
        btnText:"返回我自己的主页"
      })
    }
  },
  checkboxChange:function(e){
    if(e.detail.value.length > 0){
      this.setData({
        readyCopy: true
      })
    }else{
      this.setData({
        readyCopy: false
      })
    }
  },
  redirectAction:function(e){
    
    if (newDayId > 0 && this.data.readyCopy) {
      commonTool.request({
        url: "customDay/copy",
        method: "POST",
        data: {
          dayId: newDayId,
          userId: wx.getStorageSync('userId')
        },
        callback:function(e){
          wx.reLaunch({
            url: '/pages/home/home',
          })

          //count + 1
        }
      })
    }else{
      wx.reLaunch({
        url: '/pages/home/home',
      })
    }
  }
})
