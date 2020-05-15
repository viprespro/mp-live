const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 返回时间格式例如：5月22日8:00 - 9:00
const formatTimeCus = (date)=> {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return month + '月' + day + '日' + '12:00-14:00';
}

const throttle = (func, delay)=> {
  let timer;
  return function() {
    if(timer) return;
    func();
    timer = setTimeout(()=> {
        timer = null;
    },delay)
  }
}

module.exports = {
  formatTime: formatTime,
  throttle: throttle,
  formatTimeCus: formatTimeCus
}
