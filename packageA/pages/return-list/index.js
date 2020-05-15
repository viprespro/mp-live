const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    size: 10,
    more: true,
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    api.isLogin(this);
    this.getRefundList();
  },


  /**
   * 退款列表
   */
  getRefundList() {
    let temp = this.data
    if (!temp.more) return
    api.post({
      url: '/wxsmall/Refund/getRefundList',
      data: {
        token: temp.token,
        page: ++temp.index,
        rows: temp.size
      },
      success: (res) => {
        console.log(res)
        res = res.data
        if (res.length < temp.size) {
          this.setData({
            more: false
          })
        }
        this.setData({
          list: temp.list.concat(res)
        })
      }
    })
  },

  /**
   * 查看详情
   */
  checkDetail(e) {
    wx.navigateTo({
      url: '/packageA/pages/return-detail/index?refund_id=' + e.currentTarget.dataset.id,
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
    this.getRefundList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})