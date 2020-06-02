const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData()
  },

  loadData() {
    let token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/User/myMaster',
      method: 'GET',
      data: {
        token
      },
      success: res => {
        console.log(res)
        if(res.data.length == 0) {
          wx.showToast({
            title: '无推荐人',
            icon: 'none',
            duration: 1500
          })
          setTimeout(() => {
            wx.navigateBack({ delta: 1 })
          },1500)
        }else{
          this.setData({ info: res.data })
        }
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