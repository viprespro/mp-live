// pages/address/address.js
const api = require('../../utils/api-tp.js')
var app = getApp();
Page({
  data: {
    _num: '',
    addressArray: [],
    cartIds:'',
    goods_data:[],
    sign:'', // 标识用户从我的资料那里点击过来的
  },
  onLoad: function(ops) {
    console.log(ops)
    if(ops.cartIds){
      this.setData({
        cartIds: ops.cartIds
      })
    }

    if(ops.sign){
      this.setData({
        sign:ops.sign
      })
    }

    // 商品信息
    if (ops.goodsInfo) {
      let rep = JSON.parse(ops.goodsInfo)
      this.setData({
        goods_data: rep
      })
    }
  },
  getWxAddress: function() {
    var that = this;
    wx.getSetting({
      success(res) {
        console.log(res)
        if (!res.authSetting['scope.address']) {
          // 用户未授权获取通讯地址
          wx.authorize({
            scope: 'scope.address',
            success: function(res) {
              wx.chooseAddress({
                success: function(res) {
                  console.log(res);
                  var addressP = {};
                  addressP.province = res.provinceName;
                  addressP.city = res.cityName;
                  addressP.district = res.countyName;
                  wx.request({
                    url: app.globalData.url + '/routine/auth_api/edit_user_address?uid=' + app.globalData.uid + '&openid=' + app.globalData.openid,
                    method: 'POST',
                    data: {
                      address: addressP,
                      is_default: 1,
                      real_name: res.userName,
                      post_code: res.postalCode,
                      phone: res.telNumber,
                      detail: res.detailInfo,
                      id: 0
                    },
                    success: function(res) {
                      if (res.data.code == 200) {
                        wx.showToast({
                          title: '添加成功',
                          icon: 'success',
                          duration: 1000
                        })
                        that.getAddress();
                      }
                    }
                  })
                },
                fail: function(res) {
                  if (res.errMsg == 'chooseAddress:cancel') {
                    wx.showToast({
                      title: '取消选择',
                      icon: 'none',
                      duration: 1500
                    })
                  }
                },
                complete: function(res) {},
              })
            },
            fail: function(res) {
              // console.log(res); //授权获取地址拒绝
              wx.showModal({
                title: '提示',
                content: '您已经拒绝小程序访问您的通讯地址',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    wx.openSetting({ // 若是直接在失败的中使用 并不能打开
                    })
                  }
                }
              })
            },
          })
        } else { // 已经授权过
          wx.chooseAddress({
            success: function(res) {
              console.log(res);
              var addressP = {};
              addressP.province = res.provinceName;
              addressP.city = res.cityName;
              addressP.district = res.countyName;
              wx.request({
                url: app.globalData.url + '/routine/auth_api/edit_user_address?uid=' + app.globalData.uid + '&openid=' + app.globalData.openid,
                method: 'POST',
                data: {
                  address: addressP,
                  is_default: 1,
                  real_name: res.userName,
                  post_code: res.postalCode,
                  phone: res.telNumber,
                  detail: res.detailInfo,
                  id: 0
                },
                success: function(res) {
                  if (res.data.code == 200) {
                    wx.showToast({
                      title: '添加成功',
                      icon: 'success',
                      duration: 1000
                    })
                    that.getAddress();
                  }
                }
              })
            },
            fail: function(res) {
              if (res.errMsg == 'chooseAddress:cancel') {
                wx.showToast({
                  title: '取消选择',
                  icon: 'none',
                  duration: 1500
                })
              }
            },
            complete: function(res) {},
          })
        }
      }
    })
  },
  /**
   * 获取地址
   */
  getAddress: function() {
    api.post({
      url: '/wxsmall/User/getUserAddress',
      data: {
        token: this.data.token
      },
      success: (res) => {
        console.log(res)
        this.setData({
          addressArray: res.data
        })
      }
    })

  },
  /**
   *添加地址
   */
  addAddress: function(e) {
    wx.navigateTo({ //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
      url: '/pages/addaddress/addaddress?title=' + e.currentTarget.dataset.title
    })
  },
  goOrder: function(e) {
    let id = e.currentTarget.dataset.id,
    rep = this.data,
    cartIds = rep.cartIds,
    goodsInfo = rep.goods_data,
    sign = rep.sign
    if(sign == 1){
      return;
    }
    wx.navigateTo({
      url: '/pages/pay-order/index?addressId=' + id + '&id=' + cartIds + '&goodsInfo=' + JSON.stringify(goodsInfo)
    })
  },
  delAddress: function(e) {
    let id = e.currentTarget.dataset.id;
    api.post({
      url: '/wxsmall/User/delAddress',
      data: {
        address_id: id,
        token: this.data.token
      },
      success: (res) => {
        wx.showToast({
          title: '删除成功',
          icon: ''
        })

        setTimeout(() => {
          this.onShow();
        }, 1500)
      }
    })
  },
  editAddress: function(e) {
    let target = e.currentTarget.dataset
    let id = target.id
    let title = target.title
    wx.navigateTo({
      url: '/pages/addaddress/addaddress?id=' + id + '&title=' + title ,
    })
  },
  activetap: function(e) {
    var id = e.target.dataset.idx;
    var that = this;
    var header = {
      'content-type': 'application/x-www-form-urlencoded',
    };
    wx.request({
      url: app.globalData.url + '/routine/auth_api/set_user_default_address?uid=' + app.globalData.uid,
      method: 'GET',
      header: header,
      data: {
        addressId: id
      },
      success: function(res) {
        if (res.data.code == 200) {
          wx.showToast({
            title: '设置成功',
            icon: 'success',
            duration: 1000,
          })
          that.setData({
            _num: id
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000,
          })
        }
      }
    })
  },
  onShow: function() {
    api.isLogin(this);
    this.getAddress();
  },
})