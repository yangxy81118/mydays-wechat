const commonTool = require("../../utils/common.js")

Page({
  data:{
    change:""
  },
  onLoad: function (options) {
    console.log("Enter share Page,123,this is options:")
    console.log("options:"+options.inviterId)
  },
  onShareAppMessage: function(options){
    console.log("ready share")
    console.log(options)

    return {
      title: "我忘记你的生日啦",
      path:"/pages/fromOther/fromOther?inviterId=199",
      success:function(res){
        console.log("share success:")
        console.dir(res)
      },
      fail:function(res){
        console.log('failed...')
        
      }
    }


  }
})