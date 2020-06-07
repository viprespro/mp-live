const Config = require('../config.js')

module.exports = {
  // API_ROOT: 'https://huanashop.weirong100.com',
  API_ROOT: Config.HTTP_REQUEST_URL,
  post(ops) {
    ops.method = 'POST';
    this.request(ops);
  },
  get(ops) {
    ops.method = 'GET';
    this.request(ops);
  },
  //请求函数
  request(ops) {
    let API_ROOT = this.API_ROOT;
    wx.request({
      url: `${API_ROOT}${ops.url}`,
      data: ops.data,
      method: ops.method,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: (res) => {
        let ret = res.data;
        if (ret.code == 0 || ret.code == 1) {
          ops.success(ret); // 执行成功的回调
        } else {
          console.log(ret)
          if (ret.code == 96 || ret.code == 98) { // token过期
            wx.clearStorage('token');
            wx.redirectTo({
              url: '/pages/before-login/before-login',
            })
          } else {
            wx.showToast({
              title: ret.message || '出错了~',
              icon: 'none',
              duration: 1500
            })
          }
        }
      },
      fail: (res) => {
        wx.showModal({
          title: '提示',
          content: '访问出错，稍后再试！',
        })
      },
      complete: () => {
        setTimeout(() => {
          wx.hideLoading();
        }, 500)
      }
    })
  },

  // 分页加载
  pageLoad(other, arrguments) {
    let that = other.that
    let status = other.status
    let list = other.list
    let size = other.size
    if (!status) return; //没有更多数据了
    let API_ROOT = this.API_ROOT;
    wx.request({
      url: `${API_ROOT}${arrguments.url}`,
      data: arrguments.data,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: (res) => {
        let ret = res.data
        if (ret.code == 0) { //查询成功
          if (ret.data.length < size) { // 没有更多数据
            that.setData({
              hasMore: false
            })
          }
          let newList = list.concat(ret.data)
          arrguments.success(newList);
        }
      }
    })
  },

  // 判断登录情况
  isLogin(that) {
    if (that.data.token) {
      return true;
    }
    let token = wx.getStorageSync('token');
    if (!token) {
      wx.redirectTo({
        url: '/pages/before-login/before-login',
      })
    } else {
      that.setData({
        token: token
      })
      return true
    }
  },

  // 验证是否为手机号
  isPhoneNo(num) {
    if (!(/^1[3|4|5|7|8|9][0-9]\d{4,8}$/.test(num))) {
      return false;
    }
    return true;
  },

  // 验证是否为邮箱
  isEmail(str) {
    if (!(/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(str))) {
      return false;
    }
    return true;
  },

  // 验证是否是身份证号
  isIdNo(num) {
    if (!(/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(num))) {
      return false;
    }
    return true;
  }

}