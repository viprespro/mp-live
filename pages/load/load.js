const api = require('../../utils/api-tp.js')
var app = getApp();
Page({
  //授权登录 
  getUserInfo: function(e) {
    let rep = e.detail;
    app.globalData.userInfo = rep.userInfo;
    let that = this;
    if (!rep.userInfo) {
      wx.showModal({
        title: '提示',
        content: '您已拒绝授权!',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            let page = app.globalData.openPages
            if (page){
              wx.reLaunch({
                url: page
              })
            }else {
              wx.reLaunch({
                url: '/pages/live/live',
              })
            }
          }
        }
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/entrance/entrance',
    })
  },
})