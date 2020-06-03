const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 0, // 粉丝 0  关注1
    index: 1,
    size: 10,
    list: [],
    hasMore: true,
    title: '我的粉丝'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    if(ops.type ) {
      let titleList = ['我的粉丝', '我的关注']
      this.setData({ type: ops.type, title: titleList[ops.type] })
      if(ops.type == 0) {
        this.load()
      }
      if(ops.type == 1) {
        this.loadF()
      }
    }
  },  

  loadF() {
    let { index, size, hasMore, list } = this.data
    const token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/Live/followList',
      data: {
        token,
        page: index,
        pagesize: size
      },
      success: res => {
        console.log(res)
        res = res.data
        let moreFlag = true
        if (res.length < size) {
          moreFlag = false
        }
        this.setData({
          list: [...list].concat(res),
          index: index + 1,
          hasMore: moreFlag
        })
      }
    })
  },

  // 获取我的粉丝
  load() {
    let { index, size, hasMore, list } = this.data
    const token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/Live/fansList',
      data: {
        token,
        page: index,
        pagesize: size
      },
      success: res => {
        console.log(res)
        res = res.data
        let moreFlag = true
        if(res.length < size) {
          moreFlag = false
        }
        this.setData({
          list: [...list].concat(res),
          index: index + 1,
          hasMore: moreFlag
        })
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.hasMore) {
      let { type } = this.data
      switch(type) {
        case 0: 
          this.load()
          break;
        case 1:
          this.loadF()
          break;
        default: 
          break;
      }
    }
  },

})