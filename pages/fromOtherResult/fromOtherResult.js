const commonTool = require("../../utils/common.js")

Page({
  data: {
    title:"",
    tips:"",
    img:""
  },
  onLoad: function (options) {
    var resultTag = options.result
    if(resultTag == 1){
      this.setData({
        title:"填写成功",
        tips:"你的好友已经收到你的生日记录啦，相信TA这下不会忘记了~",
        img:"share_success.png"
      })
    }else{
      this.setData({
        title: "填写失败",
        tips: "由于您的好友额度已满或者其他系统问题，填写未成功~请联系好友或者重试~",
        img: "share_error.png"
      })
    }
  }
})
