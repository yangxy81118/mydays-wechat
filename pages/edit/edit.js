//index.js
//获取应用实例
const date = new Date()
const months = []
const days = []

var cnCalendar

var dateSelected = false

const calTool = require("../../utils/cn-cal.js")
const commonTool = require("../../utils/common.js")

Page({
  data: {
    date: "点击选择",   //阳历组件显示值
    cnDate: "点击选择",//农历组件显示值
    vDate: "",   //两种日历后台公用实际值
    dateValue: "",  //阳历组件value属性值
    dayFavor:false,
    thisDayId:0,
    dateMode:0,
    starState:""
  },

  onLoad: function (option) {

    commonTool.showLastAction()

    var that = this
    cnCalendar = wx.getStorageSync("cnCalendar")
    
    //处理样式
    var res = wx.getSystemInfoSync()
    if (res.system.toLowerCase().indexOf("ios") >= 0) {
      this.setData({ ios: "ios" })
    }

    //检查加载农历组件
    if (!cnCalendar || cnCalendar == "") {
      wx.request({
        url: 'https://www.yubopet.top/simple-query/lunar',
        method: 'GET',
        success: function (res) {
          var calendarSource = res.data
          cnCalendar = calTool.init(calendarSource)
          wx.setStorage({
            key: 'cnCalendar',
            data: cnCalendar,
          })
          initLunarCompornt(that)
        }
      })
    }else{
      initLunarCompornt(that)
    }

    console.log("edit:")
    console.dir(option)
    //如果是编辑，则去加载该天数据
    if (option && option.dayId){
      this.setData({ thisDayId: option.dayId})
      wx.request({
        url: 'https://www.yubopet.top/graphql/days',
        method: 'POST',
        data: '{day(dayId:' + option.dayId + ') { name year month date lunar favor comment }}',
        header: {
          'content-type': 'text/plain'
        },
        success: function (res) {

          if (commonTool.checkError(res)) return

          var dayData = res.data.data.day

          //检测是否是农历
          if(dayData.lunar && dayData.lunar.length > 0){
            
            var lunarSplitArray = new Array()
            var nian = dayData.lunar.indexOf("）")
            var yue = dayData.lunar.indexOf("月")
            lunarSplitArray[0] = dayData.lunar.substring(0,nian+1)
            lunarSplitArray[1] = dayData.lunar.substring(nian+1,yue+1)
            lunarSplitArray[2] = dayData.lunar.substring(yue+1, dayData.lunar.length)
            
            var result = calTool.getChoiceIndex(cnCalendar,lunarSplitArray,that.data.lunarArray)
            var cnDateStr = lunarSplitArray[0] + lunarSplitArray[1] + lunarSplitArray[2]
            that.setData({
              lunarArray: result.lunarArray,
              lunarChoice: [result.year, result.month, result.day],
              cnDate: cnDateStr,
              vDate: cnDateStr,
              dateClass:"selected",
              dateMode: 1
            })

          }else{
            var normalDateStr = dayData.year + "-" + dayData.month + "-" + dayData.date
            that.setData({
              dateValue: normalDateStr,
              vDate: normalDateStr,
              date: normalDateStr,
              dateMode: "公历",
              dateClass: "selected",
              dateMode:0
            })
          }

          var favorState = ""
          if(dayData.favor){
            favorState = "star-selected"
          }
          that.setData({
            dayName: dayData.name,
            starState: favorState
          })

          dateSelected = true
          wx.hideLoading();
        }
      })
    }

    var daysCount = wx.getStorageSync("daysCount")
    var daysLimit = wx.getStorageSync("daysLimit")
    var isFull = ((daysCount + 1) >= daysLimit)

    this.setData({
      daysCount: daysCount,
      daysLimit: daysLimit,
      isFull:isFull
    })

    wx.hideLoading();

    
  },
  dateModeSwitch: function (e) {

    var dateMode = e.currentTarget.dataset.mode
    if (this.data.dateMode == dateMode){
      return
    }

    this.setData({ dateMode:dateMode})

    var that = this
    var lastDate = this.data.vDate

    if (lastDate.length > 0) {

      this.setData({
        cnDate: "历法切换中...",
        date: "历法切换中..."
      })

      //获取date数据，如果已经选择了前一种的date数据，那么根据mode发送到服务器，获取到另外一种的数据
      //如果是切换到公历，则直接修改公历插件的value数值即可
      if (dateMode == 0) {
        wx.request({
          url: 'https://www.yubopet.top/simple-query/lunar/lunarToNormal?date=' + encodeURI(lastDate),
          method: 'GET',
          success: function (res) {
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
        var that = this
        wx.request({
          url: 'https://www.yubopet.top/simple-query/lunar/normalTolunar?date=' + lastDate,
          method: 'GET',
          success: function (res) {
            var lunarStr = res.data.split(",")
            var result = calTool.getChoiceIndex(cnCalendar,lunarStr,that.data.lunarArray)
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
      var cnMonths = calTool.buildCNMonths(cnCalendar,targetYear);
      cnCalendarArray[1] = cnMonths
      cnCalendarArray[2] = calTool.buildCNDays(cnCalendar,targetYear, calTool.formatMField(cnMonths[0]))

      this.setData({
        lunarArray: cnCalendarArray,
        lunarChoice: [rowIdx, 0, 0]
      })
    }

    //month
    if (colIdx == 1) {
      var targetYear = cnCalendarArray[0][cnCalendarChoice[0]]
      var targetMonth = cnCalendarArray[1][rowIdx]
      cnCalendarArray[2] = calTool.buildCNDays(cnCalendar,targetYear, calTool.formatMField(targetMonth))

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

    var dateMode = this.data.dateMode;
    if (dateMode == 1) {
      var cnCalendarArray = this.data.lunarArray
      formData.date = cnCalendarArray[0][formData.date[0]] + cnCalendarArray[1][formData.date[1]] + cnCalendarArray[2][formData.date[2]]
    }

    var userId = wx.getStorageSync('userId')
    var that = this

    var thisDayId = this.data.thisDayId
    var isFavor = this.data.starState.length > 0
    if(thisDayId > 0){
      wx.request({
        url: 'https://www.yubopet.top/customDay',
        method: 'POST',
        data: {
          name: formData.name,
          dateMode: dateMode,
          date: formData.date,
          favor: isFavor,
          dayId: thisDayId,
          comment: formData.comment
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (commonTool.checkError(res)) return

          if (again) {
            wx.setStorageSync("lastActionState", "success:修改成功")
            wx.redirectTo({
              url: '/pages/edit/edit',
            })
          } else {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    }else{
      wx.request({
        url: 'https://www.yubopet.top/customDay',
        method: 'PUT',
        data: {
          name: formData.name,
          dateMode:dateMode,
          date: formData.date,
          favor: isFavor,
          userId: userId,
          comment: formData.comment
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (commonTool.checkError(res)) return
          wx.setStorageSync("newDayId", res.data)

          var daysCount = wx.getStorageSync("daysCount")
          daysCount++
          wx.setStorageSync("daysCount", daysCount)

          if (again) {
            wx.setStorageSync("lastActionState", "success:添加成功")


            // console.log("存储:" + wx.getStorageSync("lastActionState"))
            wx.redirectTo({
              url: '/pages/edit/edit',
            })
          } else {
            wx.navigateBack({
              delta: 1
            })
          }
          
        }
      })
    }
    

  },

  againDisableAction: function (e) {
    commonTool.warning("无法记录更多")
  },
  starTapAction:function(e){
    var state = this.data.starState;
    if(state.length == 0){
      this.setData({starState:"star-selected"})
    }else{
      this.setData({starState:""})
    }
  }

})


function initLunarCompornt(pageObj){

  var cnYears, cnMonths, cnDays
  cnYears = calTool.buildCNYears(cnCalendar)
  cnMonths = calTool.buildCNMonths(cnCalendar,"2018（狗年）")
  cnDays = calTool.buildCNDays(cnCalendar,"2018（狗年）", "1.正月")

  pageObj.setData({
    lunarArray: [cnYears, cnMonths, cnDays],
    lunarChoice: [108, 0, 0]
  })
}