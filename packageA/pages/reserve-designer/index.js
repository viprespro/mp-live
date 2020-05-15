const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    TabCur: 0,
    tabsList: [
      '收到的预约',
      '已完成的预约'
    ],
    pageIndex: 0,
    pageSize: 10,
    reserveList: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    api.isLogin(this);
    this.getReserveList();
  },

  checkDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/packageA/pages/reserve-designer-detail/index?id=' + id,
    })
  },

  getReserveList() {
    let rep = this.data;
    if (!rep.hasMore) return;
    api.post({
      url: '/wxsmall/Designer/getDesignerPreOrder',
      data: {
        token: rep.token,
        page: ++rep.pageIndex,
        row: rep.pageSize,
        type: rep.TabCur
      },
      success: (res) => {
        console.log(res)
        let ret = res.data;
        if (ret.length < rep.pageSize) {
          this.setData({
            hasMore: false
          })
        }
        this.setData({
          reserveList: rep.reserveList.concat(ret)
        })
      }
    })
  },

  tabSelect(e) {
    let index = e.currentTarget.dataset.id;
    if (index == this.data.TabCur) return;
    this.setData({
      pageIndex: 0,
      reserveList: [],
      hasMore: true,
      TabCur: index,
    })

    this.getReserveList();
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
    this.getReserveList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})