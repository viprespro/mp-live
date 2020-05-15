const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 0,
    pageIndex: 0,
    pageSize: 10,
    goodsList: [],
    hasMore: true,
    t: 1, //标志排序的
    t1: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    console.log(ops)
    if (ops.integral) {
      this.setData({
        integral: ops.integral
      })
    }
    this.getGoodsList();
  },


  /**
   * 排序逻辑
   */
  navactive: function(e) {
    var that = this;
    that.setData({
      sort_sale_sanjiao_flag: null,
    })

    var act = e.target.dataset.act;
    that.setData({
      active: act,
      pageIndex: 0,
      productsList: [],
      hasMore: true
    })
    var priceOrder = '';
    var t = that.data.t; // 默认为1
    var n = t + 1;
    // console.log(n); // n为奇数 往上  n为偶数 往下 默认往下

    if (n % 2 > 0) {
      priceOrder = 'asc';
      this.setData({
        sort_order_sanjiao_flag: "asc", //升序
        type: 2, // 传2表升序,
        t: n,
      })
    } else {
      priceOrder = 'desc';
      this.setData({
        sort_order_sanjiao_flag: "desc", //降序
        type: 1,
        t: n
      })
    }
    that.getGoodsList();
  },
  navactive1: function(e) {
    var that = this;
    that.setData({
      sort_order_sanjiao_flag: null,
    })

    var act = e.target.dataset.act;
    that.setData({
      active: act,
      pageIndex: 0,
      productsList: [],
      hasMore: true
    })

    var salesOrder = '';
    var t = that.data.t1;
    var n = t + 1;
    if (n % 2 > 0) {
      salesOrder = 'asc';
      this.setData({
        sort_sale_sanjiao_flag: "asc",
        type: 3,
        t1: n
      })
    } else {
      salesOrder = 'desc';
      this.setData({
        sort_sale_sanjiao_flag: "desc",
        type: 4,
        t1: n
      })
    }
    that.getGoodsList();
  },

  /**
   * 获取商品列表
   */
  getGoodsList() {
    let rep = this.data;
    if (!rep.hasMore) return;
    wx.showLoading({
      title: '加载中...',
    })
    api.post({
      url: '/wxsmall/Goods/getGoodsList',
      data: {
        token: rep.token,
        page: ++rep.pageIndex,
        row: rep.pageSize,
        is_integral: 1,
        type: rep.type ? rep.type : 1 // 1默认人气倒叙获取
      },
      success: (res) => {
        console.log(res)
        this.setData({
          goodsList: res.data || []
        })
      }
    })
  },

  /**
   * 立即兑换
   */
  exchange: function(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + id, // 标识是从兑换过来的
    })
  },

  alertSort: function(e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      status: index
    })
  },

  goDetail: function() {
    wx.navigateTo({
      url: '/packageA/pages/point-detail/index?integral=' + this.data.integral,
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