const api = require('../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    pageIndex: 1,
    pageSize: 10,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getList()
  },

  toDetail(e){
    let url = `/pages/product-detail/index?id=${e.currentTarget.dataset.id}`
    wx.navigateTo({url})
  },

  previewImg(e) {
    let temp = e.currentTarget.dataset
    let src = temp.src
    let list = temp.list
    wx.previewImage({
      current: src,
      urls: list,
    })
  },

  getList() {
    let data = this.data
    if (!data.hasMore) return
    wx.showLoading({
      title: '加载中...',
    })
    api.get({
      url: '/wxsmall/Circle/index',
      data: {
        page: data.pageIndex,
        pagesize: data.pageSize
      },
      success: res => {
        console.log(res)
        res = res.data
        let len = res.length
        let moreFlag = true
        if (!len && data.pageIndex == 1) {
            // 空数组
        }

        if (len < data.pageSize) {
          moreFlag = false
        }
        
        let originalList = [...data.list]
        this.setData({
          list: originalList.concat(res),
          hasMore: moreFlag ? true : false,
          pageIndex: this.pageIndex + 1
        })
      }
    })
  },

  onReachBottom: function() {
    let data = this.data
    if (data.hasMore) {
      this.getList()
    }
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