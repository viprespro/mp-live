const api = require('../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cell_val: '',
    pwd_val: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  backWxLogin() {
    wx.navigateBack({
      delta: 1
    })
  },

  navRegister() {
    let url = `/pages/register/register`
    wx.navigateTo({
      url,
    })
  },

  // 点击登录
  loginTap() {
    let data = this.data
    let flag = false
    let hints = ''
    if (!data.cell_val) {
      hints = '手机号不能为空'
    } else if (!api.isPhoneNo(data.cell_val)) {
      hints = '亲！手机号输入有误'
    } else if (!data.pwd_val) {
      hints = '密码不能为空'
    } else if (data.pwd_val.length < 6 || data.pwd_val.length > 20) {
      hints = '密码长度在为6-20位'
    } else {
      flag = true
    }
    if (!flag) {
      wx.showToast({
        title: hints,
        icon: 'none',
        duration: 1500,
        mask: true
      })
      return
    } else { // 验证通过
      api.post({
        url: '/wxsmall/Login/mobileLogin',
        data: {
          mobile: data.cell_val,
          password: data.pwd_val
        },
        success: res => {
          console.log(res)
          res = res.data
          wx.setStorageSync('token', res.token)
          wx.showToast({
            title: '登录成功',
            icon: 'none',
            duration: 1500,
            mask: true
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/live/live',
            })
          }, 1500)
        }
      })
    }
  },

  bindBlur(e) {
    let val = e.detail.value
    if (val && !api.isPhoneNo(val)) {
      wx.showToast({
        title: '亲！手机号输入有误',
        icon: 'none',
        duration: 1500,
        mask: true
      })
    }
  },

  bindCell(e) {
    let cell_val = e.detail.value
    this.setData({
      cell_val
    })
  },

  bindPwd(e) {
    let pwd_val = e.detail.value
    this.setData({
      pwd_val
    })
  },

  onReady: function() {
    wx.hideShareMenu()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})