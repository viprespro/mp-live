const api = require('../../../utils/api-tp.js')
const app = getApp();
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalName: null,
    designer_info: {}, // 设计师信息
    price: null,
    order_id: null,
    workIndex: 0,
    workSize: 10,
    workHasMore: true,
    workList: []
  },

  previewImg(e) {
    let index = e.currentTarget.dataset.index;
    wx.previewImage({
      urls: [this.data.designer_info.list[index].thumb],
    })
  },

  showModal(e) {
    that.setData({
      modalName: e.currentTarget.dataset.target
    })
  },

  hideModal(e) {
    that.setData({
      modalName: null
    })
  },

  // 支付定金
  payOrder: () => {
    console.log(that.data.order_id);
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

  // 提交预约
  postInfo: (e) => {
    let rep = e.detail.value;
    api.post({
      url: '/wxsmall/User/preBuilding',
      data: {
        token: wx.getStorageSync('token'),
        room: rep.room,
        hall: rep.hall,
        toilet: rep.toilet,
        region: rep.homeName,
        area: rep.homeArea,
        realname: rep.yourName,
        mobile: rep.yourPhone,
        type: 2, // 预约设计师
        designer_id: that.data.designer_id
      },
      success: (res) => {
        console.log(res);
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

  /**
   * 咨询
   */
  consult: function() {
    wx.makePhoneCall({
      phoneNumber: that.data.designer_info.design_info.mobile,
    })
  },

  /**
   * 获取设计师的信息
   */
  getDesignerInfo: function() {
    let rep = that.data
    api.post({
      url: '/wxsmall/Designer/getDesignerInfo',
      data: {
        token: rep.token,
        designer_id: rep.designer_id
      },
      success: (res) => {
        console.log(res)
        let ret = res.data;
        if (ret.design_info.style.length > 0) {
          let default_style_id = ret.design_info.style[0].id;
          this.setData({
            current_style_id: default_style_id
          })
          this.getWorkList();
        }
        that.setData({
          designer_info: res.data
        })
      }
    })
  },

  /**
   * 默认风格获取默认的作品
   */
  getWorkList() {
    let rep = this.data;
    if (!rep.workHasMore) return;
    api.post({
      url: '/wxsmall/Designer/getDesignerOwnList',
      data: {
        designer_id: rep.designer_id,
        style_id: rep.current_style_id,
        page: ++rep.workIndex,
        row: rep.workSize
      },
      success: (res) => {
        console.log(res)
        let ret = res.data;
        if (ret.length < rep.workSize) {
          this.setData({
            workHasMore: false
          })
        }
        this.setData({
          workList: rep.workList.concat(ret)
        })
      }
    })
  },

  /**
   * 通过风格去筛选作品
   */
  selectCurrentStyle(e) {
    let rep = this.data;
    let id = e.currentTarget.dataset.id;
    if (rep.current_style_id == id) return;
    this.setData({
      workIndex: 0,
      workHasMore: true,
      workList: [],
      current_style_id: id
    })
    this.getWorkList();
  },

  /**
   * scroll-view 滚到到右边的时候加载更多作品
   */
  loadMoreWork() {
    this.getWorkList(); //共用的调用获取更多的作品
  },

  /**
   * 跳转到3d图
   */
  goUrl(e) {
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: '/pages/external-link/index?url=' + encodeURIComponent(url),
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    that = this;
    console.log(ops)
    api.isLogin(that);
    if (ops.id) {
      that.setData({
        designer_id: ops.id
      })
    }
    that.getDesignerInfo();
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