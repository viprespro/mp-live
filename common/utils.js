const $verify = {
  isPhoneNo(num) {
    if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(num))) {
      return false;
    }
    return true;
  },
  isIdNo(num) {
    if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(num))) {
      return false;
    }
    return true;
  },
  isEmail(num) {
    if (!(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(num))) {
      return false;
    }
    return true;
  },
}

const $api = {

  msg(title, duration = 1500, mask = true, icon = 'none') {
    if (Boolean(title) === false) {
      return
    }
    wx.showToast({
      title,
      duration,
      mask,
      icon
    })
  },

  debounce(fn, wait = 1000) {
    let timer;
    return function() {
      let context = this;
      let args = arguments;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, wait)
    }
  },

  throttle(fn, wait = 1000) {
    let timer;
    return function() {
      if (timer != null) return;
      let context = this;
      let args = arguments;
      fn.apply(context, args);
      timer = setTimeout(() => {
        timer = null;
      }, wait);
    }
  },

  formatTime(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(this.formatNumber).join('/') + ' ' + [hour, minute, second].map(this.formatNumber).join(':')
  },

  formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },

  wxPay() {
    let that = this
    wx.requestPayment({
      provider: 'wxpay',
      timeStamp: options.timeStamp,
      nonceStr: options.nonceStr,
      package: options.package,
      signType: options.signType,
      paySign: options.sign,
      success(res) {
        that.msg('支付成功')
        setTimeout(() => {
          uni.navigateBack({
            delta: 1
          })
        }, 1500)
      },
      fail(err) {
        console.log(err);
      },
      complete(result) {
        console.log(result);
      }
    })
  }
}

export {
  $api,
  $verify
}