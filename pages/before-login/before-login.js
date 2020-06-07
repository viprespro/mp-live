// pages/before-login/before-login.js
Page({

  // 前往用户协议
  toAgreement() {
    let url = '/pages/user-agreement/index'
    wx.navigateTo({
      url,
    })
  },

  // 一键微信登录
  handleWxLogin() {
    wx.showLoading({
      title: '正在登陆...',
      mask: true,
    })
    wx.redirectTo({
      url: '/pages/load/load',
    })
  },

})