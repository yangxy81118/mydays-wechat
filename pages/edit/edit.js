//index.js
//获取应用实例
const date = new Date()
const months = []
const days = []

var cnCalender

var dateSelected = false

Page({
  data: {
    date:"点击选择",
    cnDate:"点击选择",
    dateModeChoice:['公历','农历'],
    dateMode:'公历'
  },

  onLoad:function(option){
    var that = this
    wx.request({
      url: 'https://www.yubopet.top/simple-query/lunar',
      method: 'GET',
      success: function (res) {
        var calanderSource = res.data
        //解析格式，构建农历日历对象
        cnCalender = createLunarCalendar(calanderSource)
        console.log(cnCalender)
        var cnYears = buildCNYears()
        var cnMonths = buildCNMonths("2018（戊戌年）")
        var cnDays = buildCNDays( "2018（戊戌年）","1.正月")

        that.setData({
          lunarArray: [cnYears,cnMonths,cnDays],
          lunarChoice:[108,0,0]
        })

      }
    })
  },
  dateModeChange: function (e) {
    var choice = this.data.dateModeChoice
    //同时清空两个date数据
    this.setData({
      dateMode: choice[e.detail.value],
      cnDate:"点击选择",
      date:"点击选择"
    })
    dateSelected = false
  },
  lunarFieldChange: function (e) {
    var colIdx = e.detail.column
    var rowIdx = e.detail.value

    var cnCalendarArray = this.data.lunarArray
    var cnCalenderChoice = this.data.lunarChoice
    //year
    if(colIdx == 0){
      
      var targetYear = cnCalendarArray[0][rowIdx]
      //获取年份下面的月份与日
      var cnMonths = buildCNMonths(targetYear)
      cnCalendarArray[1] = cnMonths
      cnCalendarArray[2] = buildCNDays(targetYear, formatMField(cnMonths[0]))
 
      this.setData({
        lunarArray: cnCalendarArray,
        lunarChoice: [rowIdx,0,0]
      })
    }

    //month
    if(colIdx == 1){
      var targetYear = cnCalendarArray[0][cnCalenderChoice[0]]
      var targetMonth = cnCalendarArray[1][rowIdx]
      cnCalendarArray[2] = buildCNDays(targetYear, formatMField(targetMonth))
      
      cnCalenderChoice[1] = rowIdx
      cnCalenderChoice[2] = 0

      this.setData({
        lunarArray: cnCalendarArray,
        lunarChoice: cnCalenderChoice
      })
    }
  },

  lunarValueChange: function (e) {
    dateSelected = true
    var lunar = this.data.lunarArray
    var valArray = e.detail.value
    var cnDateStr = lunar[0][valArray[0]]+""+lunar[1][valArray[1]]+lunar[2][valArray[2]]
    this.setData({
      cnDate : cnDateStr
    })
    
  },

  bindChange: function(e) {
    const val = e.detail.value
    this.setData({
      month: this.data.months[val[1]],
      day: this.data.days[val[2]]
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    dateSelected = true
  },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var formData = e.detail.value
    

    //TODO 校验，最好用上第三方工具类
    if (formData.title.length <= 0) {
      toastWarning('请输入姓名')
      return
    }
    if (formData.title.length > 10) {
      toastWarning('姓名过长')
      return
    }
    
    if (!dateSelected) {
      toastWarning('请选择日期')
      return
    }

    if (formData.dateMode == 1){
      var cnCalendarArray = this.data.lunarArray
      formData.date = cnCalendarArray[0][formData.date[0]] + cnCalendarArray[1][formData.date[1]] + cnCalendarArray[2][formData.date[2]]
    }

    var userId = wx.getStorageSync('userId')  

    wx.request({
      url: 'https://www.yubopet.top/customDay',
      method: 'PUT',
      data: {
        name: formData.title,
        dateMode: formData.dateMode,
        date: formData.date,
        favor: formData.favor,
        userId: userId
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        console.log(res)
       
      }
    })


  },
  formReset: function () {
    console.log('form发生了reset事件')
  }


})

function toastWarning(content){
  wx.showToast({
    title: content,
    image: '/images/warning.png',
    duration: 2000
  })
}


function createLunarCalendar(sourceArray){
  var lunar = new Object()

  for (var idx in sourceArray) {
    var allMonthStr = sourceArray[idx].m
    var yearObj = new Object()
    yearObj.name = sourceArray[idx].y
    lunar[yearObj.name] = yearObj

    var monthArray = allMonthStr.split("|")
    for (var idx = 1; idx < monthArray.length; idx++) {
      var monthObj = createMonthObj(monthArray[idx])
      yearObj[formatMField(monthObj.name)] = monthObj
    }
  }

  return lunar

}

function createMonthObj(monthStr){

  var monthObj = new Object()
  var monthPair = monthStr.split("-")
  monthObj.name = monthPair[0]

  var days = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九"]

  if(monthPair[1].indexOf("&") >0 ){
    days[29] = "三十"
  }
  monthObj.days = days 
  return monthObj  
}

function formatMField(cnMonth){
  if (cnMonth == "正月") return "1."+cnMonth
  if (cnMonth == "二月") return "2." + cnMonth
  if (cnMonth == "闰二月") return "3." + cnMonth
  if (cnMonth == "三月") return "4." + cnMonth
  if (cnMonth == "闰三月") return "5." + cnMonth
  if (cnMonth == "四月") return "6." + cnMonth
  if (cnMonth == "闰四月") return "7." + cnMonth
  if (cnMonth == "五月") return "8." + cnMonth
  if (cnMonth == "闰五月") return "9." + cnMonth
  if (cnMonth == "六月") return "10." + cnMonth
  if (cnMonth == "闰六月") return "11." + cnMonth
  if (cnMonth == "七月") return "12." + cnMonth
  if (cnMonth == "闰七月") return "13." + cnMonth
  if (cnMonth == "八月") return "14." + cnMonth
  if (cnMonth == "闰八月") return "15." + cnMonth
  if (cnMonth == "九月") return "16." + cnMonth
  if (cnMonth == "闰九月") return "17." + cnMonth
  if (cnMonth == "十月") return "18." + cnMonth
  if (cnMonth == "闰十月") return "19." + cnMonth
  if (cnMonth == "冬月") return "20." + cnMonth
  if (cnMonth == "腊月") return "21." + cnMonth
}


function buildCNYears(){
  const years = []
  for(var key in cnCalender){
    years.push(key)
  }
  return years
}

function buildCNMonths(targetYear){
  var year = cnCalender[targetYear]
  const months = []
  for (var key in year) {
    if(key!="name"){
      months.push(key.split(".")[1])
    }
  }
  return months
}

function buildCNDays(targetYear,targetMonth){
  var year = cnCalender[targetYear]
  var month = year[targetMonth]
  return month.days
}