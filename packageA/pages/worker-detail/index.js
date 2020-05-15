const api = require('../../../utils/api-tp.js')
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    worker_info: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    that = this;
    api.isLogin(this);
    if (ops.id) {
      this.setData({
        worker_id: ops.id
      })
    }
    this.getWorkerInfo();
  },


  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  // 提交预约
  postInfo: function(e) {
    let that = this;
    let rep = e.detail.value;
    api.post({
      url: '/wxsmall/User/preBuilding',
      data: {
        token: this.data.token,
        room: rep.room,
        hall: rep.hall,
        toilet: rep.toilet,
        region: rep.homeName,
        area: rep.homeArea,
        realname: rep.yourName,
        mobile: rep.yourPhone,
        type: 3, // 预约工人
        worker_id: that.data.worker_id
      },
      success: (res) => {
        if (res.code == 0) {
          that.showModal(e);
          that.setData({
            price: res.data.front_price,
            order_id: res.data.pre_order_id
          });
        }
      }
    })
  },

  // 支付定金
  payOrder: () => {
    api.post({
      url: '/wxsmall/User/payPreOrder',
      data: {
        token: wx.getStorageSync('token'),
        pre_order_id: that.data.order_id
      },
      success: (res) => {
        if (res.code == 0) {
          // 调用支付
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.package,
            signType: res.data.data.signType,
            paySign: res.data.data.paySign,
            success(res) {
              that.hideModal();
              wx.showToast({
                title: '预约成功！',
              })
            },
            fail(res) {
              console.log(res);
            }
          })
        }
      }
    })
  },

  /**
   * 获取用户信息
   */
  getWorkerInfo: function() {
    let rep = this.data
    api.post({
      url: '/wxsmall/Worker/workerInfo',
      data: {
        token: rep.token,
        worker_id: rep.worker_id
      },
      success: (res) => {
        console.log(res)
        this.setData({
          worker_info: res.data
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