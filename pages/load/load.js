const api = require('../../utils/api-tp.js')
const Config = require('../../config.js')
var app = getApp();
Page({

  data: {
    showAuth:'',
  },

  onLoad: function(e) {
    console.log(e)
    //  直播间分享
    if(e.number && e.invite_code) {
      let { number, invite_code} = e
      app.globalData.invite_code = invite_code
      app.globalData.openPages = `/pages/live-detail/live-detail?number=${number}&backHomeFlag=true`
    }
    // 商品详情商品分享
    if(e.id && e.invite_code) {
      let { id, invite_code } = e
      app.globalData.invite_code = invite_code
      app.globalData.openPages = `/pages/product-detail/index?id=${id}`
    }

    // 纯粹邀请绑定关系 
    if(e.invite_code && !e.hasOwnProperty('number')) {
      let { invite_code } = e
      app.globalData.invite_code = invite_code
      app.globalData.openPages = `/pages/live/live`
    }

    this.getSetting()
  },

  // 判断用户是否授权
  getSetting: function () {
    const that = this;
    wx.getSetting({
      success(res) { // 用户没有授权过
        if (!res.authSetting['scope.userInfo']) {
          that.setData({ showAuth: true,})
          return;
        }
        // 用户已经授权并且登录状态
        if(wx.getStorageSync('token')) {
          const url = app.globalData.openPages || `/pages/live/live`
          wx.reLaunch({ url })
        }else { // 去登陆
          that.wxLogin()
        }
      }
    })
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
                    const { token, invite_code } = data.data
                    wx.setStorageSync('token', token)
                    wx.setStorageSync('invite_code', invite_code)
                    app.globalData.invite_code = invite_code
                    // console.log(app.globalData.openPages)
                    const url = app.globalData.openPages || `/pages/live/live`
                    wx.reLaunch({ url })  // 防止可能是tabbar
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
            const url = app.globalData.openPages || `/pages/live/live`
            wx.reLaunch({ url })
          }
        }
      })
      return;
    }
    this.wxLogin()
  },
})