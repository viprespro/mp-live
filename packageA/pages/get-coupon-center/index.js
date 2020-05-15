// packageA/pages/get-coupon-center/index.js
const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 0,
    pageSize: 10,
    couponCenterList: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    api.isLogin(this);
    this.getCouponCenterList();
  },

  /**领取优惠券 */
  getCoupon(e) {
    let id = e.currentTarget.dataset.id,
      rep = this.data,
      arr = rep.couponCenterList;
    api.post({
      url: '/wxsmall/Coupon/userGetCoupon',
      data: {
        token: rep.token,
        coupon_id: id
      },
      success: (res) => {
        console.log(res)
        wx.showToast({
          title: '领取成功',
          icon: ' none',
          duration: 2000
        })

        for (let i in arr) {
          if (arr[i].coupon_id == id) {
            arr[i].available = false
            this.setData({
              couponCenterList: arr
            })
          }
        }
      }
    })
  },

  getCouponCenterList() {
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
    this.getCouponCenterList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})