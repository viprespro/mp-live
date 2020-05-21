const api = require('../../../utils/api-tp.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1,
    pageSize: 10,
    hasMore: true,
    list: [],
    showDefault: false, // 显示缺省数据
    notFirst: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
  },

  /**
   * 编辑地址
   */
  editAddress: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({ //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
      url: '/pages/addaddress/addaddress?id=' + id + '&title=' + '编辑地址'
    })
  },

  /**
 * 选择当前收货地址
 */
  selectCurrent: function (e) {
    let id = e.currentTarget.dataset.id
    this.setData({
      addressId: id,
      modalName: null,
    })
    
    wx.showLoading({
      title: '加载中...'
    })
    let { gift_id, list } = this.data
    api.post({
      url: '/wxsmall/live/giftAddress',
      data: {
        token: wx.getStorageSync('token'),
        id: gift_id,
        address_id: id
      },
      success: res => {
        console.log(res)
        if(res.code == 0) {
          // this.getList();
          this.setData({ notFirst: true })
        }
      }
    })
  },

  /**
  * 获取用户地址
  */
  getUserAddress: function () {
    api.post({
      url: '/wxsmall/User/getUserAddress',
      data: {
        token: wx.getStorageSync('token')
      },
      success: (res) => {
        console.log(res)
        this.setData({
          addressArray: res.data
        })
      }
    })
  },

  /**
   * 新增收货地址
   */
  addAddress: function () {
    wx.navigateTo({ 
      url: '/pages/addaddress/addaddress?title=添加地址' 
    })
  },

  showModal(e) {
    let { notFirst } = this.data
    if(notFirst) {
      wx.showModal({
        title: '提示',
        content: '你已选择过地址，最终地址以最后一次选择为准',
        showCancel: false,
        confirmText:'我知道了',
        success: res => {
          if(res.confirm) {

          }
        }
      })
    }
    let { target, id } = e.currentTarget.dataset
    let arr = [...this.data.list]
    if(arr.length) {
      arr.map((item)=> {
        if(item.id == id) {
          if(item.status == 1){
            app.msg('该礼品正在派发中...')
            return;
          }else
          if(item.status == 2) {
            app.msg('该礼品已领取!')
            return;
          }else {
            this.setData({
              modalName: target,
              gift_id: id
            }) 
          }
        }
      })
    }
  },

  hideModal(e) {
    this.setData({
      modalName: null,
      has: true
    })
  },

  getList() {
    let { hasMore, pageIndex, pageSize, list } = this.data
    if(!hasMore) return
    let token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/live/myGift',
      data: {
        token,
        page: pageIndex,
        pagesize: pageSize
      },
      success: res => {
        console.log(res)
        res = res.data
        let len = res.length
        let moreFlag = true
        if(!len && pageIndex == 1) {
          // 数据
          this.setData({ showDefault: true })
        }
        if(len < pageSize) {
          moreFlag = false
        }
        this.setData({ list: list.concat(res), pageIndex: pageIndex + 1, hasMore: moreFlag })
      }
    })
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
    this.getUserAddress()
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})