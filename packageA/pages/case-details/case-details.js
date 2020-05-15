// packageA/pages/case-details/case-details.js
let that;
const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picturesOrBanner: 1,
    pictures: [],
    count: 0,
    banner: 'http://img5.imgtn.bdimg.com/it/u=3300305952,1328708913&fm=26&gp=0.jpg',
    goods: [],
    total: 0,
    totalPrice: 0,
  },

  swiperChange: function (e) {
    that.setData({
      count: e.detail.current
    });
  },

  selectGoods: function (e) {
    let key = "goods[" + e.currentTarget.dataset.index + "].key";
    if (e.currentTarget.dataset.key == true) {
      that.setData({
        [key]: false
      });
      e.currentTarget.dataset.key = false;
    } else {
      that.setData({
        [key]: true
      });
      e.currentTarget.dataset.key = true;
    }
    // 计算商品数量
    that.goodsNumTotal();
  },

  // 计算商品数量
  goodsNumTotal: function () {
    let total = 0;
    let arr = that.data.goods;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key == true) {
        total += parseInt(arr[i].num);
      }
    }
    that.setData({
      total,
    });
    // 计算商品总价
    that.goodsNumTotalPrice();
  },

  // 计算商品总价
  goodsNumTotalPrice: function () {
    let rep = this.data;
    let totalPrice = 0;
    let arr = that.data.goods;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key == true) {
        totalPrice += parseFloat(arr[i].price) * parseInt(arr[i].num);
      }
    }

    let _total;
    let _discount = (rep.discount / 10);
    _total = (totalPrice*_discount).toFixed(2);
    that.setData({
      totalPrice: _total
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    that = this;
    api.isLogin(this);
    // console.log(ops)
    if (ops.id) {
      this.setData({
        package_id: ops.id
      })
    }
    this.getPackageInfo();
  },

  /**
   * 前往商品详情
   */
  goDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + id,
    })
  },

  /**
   * 跳转到3d的外联
   */
  goLink() {
    wx.navigateTo({
      url: '/pages/external-link/index?url=' + encodeURIComponent(this.data.pano_pic),
    })
  },

  /**
   * 一键付款
   */
  linkToPay() {
    let rep = this.data;
    let goods_data = []
    let arr = that.data.goods
    for (let i in arr) {
      if (arr[i].key) {
        goods_data.push({
          goods_id: arr[i].goods_id,
          goods_spec_id: arr[i].spec_id,
          goods_num: arr[i].num
        })
      }
    }
    if (goods_data.length < rep.min_num) {
      wx.showToast({
        title: `购买商品至少为${rep.min_num}件`,
        icon: 'none',
        duration: 1500,
        mask: true
      })
      return;
    }

    wx.navigateTo({
      url: '/pages/pay-order/index?goodsInfo=' + JSON.stringify(goods_data) + '&package_id=' + that.data.package_id,
    })
  },

  getPackageInfo() {
    let rep = this.data;
    api.post({
      url: '/wxsmall/Package/getPackageInfo',
      data: {
        token: rep.token,
        package_id: rep.package_id
      },
      success: (res) => {
        let ret = res.data;
        console.log(res)
        this.setData({
          packageInfo: res.data,
          pictures: ret.package_info.imgs,
          goods: ret.package_area[0].goods_info,
          discount: ret.package_info.discount, //折扣
          min_num: ret.package_info.min_num, //最小购买数量
          pano_pic: ret.package_info.pano_pic //是否有3D的链接 
        })
        that.goodsNumTotal();
        that.goodsNumTotalPrice();
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
    // 计算商品数量
    that.goodsNumTotal();
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