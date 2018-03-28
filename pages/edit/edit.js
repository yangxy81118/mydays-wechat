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
    dateModeValue: 0,
    dateModeChoice: ['公历', '农历'],
    dateMode: '公历',
    vDate: "",   //两种日历后台公用实际值
    dateValue: "",  //阳历组件value属性值
    dayFavor:false,
    thisDayId:0,
  },

  onLoad: function (option) {

    var that = this
    cnCalendar = wx.getStorageSync("cnCalendar")

    //重置数据
    
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
              dateMode: "农历",
              dateModeValue: 1,
              dateClass:"selected"
            })

          }else{
            var normalDateStr = dayData.year + "-" + dayData.month + "-" + dayData.date
            that.setData({
              dateValue: normalDateStr,
              vDate: normalDateStr,
              date: normalDateStr,
              dateMode: "公历",
              dateClass: "selected",
              dateModeValue:0
            })
          }

          that.setData({
            dayName: dayData.name,
            dayFavor:dayData.favor,
            dayComment: dayData.comment
          })

          dateSelected = true
          wx.hideLoading();
        }
      })
    }else{

      //查询额度信息
      var userId = wx.getStorageSync('userId')
      wx.request({
        url: 'https://www.yubopet.top/graphql/days',
        method: 'POST',
        data: '{user(userId:' + userId + '){limit daysCount} }',
        header: {
          'content-type': 'text/plain'
        },
        success: function (res) {
          if (commonTool.checkError(res)) return

          var u = res.data.data.user
          that.setData({
            limit: u.limit,
            daysCount: u.daysCount
          })
        }
      });
    }
    wx.hideLoading();

    
  },
  dateModeChange: function (e) {
    var choice = this.data.dateModeChoice
    var lastDate = this.data.vDate
    //检查是否是无效切换 
    if (this.data.dateMode == choice[e.detail.value]) {
      return;
    }

    var that = this
    //同时清空两个date数据
    this.setData({
      dateMode: choice[e.detail.value],
      dateClass: ""
    })

    if (lastDate.length > 0) {

      this.setData({
        cnDate: "历法切换中...",
        date: "历法切换中..."
      })

      //获取date数据，如果已经选择了前一种的date数据，那么根据mode发送到服务器，获取到另外一种的数据
      //如果是切换到公历，则直接修改公历插件的value数值即可
      if (e.detail.value == 0) {
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

    //TODO 校验，最好用上第三方工具类
    if (formData.title.length <= 0) {
      commonTool.warning('请输入姓名')
      return
    }
    if (formData.title.length > 6) {
      commonTool.warning('姓名过长')
      return
    }

    if (!dateSelected) {
      commonTool.warning('请选择日期')
      return
    }

    if (formData.dateMode == 1) {
      var cnCalendarArray = this.data.lunarArray
      formData.date = cnCalendarArray[0][formData.date[0]] + cnCalendarArray[1][formData.date[1]] + cnCalendarArray[2][formData.date[2]]
    }

    var userId = wx.getStorageSync('userId')

    var thisDayId = this.data.thisDayId
    if(thisDayId > 0){
      wx.request({
        url: 'https://www.yubopet.top/customDay',
        method: 'POST',
        data: {
          name: formData.title,
          dateMode: formData.dateMode,
          date: formData.date,
          favor: formData.favor,
          dayId: thisDayId,
          comment: formData.comment
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (commonTool.checkError(res)) return

          wx.showToast({
            title: "修改成功"
          })
          wx.navigateBack({
            delta: 1
          })
        }
      })
    }else{
      wx.request({
        url: 'https://www.yubopet.top/customDay',
        method: 'PUT',
        data: {
          name: formData.title,
          dateMode: formData.dateMode,
          date: formData.date,
          favor: formData.favor,
          userId: userId,
          comment: formData.comment
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (commonTool.checkError(res)) return

          wx.setStorageSync("newDayId", res.data)
          // console.log("记录新增newId:" + wx.getStorageSync("newDayId"))
          wx.showToast({
            title: "添加成功"
          })       
          wx.navigateBack({
            delta: 1
          })
          
        }
      })
    }
    

  },

  limitTap: function (e) {
    commonTool.warning("记录额度已满")
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