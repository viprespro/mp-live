// pages/home/home.js
const app = getApp()
const api = require('../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: false,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    // 采用衔接滑动
    circular: true,
    bannerList: [],
    proList: [],
    brandList: [],
    location: "",
    seckillList: [], //秒杀列表
    newList: [], // 新品上架
    groupList: [], // 超值拼团
    brandList: [], // 品牌列表
    brandIndex: 0,
    brandSize: 12,
    hasMore: true,
    packageList: [], //一键套餐包
    designList: [], // 全屋设计
    typeList: [], //工人类别,
    articleList: [], // 设计圈文章列表
    cart_num: 0, // 购物车数量
    swiperCurIndex: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...'
    })
    this.getBanner();
    this.getSeckill();
    this.getNew();
  },

  navSortPage() {
    const url = `/pages/sort/sort`
    wx.navigateTo({ url })
  },

  bindChange(e) {
    let current = e.detail.current
    this.setData({
      swiperCurIndex: current + 1
    })
  },

  /**
   * 秒杀专区 查看更多
   */
  seckillMore: function() {
    wx.navigateTo({
      url: '/packageA/pages/seckill-list/index',
    })
  },

  newMore: function() {
    wx.navigateTo({
      url: '/packageA/pages/new-product-list/index',
    })
  },

  /**
   * 新品上架
   */
  getNew: function() {
    api.post({
      url: '/wxsmall/index/getRecommendGoods',
      success: (res) => {
        console.log(res)
        this.setData({
          newList: res.data || []
        })
      }
    })
  },

  getSeckill: function() {
    api.post({
      url: '/wxsmall/index/getSecKill',
      success: (res) => {
        console.log(res)
        this.setData({
          seckillList: res.data || []
        })
      }
    })
  },
  getNav: function() {
    wx.showLoading({
      title: '加载中...',
    })
    api.post({
      url: '/wxsmall/Index/getNav',
      success: (res) => {
        // console.log(res)
        this.setData({
          navList: res.data
        })
      }
    })
  },
  getBanner: function() {
    api.post({
      url: '/wxsmall/Index/getFlash',
      success: (res) => {
        // console.log(res)
        this.setData({
          bannerList: res.data
        })
      }
    })
  },
  goDetail: function(e) {
    let id = e.currentTarget.dataset.id
    if (id == 0) {
      return;
    }
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + id,
    })
  },

  goCheck: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + id,
    })
  },


  getCartCount() {
    let token = wx.getStorageSync('token')
    api.post({
      url: '/wxsmall/Cart/getCount',
      data: {
        token
      },
      success: res => {
        // console.log(res)
        this.setData({
          cart_num: res.data.count
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
    // 登录情况下
    if (app.hasLogin()){
      this.getCartCount()
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.onLoad();
    setTimeout(() => {
      wx.stopPullDownRefresh()
    },500)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      title: app.globalData.indexTitle,
      path: app.globalData.indexPage,
      success: (res) => {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        })
      }
    }
  }
})