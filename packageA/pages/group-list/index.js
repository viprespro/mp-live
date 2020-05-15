// packageA/pages/group-list/index.js
const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupList: [],
    page: 0,
    size: 10,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getGroupList();
  },

  joinGroup: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + id + '&group_param=' + 1,
    })
  },

  getGroupList: function() {
    let rep = this.data
    if (!rep.hasMore) return;
    api.post({
      url: '/wxsmall/Group/getList',
      data: {
        page: ++rep.page,
        row: rep.size
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        if (ret.length < rep.size) {
          this.setData({
            hasMore: false
          })
        }

        let newList = rep.groupList.concat(ret)
        this.setData({
          groupList: newList || []
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
    this.getGroupList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})