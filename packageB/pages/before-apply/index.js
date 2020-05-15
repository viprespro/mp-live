const app = getApp()
const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navHeight: app.globalData.CustomBar,
    live_status: '', // 0 可申请 1审核中  3直播封禁  4 重复申请
    reason: '', // 驳回原因
    hasNaved: false, // 是否已经跳转过了
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.load()
  },

  handleTap(e) {
    let { live_status, reason, hasNaved } = this.data
    if(live_status == 1) { // 审核中
      wx.navigateTo({
        url: '/packageB/pages/apply-status/index?status=' + live_status,
      })
      return;
    }
    if (reason && !hasNaved) { // 如果已经跳转过了
      wx.navigateTo({
        url: '/packageB/pages/apply-status/index?status=' + 2 + '&reason=' + reason,
      })
      this.setData({ hasNaved: true})
      return;
    }

    let { type, url } = e.currentTarget.dataset
    wx.navigateTo({
      url
    })
  },

  load() {
    const token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/User/getUserInfo',
      data: {
        token
      },
      success: res => {
        console.log(res)
        let obj = res.data
        let { live_status } = obj
        let reason
        if (obj.hasOwnProperty('reason')) { // 说明
          reason = obj.reason
        }
        this.setData({ live_status, reason})
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})