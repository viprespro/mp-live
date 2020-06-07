const api = require('../../utils/api-tp.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    liveList: [],
    pageIndex: 1,
    hasMore: true,
    reload: false,
    pageSize: 10,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opts) {
    console.log(opts)
    if(opts.keywords) {
      let { keywords } = opts
      this.setData({ keywords })
      this.getList(keywords)
    }
  },

  navDetail(e) {
    if (api.isLogin(this)) {
      let temp = e.currentTarget.dataset
      let flag = temp.live
      if (!flag) {
        app.msg('当前未开播')
      } else {
        let number = temp.number
        let like = temp.like
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/live-detail/live-detail?number=${number}&like=${like}`,
          })
        }, 200)
      }
    }
  },

  // 获取直播列表
  getList() {
    let data = this.data
    if (!data.hasMore) return
    let token = wx.getStorageSync('token')
    wx.showLoading({
      title: '加载中...',
    })
    api.get({
      url: '/wxsmall/Live/getList',
      data: {
        token,
        page: data.pageIndex++,
        pagesize: data.pageSize,
        keywords: data.keywords
      },
      success: res => {
        console.log(res)
        if (data.pageIndex == 2 && !data.reload) {
          this.setData({ showEmpty: true })
        }

        res = res.data
        for (let i in res) {
          res[i].like = this.getRandomNumber()
        }
        let len = res.length
        let flag = false
        let emptyFlag = false
        if (!len && data.pageIndex == 2) { // 空数据
          emptyFlag = true
        }

        if (len < data.pageSize) { // 没有更多数据
          flag = true
        }

        this.setData({
          liveList: data.reload ? res : data.liveList.concat(res),
          hasMore: flag ? false : true,
          reload: false,
          showEmpty: emptyFlag ? true : false
        })
      }
    })
  },

  getRandomNumber() {
    let number = Math.floor(Math.random() * 15000)
    return number
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
    this.getList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})