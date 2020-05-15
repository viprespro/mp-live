// pages/logistics/logistics.js
const api = require('../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    api.isLogin(this);
    if (ops.orderId) {
      this.setData({
        orderId: ops.orderId
      })
    }

    this.getLogisticsList();
  },


  getLogisticsList() {
    let rep = this.data
    api.post({
      url: '/wxsmall/Order/getExpress',
      data: {
        token: rep.token,
        order_id: rep.orderId
      },
      success: (res) => {
        console.log(res)
        this.setData({
          logisticsList: res.data.data || []
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})