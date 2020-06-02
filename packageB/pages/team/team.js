 const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 1,
    size: 10,
    list: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init()
  },

  loadData() {
    let { index, size, list, hasMore} = this.data
    if(!hasMore) return
    const data = {
      token: wx.getStorageSync('token'),
      page: index,
      pagesize: size
    }
    api.get({
      url: '/wxsmall/User/myTeams',
      data,
      success: res => {
        console.log(res)
        res = res.data
        let len = res.length
        let moreFlag = true
        if(index == 1 && !len) {
          wx.showToast({
            title: '暂无团队',
            icon: 'none',
            duration: 1500
          })
          setTimeout(() => {
            wx.navigateBack({ delta: 1 })
          },2000)
        }
        if(len < size) {
          moreFlag = false
        }
        this.setData({
          hasMore: moreFlag,
          list: [...list].concat(res),
          index: index + 1
        })
      }
    })
  },

  init() {
    this.loadData()
  },

  /**
   * 触底加载
   */
  onReachBottom() {
    this.loadData()
  }

})