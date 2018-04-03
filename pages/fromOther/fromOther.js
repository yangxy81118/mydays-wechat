const commonTool = require("../../utils/common.js")

Page({
  data:{
    change:""
  },
  onLoad: function (options) {
    console.log("Enter share Page,123,this is options:")
    console.log("options:"+options.inviterId)

    //注意这里可能要“加载中”

    //首先wx.getStorage获取用户ID
      //如果获取到了，则说明是老用户，则去查询用户信息，尽量拿到userName
        //如果拿到了userName，填充到input name里
        //如果没有拿到，则调用getUserInfo去授权获取
      //如果是新用户，并且调用getUserInfo去授权获取，并调用login
  },
  formSubmit:function(e){
    //用户选择提交，根据inviterId，相当于userId

    //调用新的PUT方法，专门用来处理“他人加入”的请求，其中具体细节有：
      //检查是否满额
      //邀请人加入信息
      //检查被邀请人是否是新用户，如果是新用户，则把这条记录也给他添加进来
  },
  userForward:function(e){
    //用户点击“我也参与”，跳转到首页
  }

  
})