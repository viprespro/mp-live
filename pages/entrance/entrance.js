// pages/entrance/entrance.js
const app = getApp();
const Config = require('../../config.js')
Page({

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.wxLogin();
  },

  // 微信小程序登录
  wxLogin() {
    wx.login({
      success: (res) => {
        wx.getUserInfo({ // 获取用户的加密数据
          success(userRes) {
            let encryptedData = userRes.encryptedData;
            let iv = userRes.iv;
            if (res.code) {
              wx.request({
                url: `${Config.HTTP_REQUEST_URL}/wxsmall/Login/getCode`,
                method: "POST",
                data: {
                  code: res.code,
                  version: 2, // 老版本
                  encryptData: encryptedData, 
                  iv: iv,
                  invite_code: app.globalData.invite_code
                },
                success: (codeRes) => {
                  // console.log(codeRes)
                  let data = codeRes.data
                  if (data.code == 0) { 
                    let token = data.data.token
                    wx.setStorageSync('token', token)
                    console.log(app.globalData.openPages)
                    if (app.globalData.openPages != '' && app.globalData.openPages != undefined) { // 分享的页面
                      wx.reLaunch({
                        url: app.globalData.openPages,
                      })
                    } else {
                      wx.reLaunch({
                        url: '/pages/live/live',
                      })
                    }
                  } else {
                    wx.showModal({
                      title: '提示',
                      content: codeRes.data.message,
                    })
                  }
                },
                complete() {
                  wx.hideLoading()
                },  
              })
            }
          }
        })
      },
    })
  },
})