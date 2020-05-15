// pages/sort-column/index.js
const api = require('../../utils/api-tp.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    t: 1, //标志排序的
    t1: 1,
    design_sign: 0, // 如果为1 则显示的是设计方案的栏目分类
    pageIndex: 0,
    pageSize: 10,
    hasMore: true,
    productsList: [],
    navHeight: app.globalData.CustomBar
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    if (options.categoryId) {
      this.setData({
        category_id: options.categoryId
      })
    }

    // 搜索过来的
    if (options.keywords) {
      this.setData({
        keyword: options.keywords
      })
    }

    this.getGoodsList();
  },

  tapCancle(e) {
    this.setData({ inputValue: '' })
  }, 

  inputSearch(e) {
    let { value } = e.detail
    this.setData({ keyword: value, hasMore: true, pageIndex: 0, productsList:[],inputValue: '' } )
    this.getGoodsList()
  },

  goDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + id,
    })
  },

  getGoodsList: function() {
    let rep = this.data,
      type = rep.type
    if (!rep.hasMore) return;
    wx.showLoading({
      title: '加载中...',
    })
    api.post({
      data: {
        page: ++this.data.pageIndex,
        row: this.data.pageSize,
        keywords: rep.keyword ? rep.keyword : '',
        category_id: rep.category_id ? rep.category_id : '',
        type: type ? type : ''
      },
      url: '/wxsmall/Goods/getGoodsList',
      success: (res) => {
        console.log(res)
        if (res.data.length < this.data.pageSize) {
          // 说明已经没有更多的数据了
          this.setData({
            hasMore: false
          })
        }

        let newList = this.data.productsList.concat(res.data);
        this.setData({
          productsList: newList
        })
      }
    })
  },

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
    this.getGoodsList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})