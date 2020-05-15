const api = require('../../utils/api-tp.js')
var app = getApp();
Page({
  data: {
    isAttrInfo: 'attrInfo',
    itemAttrInfo: '',
    foothidden: false,
    countmoney: "",
    cartNum: "",
    isAllSelect: false,
    minusStatus: '',
    cartList: [], //购物车列表
    cartIdsStr: '',
    CustomBar: app.globalData.CustomBar,
    delay_flag: false, // 防止频繁点击按钮
  },

  setNumber: function(e) {
    // console.log(e)
    var that = this;
    var index = e.currentTarget.dataset.item;
    var cartList = that.data.cartList;
    var num = parseInt(e.detail.value);
    var goods_num = num ? num : 1;
    if (goods_num > cartList[index].stock) {
      wx.showToast({
        title: '库存不足',
        icon: "none"
      })
      cartList[index].goods_num = cartList[index].goods_num;
      this.setData({
        cartList: cartList
      })
      return;
    }
    this.addCartNum(goods_num, this.data.cartList[index].id, function() {
      cartList[index].goods_num = goods_num;
      that.setData({
        cartList: cartList
      })
    });
  },

  onLoad: function(options) {},

  /**
   * 前往商品详情
   */
  goDetail(e) {
    let goods_id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + goods_id,
    })
  },

  btntap: function(e) {
    // this.data.foothidden = !this.data.foothidden;
    this.setData({
      foothidden: !this.data.foothidden
    })
  },
  numAddClick: function(event) {
    if (this.data.delay_flag) return
    this.setData({
      delay_flag: true
    })
    // 500ms之后才可以点击
    setTimeout(() => {
      that.setData({
        delay_flag: false
      })
    }, 1000)
    let index = event.currentTarget.dataset.index;
    let rep = this.data,
      id = rep.cartList[index].id,
      that = this
    // 先访问接口
    that.addCartNum(rep.cartList[index].goods_num + 1, rep.cartList[index].id, function() {
      that.data.cartList[index].goods_num = +that.data.cartList[index].goods_num + 1;
      var minusStatus = that.data.cartList[index].goods_num <= 1 ? 'disabled' : 'normal';
      that.setData({
        cartList: that.data.cartList,
        minusStatus: minusStatus
      });
      that.carnum(); // 计算选了多少件商品
      that.countmoney();
    });
  },
  //减
  numDescClick: function(event) {
    if (this.data.delay_flag) return;
    this.setData({
      delay_flag: true
    })
    let index = event.currentTarget.dataset.index;
    let rep = this.data,
      id = rep.cartList[index].id,
      that = this

    if (rep.cartList[index].goods_num <= 1) {
      return;
    }
    that.addCartNum(rep.cartList[index].goods_num - 1, rep.cartList[index].id, function() {
      var minusStatus = rep.cartList[index].goods_num <= 1 ? 'disabled' : 'normal';
      rep.cartList[index].goods_num = rep.cartList[index].goods_num - 1;
      that.setData({
        cartList: that.data.cartList,
        minusStatus: minusStatus
      });
      that.carnum();
      that.countmoney();
      setTimeout(() => {
        that.setData({
          delay_flag: false
        })
      }, 1000)
    });
  },
  //单选；
  switchSelect: function(e) {
    var index = e.currentTarget.dataset.index;
    this.data.cartList[index].checked = !this.data.cartList[index].checked;
    var len = this.data.cartList.length;
    var selectnum = [];
    for (var i = 0; i < len; i++) {
      if (this.data.cartList[i].checked == true) {
        selectnum.push(true);
      }
    }
    if (selectnum.length == len) {
      this.data.isAllSelect = true;
    } else {
      this.data.isAllSelect = false;
    }
    this.setData({
      cartList: this.data.cartList,
      isAllSelect: this.data.isAllSelect
    });

    this.carnum();
    this.countmoney();
  },
  //全选
  allChecked: function(e) {
    if (this.data.cartList.length == 0) {
      return;
    }
    var selectAllStatus = this.data.isAllSelect;
    selectAllStatus = !selectAllStatus;
    var array = this.data.cartList;
    for (var i = 0; i < array.length; i++) {
      array[i].checked = selectAllStatus;
    };
    this.setData({
      cartList: this.data.cartList,
      isAllSelect: selectAllStatus
    })
    this.carnum();
    this.countmoney(); //计算总价
  },
  //计算选择商品数量
  carnum() {
    var carnum = 0;
    var array = this.data.cartList;
    for (var i = 0; i < array.length; i++) {
      if (array[i].checked == true) {
        carnum += parseInt(array[i].goods_num);
      }
    }
    this.setData({
      cartNum: carnum
    })
  },
  //总共价钱；
  countmoney() {
    var carmoney = 0;
    var array = this.data.cartList;
    for (let i in array) {
      if (array[i].checked == true) {
        carmoney += parseFloat(array[i].goods_num * array[i].price);
      }
    }
    this.setData({
      countmoney: carmoney.toFixed(2)
    })
  },

  /**
   * 去结算
   */
  confirmOrder: function() {
    var array = this.data.cartList;
    var cartIds = [];
    let goods_data = [] // 拼接过去的商品情况
    for (let i = 0; i < array.length; i++) {
      if (array[i].checked == true) {
        cartIds.push(array[i].id);
        goods_data.push({
          goods_id: array[i].goods_id,
          goods_spec_id: array[i].goods_spec_id,
          goods_num: array[i].goods_num,
          cart_id: array[i].id // 新增一个购物车id
        })
      }
    }
    if (cartIds.length > 0) {
      this.goConfirm(cartIds, goods_data);
    } else {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      this.setData({
        cartIdsStr: ''
      })
    }
  },
  goConfirm: function(cartIds, _goods_data) {
    // 将所有的变为未选中的状态
    let arr = this.data.cartList
    for (let i in arr) {
      arr[i].checked = false
    }
    this.setData({
      cartIdsStr: cartIds.join(','),
      cartList: arr,
    })
    // console.log(this.data.cartIdsStr);
    // console.log(_goodsInfo);
    wx.navigateTo({
      url: '/pages/pay-order/index?id=' + this.data.cartIdsStr + '&goodsInfo=' + JSON.stringify(_goods_data)
    })
  },
  // 增减数量添加到后台
  addCartNum: function(cartNum, cartId, callback) {
    api.post({
      url: '/wxsmall/Cart/userEditNum',
      data: {
        cart_id: cartId,
        num: cartNum,
        token: this.data.token
      },
      success: (res) => {
        console.log(res)
        if (res.code == 0) { //修改成功
          callback();
        }
      }
    })

  },
  collectAll: function() {
    var array = this.data.cartList;
    var productIds = [];
    var that = this;
    for (var i = 0; i < array.length; i++) {
      if (array[i].checked == true) {
        productIds.push(array[i].product_id);
      }
    }
    if (productIds.length > 0) {
      var header = {
        'content-type': 'application/x-www-form-urlencoded',
      };
      wx.request({
        url: app.globalData.url + '/routine/auth_api/collect_product_all?uid=' + app.globalData.uid,
        method: 'GET',
        data: {
          productId: productIds.join(',')
        },
        header: header,
        success: function(res) {
          if (res.data.code == 200) {
            wx.showToast({
              title: '收藏成功',
              icon: 'success',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    }
    console.log(productIds);
  },

  onHide() {
    this.setData({
      isAllSelect: false
    })
  },

  /**
   * 删除
   */
  cartDelAll: function() {
    var array = this.data.cartList;
    var ids = [];
    var that = this;
    for (var i = 0; i < array.length; i++) {
      if (array[i].checked == true) {
        ids.push(array[i].id);
      }
    }

    if (ids.length > 0) {
      // 访问删除操作
      api.post({
        url: '/wxsmall/Cart/userDelCart',
        data: {
          cart_ids: ids.join(','),
          token: this.data.token
        },
        success: (res) => {
          console.log(res)
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000
          })
          for (var i = 0; i < ids.length; i++) {
            for (var j = 0; j < array.length; j++) {
              if (ids[i] == array[j].id) {
                array.splice(j, 1);
              }
            }
          }
          this.setData({
            cartList: array,
            isAllSelect: false
          })

          this.carnum(); //重新计算选中的购物数量
          this.countmoney(); // 重新计算价格
          this.setData({
            foothidden: false
          })
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (api.isLogin(this)) {
      this.getCartList();
      this.carnum();
      this.countmoney();
    }
  },

  /**
   * 删除当前失效商品
   */
  delCurrent(e) {
    let temp = this.data
    let ids = []
    let id = e.currentTarget.dataset.id
    console.log(id)
    let arr = this.data.invalidList
    ids.push(id)
    api.post({
      url: '/wxsmall/Cart/userDelCart',
      data: {
        cart_ids: ids.join(','),
        token: temp.token
      },
      success: (res) => {
        console.log(res)
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1500
        })
        for (var j = 0; j < arr.length; j++) {
          if (id == arr[j].id) {
            arr.splice(j, 1);
          }
        }
        this.setData({
          invalidList: arr,
        })
      }
    })
  },

  /**
   * 获取购物车列表
   */
  getCartList: function() {
    wx.showLoading({
      title: '加载中...',
    })
    api.post({
      url: '/wxsmall/Cart/getCartList',
      data: {
        token: this.data.token
      },
      success: (res) => {
        console.log(res)
        res = res.data
        let invalid_ = []
        if (res.length > 0) {
          for (let i in res) {
            if (res[i].is_lose) {
              invalid_.push(res[i])
            }
            this.setData({
              invalidList: invalid_
            })
          }
        }
        this.setData({
          cartList: res || []
        })
      }
    })
  },
})