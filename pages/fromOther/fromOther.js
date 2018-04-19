var cnCalendar
var dateSelected = false

const calTool = require("../../utils/cn-cal.js")
const commonTool = require("../../utils/common.js")
const constants = require("../../utils/constants.js")

var inviterId

var templateId

Page({
  data: {
    date: "点击选择",   //阳历组件显示值
    cnDate: "点击选择",//农历组件显示值
    vDate: "",   //两种日历后台公用实际值
    dateValue: "",  //阳历组件value属性值
    dayFavor: false,
    thisDayId: 0,
    dateMode: 0,
    starState: "",
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: {},
    inviter:{},
  },
  onLoad: function (options) {
    console.log("inviterId:"+options.inviterId)
    inviterId = options.inviterId

    var userId = wx.getStorageSync('userId')
    var that = this

    if (userId == inviterId){
      this.setData({self:true})

      commonTool.graphReq({
          module:'days',
          data:'{user(userId:' + inviterId + ') { invitedCount }}',
          callback:function(res){
            if (commonTool.checkError(res)) return
            var inviter = res.data.data.user
            that.setData({
              invitedCount : inviter.invitedCount
            })
          }
      })
    }

    initComponents(this)

    //注意这里可能要“加载中”
    wx.showLoading({
      title: '加载中'
    })


    //获取模板数据
    if (!options.template){
      options.template = 2
    }
    var template = constants.SHARE_CHOICES[options.template]
    templateId = options.template

    //加载邀请人的数据
    commonTool.graphReq({
      module:'days',
      data:'{user(userId:' + inviterId +') { nickName,avatarUrl }}',
      callback:function (res) {
        if (commonTool.checkError(res)) return

        var inviter = res.data.data.user
        if (!inviter.avatarUrl || inviter.avatarUrl.length <= 0){
          inviter.avatarUrl = "/images/avatar.png"
        }

        if (!inviter.nickName || inviter.nickName.length <= 0) {
          inviter.nickName = "神秘人"
        }

        that.setData({
            inviter: res.data.data.user,
            template: template
        })
      }
    })

    //最大日期到今天（阳历)
    var today = new Date()
    var day = today.getDate()
    var month = today.getMonth() + 1
    var year = today.getFullYear()
    var endTimeStr = year + "-" + month + "-" + day

    this.setData({
      endDate: endTimeStr
    })

    wx.hideLoading()

  },
  getUserInfo: function (e) {

    var userInfo = e.detail.userInfo
    if(!userInfo){
      return;
    }

    userInfo.nickName = commonTool.replaceEmoji(userInfo.nickName)
    this.setData({
      userInfo: userInfo
    })

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

        var localUserInfo = wx.getStorageSync("userInfo")
        localUserInfo.nickName = userInfo.nickName
        localUserInfo.avatarUrl = userInfo.avatarUrl
        wx.setStorageSync("userInfo", localUserInfo)
      }
    })

  },
  dateModeSwitch: function (e) {

    var dateMode = e.currentTarget.dataset.mode
    if (this.data.dateMode == dateMode) {
      return
    }

    this.setData({ dateMode: dateMode })

    var that = this
    var lastDate = this.data.vDate

    if (lastDate.length <= 0)
      return

    this.setData({
      cnDate: "历法切换中...",
      date: "历法切换中..."
    })

    //获取date数据，如果已经选择了前一种的date数据，那么根据mode发送到服务器，获取到另外一种的数据
    //如果是切换到公历，则直接修改公历插件的value数值即可
     if (dateMode == 0) {

      commonTool.request({
        url:'simple-query/lunar/lunarToNormal?date=' + encodeURI(lastDate),
        method:'GET',
        callback:function (res) {
          if (commonTool.checkError(res)) return
          that.setData({
            dateValue: res.data,
            vDate: res.data,
            date: res.data
          })
        }
      })

    }

    //如果是切换到农历，则根据返回的(AA,BB,CC)来分析：先通过AA找到对应的年index，然后逐步找到BB,CC的index，最后绑定数据
    else {

      commonTool.request({
        url:'simple-query/lunar/normalTolunar?date=' + lastDate,
        method:'GET',
        callback:function (res) {
          var lunarStr = res.data.split(",")
          var result = calTool.getChoiceIndex(cnCalendar, lunarStr, that.data.lunarArray)
          var cnDateStr = lunarStr[0] + lunarStr[1] + lunarStr[2]
          that.setData({
            lunarArray: result.lunarArray,
            lunarChoice: [result.year, result.month, result.day],
            cnDate: cnDateStr,
            vDate: cnDateStr
          })
        }
      })

    }
  },
  lunarFieldChange: function (e) {
    var colIdx = e.detail.column
    var rowIdx = e.detail.value

    var cnCalendarArray = this.data.lunarArray
    var cnCalendarChoice = this.data.lunarChoice
    //year
    if (colIdx == 0) {

      var targetYear = cnCalendarArray[0][rowIdx]

      //获取年份下面的月份与日
      var cnMonths = calTool.buildCNMonths(cnCalendar, targetYear);
      cnCalendarArray[1] = cnMonths
      cnCalendarArray[2] = calTool.buildCNDays(cnCalendar, targetYear, calTool.formatMField(cnMonths[0]))

      this.setData({
        lunarArray: cnCalendarArray,
        lunarChoice: [rowIdx, 0, 0]
      })
    }

    //month
    if (colIdx == 1) {
      var targetYear = cnCalendarArray[0][cnCalendarChoice[0]]
      var targetMonth = cnCalendarArray[1][rowIdx]
      cnCalendarArray[2] = calTool.buildCNDays(cnCalendar, targetYear, calTool.formatMField(targetMonth))

      cnCalendarChoice[1] = rowIdx
      cnCalendarChoice[2] = 0

      this.setData({
        lunarArray: cnCalendarArray,
        lunarChoice: cnCalendarChoice
      })
    }
  },

  lunarValueChange: function (e) {
    dateSelected = true
    var lunar = this.data.lunarArray
    var valArray = e.detail.value
    var cnDateStr = lunar[0][valArray[0]] + "" + lunar[1][valArray[1]] + lunar[2][valArray[2]]
    this.setData({
      cnDate: cnDateStr,
      dateClass: "selected",
      vDate: cnDateStr
    })

  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value,
      dateClass: "selected",
      vDate: e.detail.value
    })
    dateSelected = true
  },
  formSubmit: function (e) {
    var formData = e.detail.value

    var again = (e.detail.target.id == "again")

    //TODO 校验，最好用上第三方工具类
    if (formData.name.length <= 0) {
      commonTool.warning('请输入姓名')
      return
    }

    if (!dateSelected) {
      commonTool.warning('请选择日期')
      return
    }

    wx.showLoading({
      title: '提交中',
    })

    var dateMode = this.data.dateMode;
    if (dateMode == 1) {
      var cnCalendarArray = this.data.lunarArray
      formData.date = cnCalendarArray[0][formData.date[0]] + cnCalendarArray[1][formData.date[1]] + cnCalendarArray[2][formData.date[2]]
    }

    var userId = wx.getStorageSync('userId')

     commonTool.request({
        url:'customDay/byOther',
        method:'PUT',
        data:{
          name: formData.name,
          dateMode: dateMode,
          date: formData.date,
          userId: inviterId,
          beInviterId: userId
        },
        header:{
          'content-type': 'application/json'
        },
        callback:function (res) {
        if (commonTool.checkError(res)) return
        
        wx.hideLoading()
        
        if(res.data.code == 0){
          wx.navigateTo({
            url: '/pages/fromOtherResult/fromOtherResult?result=1&newDayId=' + res.data.msg,
          })
        }else{
          wx.navigateTo({
            url: '/pages/fromOtherResult/fromOtherResult?result=2&newDayId=' + res.data.msg,
          })
        }
      }
    })

  },
  onShareAppMessage: function (options) {
    var userId = wx.getStorageSync('userId')

    var shareObj = constants.SHARE_CHOICES[templateId]
    return {
      title: shareObj.title,
      path: "/pages/fromOther/fromOther?inviterId=" + userId + "&template=" + templateId,
      imageUrl: shareObj.img,
      success: function (res) {
        console.log("share success:")
      },
      fail: function (res) {
        console.log("share success:")
      }
    }
  }



})


function initComponents(page){
  commonTool.showLastAction()
  wx.hideShareMenu()

  cnCalendar = wx.getStorageSync("cnCalendar")

  //检查加载农历组件
  if (!cnCalendar || cnCalendar == "") {

      commonTool.request({
        url:'simple-query/lunar',
        method:'GET',
        callback:function(res){
          var calendarSource = res.data
          cnCalendar = calTool.init(calendarSource)
          wx.setStorage({
            key: 'cnCalendar',
            data: cnCalendar,
          })
          initLunarCompornt(page)
        }
      })
    }else{
      initLunarCompornt(page)
    }
}

function initLunarCompornt(pageObj) {
  var cnYears, cnMonths, cnDays
  cnYears = calTool.buildCNYears(cnCalendar)
  cnMonths = calTool.buildCNMonths(cnCalendar, "2018（狗年）")
  cnDays = calTool.buildCNDays(cnCalendar, "2018（狗年）", "1.正月")

  pageObj.setData({
    lunarArray: [cnYears, cnMonths, cnDays],
    lunarChoice: [108, 0, 0]
  })
}