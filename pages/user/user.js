// pages/user/user.js
var api = require("../../utils/api-tp.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusH: app.globalData.StatusBar,
    navHeight: app.globalData.CustomBar,
    type: '', // 身份
    reload: false, // 是否是下拉刷新的
    opacity: 0,
    loading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
  },

  toExplain() {
    let url = `/packageB/pages/explain/explain`
    wx.navigateTo({ url })
  },

  // 我的上级
  tapToSuper() {
    let url = `/packageB/pages/super/super`
    wx.navigateTo({ url })
  },

  // 我的主播
  tapToAnchor() {
    let url = `/packageB/pages/anchor/anchor`
    wx.navigateTo({ url })
  },

  onPageScroll(e) {
    let scroll = e.scrollTop / 64
    scroll = scroll > 1 ? 1 : scroll
    this.setData({ opacity: scroll })
  },

  /**
   * 下拉刷新操作
   */
  onPullDownRefresh: function() {
    this.setData({ reload: true })
    this.getUserMsg()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    },200)
  },

  handleLoginout() {
    wx.showLoading({
      title: '退出中...',
    })
    wx.clearStorageSync()
    setTimeout(() => {
      let url = `/pages/before-login/before-login`
      wx.reLaunch({url})
      wx.hideLoading()
    },200)
  },

  toProfile() {
    let url = `/pages/my-profile/index`
    wx.navigateTo({url})
  },

  // 主播入口点击
  navLive() {
    let url = `/packageB/pages/anchor-entrance/anchor-entrance`
    wx.navigateTo({
      url,
    })
  },

  withdraw: function() {
    wx.navigateTo({
      url: '/packageA/pages/withdraw-page/index?balance=' + this.data.userMsg.balance,
    })
  },

  goPoint: function() {
    wx.navigateTo({
      url: '/packageA/pages/my-point/index?integral=' + this.data.integral,
    })
  },

  setTouchMove: function(e) {
    var that = this;
    if (e.touches[0].clientY < 500 && e.touches[0].clientY > 0) {
      that.setData({
        top: e.touches[0].clientY
      })
    }
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
    if (api.isLogin(this)) {
      this.getUserMsg();
    }
  },

  /**
   * 获取用户信息
   */
  getUserMsg: function() {
    var that = this;
    let { reload } = that.data
    if(reload) {
      wx.showLoading({
        title: '加载中...',
      })
      this.setData({ reload: false })
    } 
    api.post({
      url: '/wxsmall/User/getUserInfo',
      data: {
        token: that.data.token
      },
      success: function(res) {
        console.log(res)
        var msg = res.data
        that.setData({ loading: false })
        app.globalData.invite_code = msg.invite_code;
        app.globalData.live_status = msg.live_status
        // console.log(app.globalData.userInfo)
        if (msg.avatar == null) {
          if (app.globalData.userInfo == null) {
            wx.getSetting({
              success(res) { // 用户没有授权过
                if (!res.authSetting['scope.userInfo']) {
                  return wx.navigateTo({
                    url: '/pages/load/load',
                  })
                } else {
                  wx.getUserInfo({
                    success: res => {
                      app.globalData.userInfo = res.userInfo
                      msg.avatar = app.globalData.userInfo.avatarUrl
                      if (msg.nickname == null) {
                        msg.nickname = app.globalData.userInfo.nickName
                      }
                      that.setData({
                        userMsg: msg
                      })
                    }
                  })
                }
              }
            })

          } else {
            msg.avatar = app.globalData.userInfo.avatarUrl
            if (msg.nickname == null) {
              msg.nickname = app.globalData.userInfo.nickName
            }
          }

        }

        that.setData({
          userMsg: msg,
          type: msg.type,
          integral: msg.integral
        })
      },
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '好物可播',
      path: '/pages/live/live',
      success: (res) => {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        })
      }
    }
  }
})