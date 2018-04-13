const commonTool = require("../../utils/common.js")
const constants = require("../../utils/constants.js")


Page({
  data:{
   choices:[],
   selectedIdx:-1,
   btnWords:"请先选择一个模板"
  },
  onLoad: function () {
    this.setData({
      choices: constants.SHARE_CHOICES
    })

  },
  selectTemplateAction:function(e){
    var idx=  e.currentTarget.dataset.idx 
    this.setData({
      selectedIdx: idx,
      btnWords: "转发给好友"
    })
  },
  onShareAppMessage: function (options) {

    if(this.data.selectedIdx < 0){
      commonTool.warnning("请选择一个模板")
      return
    }

    var userId = wx.getStorageSync('userId')
    var that = this
    var shareObj = this.data.choices[this.data.selectedIdx]
    return {
      title: shareObj.title,
      path: "/pages/fromOther/fromOther?inviterId=" + userId,
      imageUrl: shareObj.img,
      success: function (res) {
        that.setData({
          wxModelShow: "none",
          hasUserInfo: true,
          shareTipClass: "show-hidden"
        })
      },
      fail: function (res) {
        console.log("share success:")
      }
    }
  }
})