// pages/check-orders/index.js
const api = require('../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nowstatus: 0, //默认选中的是全部
    orderList: [], //订单列表
    pageIndex: 0,
    pageSize: 5,
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.nowstatus) {
      this.setData({
        nowstatus: options.nowstatus
      })
    }
  },

  /**
   * 去评价
   */
  makeComment(e) {
    console.log(e)
    let temp = e.currentTarget.dataset;
    let goods_id = temp.id;
    let order_id = temp.orderid;
    let goods_spec_id = temp.specid;
    let is_comment = temp.is_comment;

    if (!is_comment) { // 未评价过的
      wx.navigateTo({
        url: '/packageA/pages/post-comment/index?goods_id=' + goods_id + '&order_id=' + order_id + '&goods_spec_id=' + goods_spec_id,
      })
    }

  },

  /**
   * 再次购买
   */
  buyAgain(e) {
    let id = e.currentTarget.dataset.id,
      rep = this.data
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + id,
    })
  },

  /**
   * 确认收货
   */
  confirmReceipt(e) {
    let id = e.currentTarget.dataset.id,
      rep = this.data,
      that = this
    api.post({
      url: '/wxsmall/Order/confirmOrder',
      data: {
        token: rep.token,
        order_id: id
      },
      success: (res) => {
        console.log(res)
        wx.showToast({
          title: '收货成功',
          icon: 'success',
          duration: 1500,
          success(res) {
            let arr = rep.orderList
            for (let i in arr) {
              if (id == arr[i].id) {
                arr.splice(i, 1)
              }
            }
            that.setData({
              orderList: arr
            })
          }
        })
      }
    })
  },

  delOrder: function(e) {
    console.log(e)
    let that = this
    let id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '将要删除此订单吗？',
      success(res) {
        if (res.confirm) {
          api.post({
            url: '/wxsmall/Order/delOrder',
            data: {
              token: that.data.token,
              order_id: id
            },
            success: (res) => {
              wx.showToast({
                title: '删除成功',
                icon: 'none',
                duration: 1500
              })

              let arr = that.data.orderList
              for (let i in arr) {
                if (arr[i].id == id) {
                  arr.splice(i, 1);
                }
              }

              that.setData({
                orderList: arr
              })
            }
          })
        }
      }
    })
  },

  goOrderDetail: function(e) {
    let num = e.currentTarget.dataset.num
    wx.navigateTo({
      url: '/pages/order-detail/index?num=' + num,
    })
  },

  statusClick: function(e) {
    let status = e.currentTarget.dataset.show
    if (status == this.data.nowstatus) return;
    this.setData({
      nowstatus: status,
      orderList: [],
      pageIndex: 0,
      hasMore: true
    })
    this.getDiffSatusOrders();
  },

  getDiffSatusOrders: function() {
    let rep = this.data
    if (!rep.hasMore) return;
    // wx.showLoading({
    //   title: '加载中...',
    // })
    api.post({
      url: '/wxsmall/Order/getOrderlist',
      data: {
        token: rep.token,
        page: ++rep.pageIndex,
        row: rep.pageSize,
        type: rep.nowstatus
      },
      success: (res) => {
        console.log(res)
        if (res.data.length < rep.pageSize) {
          this.setData({
            hasMore: false
          })
        }
        let newList = rep.orderList.concat(res.data)
        this.setData({
          orderList: newList
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
    api.isLogin(this);
    this.setData({
      pageIndex: 0,
      orderList: [],
      hasMore: true
    })
    this.getDiffSatusOrders();
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
    setTimeout(()=>{
      this.getDiffSatusOrders();
    },200)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})