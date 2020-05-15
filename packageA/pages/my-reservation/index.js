// pages/user/user.js
var api = require("../../../utils/api-tp.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentIndex: 4, //默认选中的第一个'已预约'
    page: 1,
    row: 4,
    list: [],
    ismore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    api.isLogin(this);
  },

  unConfirm(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/yuyue-detail/index?id=' + id,
    })
  },

  /**
   * 定金支付
   */
  depositPay(e) {
    let that = this,
      id = e.currentTarget.dataset.id;
    api.post({
      url: "/wxsmall/User/payPreOrder",
      data: {
        token: that.data.token,
        pre_order_id: id
      },
      success: (res) => {
        console.log(res)
        let ret = res.data.data
        wx.requestPayment({
          timeStamp: ret.timeStamp,
          nonceStr: ret.nonceStr,
          package: ret.package,
          signType: 'MD5',
          paySign: ret.paySign,
          success(res) {
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 1500
            })

            // code here !
            that.getYuYueList();

          },
          fail(res) {
            wx.showToast({
              icon: "loading",
              title: '支付取消',
            })

            // code here!
          }
        })
      }
    })
  },

  /**
   * 尾款支付
   */
  retainagePay(e) {
    console.log(e)
    let that = this,
      id = e.currentTarget.dataset.id;
    api.post({
      url: "/wxsmall/User/payTail",
      data: {
        token: that.data.token,
        pre_order_id: id
      },
      success: (res) => {
        console.log(res)
        let ret = res.data.data
        wx.requestPayment({
          timeStamp: ret.timeStamp,
          nonceStr: ret.nonceStr,
          package: ret.package,
          signType: 'MD5',
          paySign: ret.paySign,
          success(res) {
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 1500
            })

            // code here !
            that.getYuYueList();

          },
          fail(res) {
            wx.showToast({
              icon: "loading",
              title: '支付取消',
            })

            // code here!

          }
        })
      }
    })
  },

  /**
   * 评论
   */
  makeComments: function() {
    wx.navigateTo({
      url: '/packageA/pages/post-comment/index',
    })
  },

  /**
   * 待施工
   */
  unDone: function() {
    wx.navigateTo({
      url: '/pages/yuyue-detail/index',
    })
  },

  sign: function(e) {
    wx.navigateTo({
      url: '/packageA/pages/sign-contract/index?id=' + e.currentTarget.dataset.id,
    })
  },

  withdraw: function() {
    wx.navigateTo({
      url: '/packageA/pages/withdraw-page/index',
    })
  },

  goPoint: function() {
    wx.navigateTo({
      url: '/packageA/pages/my-point/index',
    })
  },

  setTouchMove: function(e) {
    var that = this;
    if (e.touches[0].clientY < 500 && e.touches[0].clientY > 0) {
      that.setData({
        top: e.touches[0].clientY
      })
    }
  },

  /**
   * 前往入驻页
   */
  goSettledPage: function() {
    wx.navigateTo({
      url: '/packageA/pages/settled/settled',
    })
  },

  tabsAlert: function(e) {
    let index = e.currentTarget.dataset.index
    if (index == this.data.currentIndex) return;
    this.setData({
      currentIndex: index,
      page: 1,
      ismore: true,
      list: []
    })
    this.getYuYueList()
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
    this.setData({
      page: 1,
      ismore: true,
      list: []
    })
    this.getYuYueList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.getYuYueList()
  },

  /**
   * 获取用户预约列表
   */
  getYuYueList: function() {
    var that = this;
    var list = that.data.list;
    var page = that.data.page;
    if (!that.data.ismore) {
      return
    }
    wx.showToast({
      title: '加载中',
      icon: 'loading'
    })
    api.post({
      url: '/wxsmall/Order/getPreOrderList',
      data: {
        token: that.data.token,
        page: that.data.page,
        row: that.data.row,
        type: that.data.currentIndex
      },
      success: function(res) {
        console.log(res)
        if (res.data.length < that.data.row) {
          var ismore = false
        } else {
          var ismore = true
          page += 1
        }
        that.setData({
          ismore: ismore,
          page: page,
          list: list.concat(res.data)
        })
        wx.hideToast();
      }
    })

  }
})