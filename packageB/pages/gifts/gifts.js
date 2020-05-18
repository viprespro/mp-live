const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1,
    pageSize: 10,
    hasMore: true,
    list: [],
    showDefault: false // 显示缺省数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
  },

  tapItem() {
    wx.showModal({
      title: '友情提示',
      content: '该领取方式为线下领取，请与管理员联系。',
      showCancel: false,
      confirmColor: '#B2523F',
      confirmText: '我知道了',
    })
  },


  getList() {
    let { hasMore, pageIndex, pageSize, list } = this.data
    if(!hasMore) return
    let token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/live/myGift',
      data: {
        token,
        page: pageIndex,
        pagesize: pageSize
      },
      success: res => {
        console.log(res)
        res = res.data
        let len = res.length
        let moreFlag = true
        if(!len && pageIndex == 1) {
          // 数据
          this.setData({ showDefault: true })
          return;
        }
        this.setData({ showDefault: false })
        if(len < pageSize) {
          moreFlag = false
        }
        this.setData({ list: list.concat(res), pageIndex: pageIndex + 1, hasMore: moreFlag })
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