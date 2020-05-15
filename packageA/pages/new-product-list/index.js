// packageA/pages/new-product-list/index.js
const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 0,
    pageSize: 10,
    newList: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    api.isLogin(this);
    this.getNewList();
  },

  goDetail(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + id,
    })
  },

  /**
   * 获取新品列表
   */
  getNewList() {
    let rep = this.data
    api.pageLoad({
      that: this,
      list: rep.newList,
      status: rep.hasMore,
      size: rep.pageSize
    }, {
      url: '/wxsmall/Goods/getGoodsList',
      data: {
        token: rep.token,
        page: ++rep.pageIndex,
        row: rep.pageSize,
        tag_id: 1 // 新品
      },
      success: (res) => {
        console.log(res)
        this.setData({
          newList: res || []
        })
      }
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
    this.getNewList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})