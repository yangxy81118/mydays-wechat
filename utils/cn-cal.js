const init = source => {
  var lunar = new Object()

  for (var idx in source) {
    var allMonthStr = source[idx].m
    var yearObj = new Object()
    yearObj.name = source[idx].y
    lunar[yearObj.name] = yearObj

    var monthArray = allMonthStr.split("|")
    for (var idx = 1; idx < monthArray.length; idx++) {
      var monthObj = createMonthObj(monthArray[idx])
      yearObj[formatMField(monthObj.name)] = monthObj
    }
  }

  return lunar
}


/* 构建农历年数组 */
const buildCNYears = function(calendar) {
  const years = []
  for (var key in calendar) {
    years.push(key)
  }
  return years
}

/* 根据农历年构建农历月数组 */
const buildCNMonths = function(calendar,targetYear) {
  var year = calendar[targetYear]
  const months = []
  for (var key in year) {
    if (key != "name") {
      months.push(key.split(".")[1])
    }
  }
  return months
}

/* 根据农历年月构建农历日数组 */
const buildCNDays = function(calendar,targetYear,targetMonth) {
  var year = calendar[targetYear]
  var month = year[targetMonth]
  return month.days
}

const formatMField = function(cnMonth) {
  if (cnMonth == "正月") return "1." + cnMonth
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

function createMonthObj(monthStr) {

  var monthObj = new Object()
  var monthPair = monthStr.split("-")
  monthObj.name = monthPair[0]

  var days = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", 
              "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十", 
              "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九"]

  if (monthPair[1].indexOf("&") > 0) {
    days[29] = "三十"
  }
  monthObj.days = days
  return monthObj
}

/*获取农历年对象*/
const getYear = function(calendar,name){
  return calendar[name]
}

const getChoiceIndex = function(calendar,lunarArray,originalLunarArray){
  var lunarYear = calendar[lunarArray[0]]
  var lunarMonth = lunarYear[formatMField(lunarArray[1])]

  //构建农历的月和日的数据
  var cnCalendarArray = originalLunarArray
  var cnMonths = buildCNMonths(calendar,lunarArray[0]);
  cnCalendarArray[1] = cnMonths
  cnCalendarArray[2] = buildCNDays(calendar,lunarArray[0], formatMField(lunarArray[1]))

  //获取选择value索引            
  var yearIdx = findLunarIndexFromObj(lunarArray[0], calendar)
  var monthIdx = findLunarIndexFromObj(lunarArray[1], lunarYear)
  var dayIdx = findLunarIndexFromArray(lunarArray[2], lunarMonth.days)

  var result = new Object()
  result.year = yearIdx
  result.month = monthIdx
  result.day = dayIdx
  result.lunarArray = cnCalendarArray
  return result

}

function findLunarIndexFromObj(target, obj) {
  var i = 0 //有一个name属性
  for (var key in obj) {
    if (key == "name") continue

    if (key.indexOf(target) >= 0) {
      return i
    }
    i++
  }
  return i
}

function findLunarIndexFromArray(target, array) {
  for (var idx in array) {
    if (array[idx].indexOf(target) >= 0) {
      return idx
    }
  }
  return 0
}



module.exports = {
  init: init,
  buildCNYears:buildCNYears,
  buildCNMonths:buildCNMonths,
  buildCNDays:buildCNDays,
  formatMField:formatMField,
  getChoiceIndex:getChoiceIndex,
  getYear:getYear
}
