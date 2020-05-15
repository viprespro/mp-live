// packageA/pages/my-favorites/index.js
let that;
const api = require('../../../utils/api-tp.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    products: [],
    designers: [],
    articles: [],
    acTab: 0,
    productPage: 1,
    designerPage: 1,
    articlePage: 1,
    row: 4,
    isShow: false,
    emptyOrMore: false
  },

  goDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + id,
    })
  },

  /**
   * 关注或取关
   */
  follow(e){
    let rep = this.data;
    let id = e.currentTarget.dataset.id;
    let _arr = rep.designers;
    for(let i in _arr){
      if(id == _arr[i].designer_id){
        let hint = '';
        if(_arr[i].is_follow){
          hint = '取消关注';
          _arr[i].is_follow = false;
        }else {
          hint = '已关注';
          _arr[i].is_follow = true;
        }
        api.post({
          url: '/wxsmall/User/userFollowDesigner',
          data: {
            token: wx.getStorageSync('token'),
            designer_id: id
          },
          success: (res) => {
            // wx.showToast({
            //   title: hint,
            //   icon:'none',
            //   duration:1500,
            //   mask:true
            // })

            this.setData({
              designers:_arr
            })
          }
        })
      }
    }
  },

  // 切换tab
  taptab: (e) => {
    that.setData({
      acTab: e.currentTarget.dataset.index,
      isShow: false,
      emptyOrMore: false
    });
    switch (that.data.acTab) {
      case 0:
        that.productRequest();
        break;
      case 1:
        that.designerRequest();
        break;
      case 2:
        that.articleRequest();
        break;
    }
  },

  // 商品请求
  productRequest: () => {
    api.post({
      url: '/wxsmall/User/getGoodsFollowList',
      data: {
        token: wx.getStorageSync('token'),
        page: that.data.productPage,
        row: that.data.row
      },
      success: (res) => {
        console.log(res);
        if (res.data.length > 0) {
          that.setData({
            products: res.data,
            isShow: false
          });
        } else {
          if (that.data.productPage > 1) {
            that.setData({
              isShow: true,
              emptyOrMore: true
            });
          } else {
            that.setData({
              isShow: true,
              emptyOrMore: false
            });
          }
        }
      }
    })
  },

  // 设计师请求
  designerRequest: () => {
    api.post({
      url: '/wxsmall/User/getDesignerFollowList',
      data: {
        token: wx.getStorageSync('token'),
        page: that.data.designerPage,
        row: that.data.row
      },
      success: (res) => {
        console.log(res);
        if (res.data.length > 0) {
          that.setData({
            designers: res.data,
            isShow: false
          });
        } else {
          if (that.data.productPage > 1) {
            that.setData({
              isShow: true,
              emptyOrMore: true
            });
          } else {
            that.setData({
              isShow: true,
              emptyOrMore: false
            });
          }
        }
      }
    })
  },

  // 圈子请求
  articleRequest: () => {
    api.post({
      url: '/wxsmall/User/getArticleFollowList',
      data: {
        token: wx.getStorageSync('token'),
        page: that.data.articlePage,
        row: that.data.row
      },
      success: (res) => {
        console.log(res);
        if (res.data.length > 0) {
          that.setData({
            articles: res.data,
            isShow: false
          });
        } else {
          if (that.data.productPage > 1) {
            that.setData({
              isShow: true,
              emptyOrMore: true
            });
          } else {
            that.setData({
              isShow: true,
              emptyOrMore: false
            });
          }
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this;
    that.productRequest();
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
    switch (that.data.acTab) {
      case 0:
        that.setData({
          productPage: ++that.data.productPage
        });
        that.productRequest();
        break;
      case 1:
        that.setData({
          designerPage: ++that.data.designerPage
        });
        that.designerRequest();
        break;
      case 2:
        that.setData({
          articlePage: ++that.data.articlePage
        });
        that.articleRequest();
        break;
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})