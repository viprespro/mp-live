// pages/order-detail/index.js
const api = require('../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '', //订单id
    paid_status: 0, // 未支付状态不显示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    api.isLogin(this);
    console.log(options)
    if (options.num) {
      this.setData({
        orderId: options.num
      })
    }

    this.getOrderDetail();

  },

  /**
   * 评价
   */
  commentOpt(e){
    let rep = e.currentTarget.dataset
    let id = rep.id
    let spec_id = rep.specid
    let img = rep.img
    wx.redirectTo({
      url: '/packageA/pages/post-comment/index?order_id=' + this.data.orderId + '&goods_id=' + id + '&goods_spec_id=' + spec_id + '&goods_img=' + img ,
    })
  },

  /**
   * 退换
   */
  returnOpt(e){
    // console.log(123)
    wx.navigateTo({
      url: '/packageA/pages/return-apply/index?order_goods_id=' + e.currentTarget.dataset.id + '&order_id=' + this.data.orderId,
    })
  },

  /**
   * 取消订单
   */
  cancleOrder: function(e) {
    let rep = this.data,
      obj = rep.orderInfo;
    let status = e.currentTarget.dataset.status;
    if (status == 5) { //如果已经取消
      return;
    }
    api.post({
      url: '/wxsmall/Order/cancelOrder', //接口没好
      data: {
        token: rep.token,
        order_id: rep.orderId
      },
      success: (res) => {
        wx.showToast({
          title: '订单已取消',
          icon: 'none',
          duration: 2000
        })

        obj.status = 5;
        this.setData({
          orderInfo: obj
        })
      }
    })
  },

  goDetail() {
    wx.navigateTo({
      url: '/pages/logistics/logistics?orderId=' + this.data.orderId,
    })
  },

  /**
   * 获取物流信息
   */
  getLogisticsList() {
    let rep = this.data
    api.post({
      url: "/wxsmall/Order/getExpress",
      data: {
        token: rep.token,
        order_id: rep.orderId
      },
      success: (res) => {
        console.log(res)
        this.setData({
          logisticsList: res.data.data || []
        })
      }
    })
  },

  getOrderDetail: function() {
    api.post({
      url: '/wxsmall/Order/getPayOrderInfo',
      data: {
        token: this.data.token,
        order_id: this.data.orderId,
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        // 根据当前状态判断是否需要查询物流信息 待付款的时候不需要 待发货也不需要
        let temp = ret.order_info
        if (temp.pay_status == 0 || temp.pay_status == 1 && temp.status == 0) { //未付款或未发货不需要查询物流信息

        } else {
          this.getLogisticsList();
          this.setData({
            paid_status: 1
          })
        }
        this.setData({
          addressInfo: ret.address_info,
          goodsList: ret.goods_data,
          orderInfo: ret.order_info
        })
      }
    })
  },

  /**
   * 立即支付
   */
  nowPay() {
    let orderId = this.data.orderId
    api.post({
      url: '/wxsmall/Order/payOrder',
      data: {
        order_id: orderId,
        token: this.data.token,
        pay_type: 1
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        wx.requestPayment({
          timeStamp: ret.data.timeStamp,
          nonceStr: ret.data.nonceStr,
          package: ret.data.package,
          signType: 'MD5',
          paySign: ret.data.paySign,
          success(res) {
            wx.showToast({
              title: '支付成功',
              icon: 'success',
              duration: 1500
            })

            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/order-detail/index?num=' + orderId,
              })
            }, 1500)
          },
          fail(res) {
            wx.showToast({
              icon: "loading",
              title: '支付取消',
            })

            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/order-detail/index?num=' + orderId,
              })
            }, 1500)
          }
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