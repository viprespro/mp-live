const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 0,
    pageSize: 10,
    prenticeList: [],
    hasMore: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    api.isLogin(this);
    this.getPrenticeList();
  },

  textCopy() {
    wx.setClipboardData({
      data: this.data.pageInfo.invite_code,
      success: function(res) {
        // console.log(res)
      }
    });
  },

  getPrenticeList() {
    let rep = this.data;
    if (!rep.hasMore) return;
    api.post({
      url: '/wxsmall/User/UserApprentice',
      data: {
        token: rep.token,
        page: ++rep.pageIndex,
        row: rep.pageSize
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
          prenticeList: rep.prenticeList.concat(ret),
          pageInfo: res.data
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
    this.getPrenticeList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})