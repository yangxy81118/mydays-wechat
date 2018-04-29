const commonTool = require("../../utils/common.js")

Page({
  data:{
    
  },
  onLoad: function () {

  },
  onShareAppMessage: function (options) {
    return {
      title: "真的不想再错过亲朋好友的生日了",
      path: "/pages/home/home"
    }
  }
})