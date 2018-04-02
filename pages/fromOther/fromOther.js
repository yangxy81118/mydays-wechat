const commonTool = require("../../utils/common.js")

Page({
  data:{
    change:""
  },
  onLoad: function () {
    console.log("Enter share Page")
  },
  onShareAppMessage: function(options){
    console.log("ready share")
    console.log(options)

    return {
      title: "我忘记你的生日啦！"
      


    }


  }
})