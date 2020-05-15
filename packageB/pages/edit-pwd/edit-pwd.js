const app = getApp()
const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navH: app.globalData.CustomBar,
    pwd: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  okTap() {
    let data = this.data
    if (!data.pwd) {
      app.toast('请填写密码')
      return
    } else if (data.pwd.length < 6 || data.pwd.length > 20) {
      app.toast('密码长度为6-20位')
      return
    }
    let token = wx.getStorageSync('token')
    api.post({
      url: '/wxsmall/User/editChPwd',
      data: {
        token,
        password: data.pwd
      },
      success: res => {
        console.log(res)
        wx.showToast({
          title: '密码修改成功',
          icon: 'none',
          duration: 1500,
          mask: true
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    })
  },

  // 绑定输入
  bindPwd(e) {
    this.setData({
      pwd: e.detail.value
    })
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