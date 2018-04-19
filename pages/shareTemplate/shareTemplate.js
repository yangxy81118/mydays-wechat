const commonTool = require("../../utils/common.js")
const constants = require("../../utils/constants.js")


Page({
  data:{
   choices:[],
   selectedIdx:-1,
   btnWords:"请先选择一个模板",
   previewDisplay:"none"
  },
  onLoad: function () {
    this.setData({
      choices: constants.SHARE_CHOICES
    })

  },
  selectTemplateAction:function(e){

    var choices = this.data.choices
    var thisTimeIdx = e.currentTarget.dataset.idx 

    //恢复上一个图片状态
    if (this.data.selectedIdx > -1){
      //重复点击
      if (thisTimeIdx == this.data.selectedIdx){
        return
      }

      var lastDetail = choices[this.data.selectedIdx]
      lastDetail.bk = buildunselectedBkSrc(lastDetail.bk)
    }

    var choiceDetail = choices[thisTimeIdx]
    choiceDetail.bk = buildSelectedBkSrc(choiceDetail.bk)

    this.setData({
      selectedIdx: thisTimeIdx,
      btnWords: "转发给好友",
      choices: choices
    })
    
  },
  previewAction:function(e){
    var detail = this.data.choices[e.currentTarget.dataset.idx]

    this.setData({
      previewDisplay:"flex",
      previewImg: detail.img,
      previewTitle: detail.title
    })
  },
  previewTapAction:function(e){
    // if (e.currentTarget.id == "previewBk") {
      this.setData({ previewDisplay: "none" })
    // }
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
      path: "/pages/fromOther/fromOther?inviterId=" + userId + "&template=" + this.data.selectedIdx,
      imageUrl: shareObj.img,
      success: function (res) {
        that.setData({
          previewDisplay: "none",
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


function buildSelectedBkSrc(defaultSrc){
  var dotIdx = defaultSrc.indexOf(".")
  var front = defaultSrc.substring(0,dotIdx)
  return front + "_selected.png"
}

function buildunselectedBkSrc(selectedSrc){
  var underLineIdx = selectedSrc.lastIndexOf("_")
  var front = selectedSrc.substring(0, underLineIdx)
  return front + ".png"
}