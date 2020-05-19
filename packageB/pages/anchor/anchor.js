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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init()
  },

  init() {
    this.getList()
  },

  getList() {
    let { hasMore, pageIndex, pageSize, list } = this.data
    if(!hasMore) return;
    const token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/live/myUserLive',
      data: {
        token,
        page: pageIndex,
        pagesize: pageSize
      },
      success: res => {
        console.log(res)
        res = res.data
        const len = res.length
        let moreFlag = true
        if(len < pageSize) {
          moreFlag = false
        }
        this.setData({ hasMore: moreFlag, list: [...list].concat(res), pageIndex: pageIndex +1})
      }
    })
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getList()
  },

})