const app = getApp()
const api = require('../../utils/api-tp.js')
Page({
  data: {
    addressId: '', //地址id
    select_flag: 1, //选择支付方式的默认
    goods_data: [], //传递后台数组
    goodsInfo: [], // 后台返回的
    textarea_val: '', // 相当于备注
    cartIds: '', //购物车ids
    modalName: null,
    array: [],
    united_data_for_coupon: [], //获取优惠券瓶装的数据
    cart_data: [],
    delay_click: true,
    has: true
  },
  onLoad: function(ops) {
    console.log(ops)
    api.isLogin(this);
    if (ops.id) {
      this.setData({
        cartIds: ops.id //逗号隔开的
      })
    }

    if (ops.addressId) {
      this.setData({
        addressId: ops.addressId
      })
    }

    // 从直播间过来记录number号
    if(ops.number) {
      let { number } = ops
      this.setData({ number })
    }

    // 商品详情或购物车携带的商品信息
    if (ops.goodsInfo) {
      let rep = JSON.parse(ops.goodsInfo)
      this.setData({
        goods_data: rep
      })
    }

    // 一件套餐包时候的package_id
    if (ops.package_id) {
      this.setData({
        package_id: ops.package_id
      })
    }

    // 超值拼团
    if (ops.group_id) {
      this.setData({
        group_id: ops.group_id
      })
    }

    // 参团携带
    if (ops.group_record_id && ops.group_record_id != 'undefined') {
      this.setData({
        group_record_id: ops.group_record_id,
        group_id: '' // 此时设置拼团id为空
      })
    }

    // 秒杀携带
    if (ops.seckill_id && ops.seckill_id != 'undefined') {
      this.setData({
        seckill_id: ops.seckill_id
      })
    }

  },

  /**
   * 选择当前的优惠券
   */
  chooseCurrentCoupon(e) {
    let temp = e.currentTarget.dataset;
    let cou_name = temp.name; // 优惠券名称
    let cou_val = JSON.parse(temp.value); //优惠券所带的值
    let rep = this.data;
    let arr = rep.united_data_for_coupon; // 拼装的数组 用以获取优惠券列表
    let arr2 = rep.goodsInfo; // 页面渲染的数据
    for (let i in arr) {
      if (arr[i].click) {
        arr[i].user_coupon_id = temp.usercouponid;
        for (let j in arr2) {
          arr2[j].user_coupon_id = '';
          if (arr[i].goods_id == arr2[j].goods_id) {
            arr2[j].coupon_info = `${cou_name} -${cou_val.price}`; // 选中的优惠券的字符串信息
            arr2[j].coupon_price = cou_val.price; // 添加当前couponid对应的优惠券值
            arr2[j].user_coupon_id = temp.usercouponid; // 赋值到商品信息中
          }
        }
      }
    }

    // 每次点击都重新计算一次显示总价的价格
    // 分析：遍历当前选中的id 找到这个id对应的优惠券的券值 减去即可
    let total = rep.cache_total_price;
    let traversal_sum = 0.0;
    for (let i in arr2) {
      if (arr2[i].user_coupon_id) {
        traversal_sum += arr2[i].coupon_price;
      }
    }

    total = total - traversal_sum; // 计算最终的值

    this.setData({
      united_data_for_coupon: arr, // 选择之后的拼装数据
      goodsInfo: arr2,
      modalName: null,
      total_price: total, // 这个是最终显示的值
    })

    // 拼装cart_data 遍历arr2 拿到user_coupon_id与cart_id
    let _cart_data = [];
    for (let i in arr2) {
      _cart_data.push({
        cart_id: arr2[i].cart_id,
        user_coupon_id: arr2[i].user_coupon_id
      })
    }

    // 一般的地方走过来的
    let _goods_data = rep.goods_data;
    _goods_data[0].user_coupon_id = e.currentTarget.dataset.usercouponid; // 因为只能有一个商品

    this.setData({
      cart_data: _cart_data,
      goods_data: _goods_data
    })

    console.log(rep.goods_data);

  },

  /**
   * 获取可用优惠券列表
   */
  getAvailableCoupon() {
    let rep = this.data;
    api.post({
      url: '/wxsmall/Coupon/getUserCouponListForOrder',
      data: {
        token: rep.token,
        goods_data: JSON.stringify(rep.united_data_for_coupon)
      },
      success: (res) => {
        console.log(res)
        this.setData({
          couponList: res.data || []
        })
      }
    })
  },

  chooseAvailableCoupon(e) {
    let rep = this.data;
    let arr = rep.united_data_for_coupon; // 订单信息列表
    let temp = e.currentTarget.dataset;
    this.setData({
      modalName: temp.target,
      has: false
    })


    for (let i in arr) {
      arr[i].click = 0;
      if (temp.id == arr[i].goods_id) {
        arr[i].click = 1;
      }
    }

    this.setData({
      united_data_for_coupon: arr // 用于获取用户在该商品下的可用优惠券
    })

    this.getAvailableCoupon();
  },

  cacheGoodsInfo(argus) {
    let after_arr = []
    for (let i in argus) {
      after_arr.push({
        goods_id: argus[i].goods_id,
        goods_spec_id: argus[i].goods_spec_id,
        goods_num: argus[i].num,
        goods_price: argus[i].goods_price
      })
    }

    for (let i in after_arr) {
      after_arr[i].click = 0;
      after_arr[i].user_coupon_id = '';
    }

    this.setData({
      united_data_for_coupon: after_arr // 用于获取用户在该商品下的可用优惠券
    })


  },

  /**
   * 编辑地址
   */
  editAddress: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({ //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
      url: '/pages/addaddress/addaddress?id=' + id + '&title=' + '编辑收货地址'
    })
  },

  /**
   * 选择当前收货地址
   */
  selectCurrent: function(e) {
    let id = e.currentTarget.dataset.id
    this.setData({
      addressId: id,
      modalName: null,
      has:true
    })
    this.getAddressInfo(); // 通过地址id去获取地址信息 重新渲染到页面
  },

  /**
   * 新增收货地址
   */
  addAddress: function() {
    wx.navigateTo({ //跳转至指定页面并关闭其他打开的所有页面（这个最好用在返回至首页的的时候）
      url: '/pages/addaddress/addaddress'
    })
  },

  bindLeaveMessage: function(e) {
    this.setData({ textarea_val: e.detail.value })
  },
  /**
   * 提交订单
   */

  submitOrder: function() {
    // validate
    let rep = this.data
    if (rep.delay_click) {
      this.setData({
        delay_click: false
      })

      setTimeout(() => { //一段时间过后 才可以重新提交
        this.setData({
          delay_click: true
        })
      }, 10000)

      if (!rep.addressId && Object.keys(rep.addressInfo).length == 0) {
        wx.showToast({
          title: '请选择收货地址',
          icon: 'none'
        })
      } else if (!rep.select_flag) {
        wx.showToast({
          title: '请选择支付方式',
          icon: 'none'
        })
      } else {
        // success
        if (rep.cartIds) { // 从购物车过来
          if (rep.cart_data.length == 0) { // 如果没选优惠券的情况
            let arr = rep.goodsInfo;
            let after = []; // 组装所有的优惠券id为空
            for (let i in arr) {
              after.push({
                cart_id: arr[i].cart_id,
                user_coupon_id: ''
              })
            }
            this.setData({
              cart_data: after
            })
          }
          api.post({
            url: '/wxsmall/Cart/shopCart',
            data: {
              token: this.data.token,
              cart_data: JSON.stringify(rep.cart_data),
              content: rep.textarea_val,
              address_id: rep.addressId,
              package_id: rep.package_id ? rep.package_id : '',
              group_id: rep.group_id ? rep.group_id : '',
              group_record_id: rep.group_record_id ? rep.group_record_id : '',
              seckill_goods_id: rep.seckill_id ? rep.seckill_id : ''
            },
            success: (res) => {
              // console.log(res)
              let orderId = res.data.order_id
              let order_sn = res.data.order_sn;
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

                      console.log('success')

                      setTimeout(() => {
                        wx.redirectTo({
                          url: '/packageA/pages/pay-success/index?num=' + order_sn
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
                },
              })
            }
          })
        } else {
          // 如果没有选优惠券的情况
          if (!rep.goods_data[0].user_coupon_id) {
            rep.goods_data[0].user_coupon_id = '';
            this.setData({
              goods_data: rep.goods_data
            })
          }
          api.post({
            url: '/wxsmall/Order/createOrder',
            data: {
              token: rep.token,
              address_id: rep.addressId,
              goods_data: JSON.stringify(this.data.goods_data),
              content: rep.textarea_val || '',
              group_id: rep.group_id ? rep.group_id : '',
              group_record_id: rep.group_record_id ? rep.group_record_id : '',
              seckill_goods_id: rep.seckill_id ? rep.seckill_id : '',
              number: rep.number ? rep.number : '' // 直播房间号
            },
            success: (res) => {
              console.log(res)
              // 创建订单之后调起支付的接口 todo
              let orderId = res.data.order_id;
              let order_sn = res.data.order_sn;
              api.post({
                url: '/wxsmall/Order/payOrder',
                data: {
                  order_id: orderId,
                  token: this.data.token,
                  pay_type: 1
                },
                success: (res) => {
                  console.log(res)
                  if(res.code != 0) {
                    app.msg(res.message)
                    return;
                  }
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
                          url: '/packageA/pages/pay-success/index?num=' + order_sn
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
                },
              })
            }
          })
        }
      }
    }

  },

  getOrderInfo: function() {
    let rep = this.data;
    api.post({
      url: '/wxsmall/Order/getGoodsInfo',
      data: {
        goods_data: JSON.stringify(this.data.goods_data),
        token: this.data.token,
        package_id:rep.package_id ? rep.package_id : '',
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        // 将商品信息缓存起来
        this.cacheGoodsInfo(ret.goods_info);
        this.setData({
          addressInfo: ret.address,
          goodsInfo: ret.goods_info,
          total_price: ret.total_price,
          cache_total_price: ret.total_price, // 缓存总价 这个之后优惠券那里计算价格使用
          addressId: ret.address.id,
          type: ret.type // 标识是商品 0 1 2 3 3是积分商品  5是套餐
        })
      }
    })
  },

  chooseWay: function(e) {
    let rep = this.data

    if (rep.select_flag == 0) {
      this.setData({
        select_flag: 1
      })
    } else if (rep.select_flag == 1) {
      this.setData({
        select_flag: 0
      })
    }
  },

  getAddressInfo: function() {
    let rep = this.data
    if (rep.addressId) {
      api.post({
        url: '/wxsmall/User/getUserAddressInfo',
        data: {
          token: rep.token,
          address_id: rep.addressId
        },
        success: (res) => {
          // console.log(res)
          this.setData({
            addressInfo: res.data
          })
        }
      })
    }
  },


  getAddress: function() {
    // let rep = this.data,
    //   cartIds = rep.cartIds,
    //   goods_data = rep.goods_data
    // wx.navigateTo({
    //   url: '/pages/address/address?cartIds=' + cartIds + '&goodsInfo=' + JSON.stringify(goods_data),
    // })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      has: false
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null,
      has: true
    })
  },
  /**
   * 获取用户地址
   */
  getUserAddress: function() {
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
  onShow: function() {
    api.isLogin(this);
    this.getOrderInfo(); // 获取商品订单情况
    this.getAddressInfo();
    this.getUserAddress(); //这样便可以实时刷新地址列表信息
  },
})