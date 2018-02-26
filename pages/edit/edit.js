//index.js
//获取应用实例
const date = new Date()
const months = []
const days = []

for (let i = 1 ; i <= 12; i++) {
  months.push(i)
}

for (let i = 1 ; i <= 31; i++) {
  days.push(i)
}

Page({
  data: {
    months: months,
    month: 2,
    days: days,
    day: 2,
    value: [9999, 1, 1],
  },
  bindChange: function(e) {
    const val = e.detail.value
    this.setData({
      month: this.data.months[val[1]],
      day: this.data.days[val[2]]
    })
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  formReset: function () {
    console.log('form发生了reset事件')
  }

})