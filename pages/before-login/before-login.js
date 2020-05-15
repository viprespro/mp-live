// pages/before-login/before-login.js
Page({

  /**
   * 用户协议
   */
  toAgreement() {
    let url = '/pages/user-agreement/index'
    wx.navigateTo({
      url,
    })
  },

  /**
   * 点击微信一键登录
   */
  loginTap() {
    wx.getSetting({
      success(res) { // 用户没有授权过
        if (!res.authSetting['scope.userInfo']) {
          wx.redirectTo({
            url: '/pages/load/load',
          })
          return;
        }
        wx.showLoading({
          title: '正在登陆...',
        })
        setTimeout(() => {
          wx.navigateTo({ // 用户已经授权
            url: '/pages/entrance/entrance',
          })
        }, 200)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.hideShareMenu()
  },



 
})