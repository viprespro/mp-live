// packageA/pages/search/search.js
const api = require('../../utils/api-tp.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    inputValue: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  bindInput: function (e) {
    let keywords = e.detail.value
    this.setData({
      inputVal: keywords
    })
  },

  /**
   * 搜索框的搜索
   */
  inputSearch: function (e) {
    let key = this.data.inputVal
    if (!key) {
      return;
    }
    wx.navigateTo({
      url: '/pages/search-live-list/index?keywords=' + key,
    })
    this.setData({ inputValue: '' })

  },

  /**
   * 执行搜索
   */
  search: function (e) {
    console.log(e)
    let key = e.currentTarget.dataset.key
    wx.navigateTo({
      url: '',
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