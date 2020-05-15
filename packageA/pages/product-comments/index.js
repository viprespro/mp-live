const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    starIndex1: 4,
    pageIndex: 0,
    pageSize: 10,
    commentsList: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    api.isLogin(this);
    if (options.goods_id) {
      this.setData({
        goods_id: options.goods_id
      })
    }
    this.getCommentsList();
  },

  getCommentsList() {
    let rep = this.data;
    if (!rep.hasMore) return;
    api.post({
      url: '/wxsmall/Goods_Comment/getGoodsCommentList',
      data: {
        token: rep.token,
        pageIndex: ++rep.pageIndex,
        row: rep.pageSize,
        goods_id: rep.goods_id
      },
      success: (res) => {
        console.log(res)
        let ret = res.data.list;
        if (ret.length < rep.pageSize) {
          this.setData({
            hasMore: false
          })
        }
        this.setData({
          commentsList: rep.commentsList.concat(ret)
        })
      }
    })
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
    this.getCommentsList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})