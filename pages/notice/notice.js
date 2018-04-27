const commonTool = require("../../utils/common.js")

Page({
  data:{
    
  },
  onLoad: function () {
    var that = this
    wx.setStorageSync("version", getApp().globalData.version)
    
    commonTool.graphReq({
      module: 'resource',
      data: '{notice(page:1,rows:30){id title type content date}}',
      callback: function (res) {
        if (commonTool.checkError(res)) return

        var notice = res.data.data.notice

        for (var idx in notice){
          notice[idx].tagClass = buildTagClass(notice[idx].type)
        }

        that.setData({
          notice:notice
        })

      }
    })
  }
})

function buildTagClass(type){
  if(type==1) return "tg-update"
  if(type==2) return "tg-talk"
  if(type==3) return "tg-notify"
}