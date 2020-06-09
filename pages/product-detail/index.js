// pages/product-con/index.js
var app = getApp();
var wxh = require('../../utils/wxh.js');
const api = require('../../utils/api-tp.js')
const WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CustomBar: app.globalData.CustomBar,
    collect: false, //是否收藏
    indicatorDots: true, //是否显示面板指示点;
    autoplay: true, //是否自动播放;
    interval: 3000, //动画间隔的时间;
    duration: 500, //动画播放的时长;
    indicatorColor: "rgba(51, 51, 51, .3)",
    indicatorActivecolor: "#ffffff",
    id: 0,
    num: 1,
    show: false,
    prostatus: false,
    CartCount: 0,
    status: 0,
    actionSheetHidden: true,
    paramsList: [], //商品参数列表
    skuidsList: [], //规格列表
    goods_id: '', //商品id
    spec_id: '', //规格id
    sku_choose: null, //选择商品属性列表
    stock: '', // 某个规格的库存问题
    service_number: '', //咨询客服电话
    exchange_param: 0, // 默认为0 
    starIndex1: 4,
  },


  /**
   * 分析：商品可能是普通商品、秒杀商品、拼团商品 根据后端返回数据进行判断
   *      0:普通商品 1秒杀 2拼团 3积分
   */

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    // 普通商品购买 只是传id
    if (options.id && !options.hasOwnProperty('number')) {
      this.setData({
        goods_id: options.id
      })
      this.getGoodsDetails(options.id);
    }

    // 直播间购买
    if (options.id && options.number) {
      let {
        id,
        number
      } = options
      this.setData({
        goods_id: id,
        number
      })
      this.getGoodsDetails(id);
    }

    // 动态设置swiper的长宽
    this.computeSwiperHeight();
  },

  /**
   * 预览swiper中的图片
   */
  previewSwiperImg(e) {
    let index = e.currentTarget.dataset.index
    let arr = this.data.productInfo.flash
    wx.previewImage({
      urls: [arr[index]],
    })
  },

  /**
   * 计算swiper的高度 1:1正方形
   */
  computeSwiperHeight() {
    let windowW = app.globalData.windowW;
    let ratio = 16 / 16;
    let swiperH = (windowW / ratio).toFixed(2);
    this.setData({
      swiperH: swiperH
    })
  },

  previewImg(e) {
    let url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url],
    })
  },

  /**
   * 评论查看全部
   */
  commentsCheckAll() {
    wx.navigateTo({
      url: '/packageA/pages/product-comments/index?goods_id=' + this.data.goods_id,
    })
  },

  /**
   * 获取特定规格下的商品信息
   */
  getSpecBySku(param) {
    let rep = this.data;
    api.post({
      url: '/wxsmall/Goods/getGoodsSpecInfo',
      data: {
        goods_id: rep.goods_id,
        tags_str: param
      },
      success: (res) => {
        console.log(res);
        let specProductInfo = res.data
        this.setData({
          specProductInfo: specProductInfo,
          spec_id: specProductInfo.spec_id,
          stock: specProductInfo.stock, //该规格的产品的库存
          current_spec_price: specProductInfo.price // 当前规格的价格
        })
      }
    })
  },

 
  /**
   * 客服咨询
   */
  consult: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.service_number,
    })
  },

  /**
   * 用户收藏商品与取消  
   * optimize done
   */
  alertCollection: function() {
    if (api.isLogin(this)) {
      let rep = this.data;
      let info = rep.productInfo;
      api.post({
        url: '/wxsmall/User/userFollowGoods',
        data: {
          token: rep.token,
          goods_id: rep.goods_id
        },
        success: (res) => {
          let hint = '';
          if (info.is_follow) { //关注状态
            info.is_follow = false;
            this.setData({
              productInfo: info
            })
            hint = '取消收藏';
          } else {
            info.is_follow = true;
            this.setData({
              productInfo: info
            })
            hint = '收藏成功';
          }
          wx.showToast({
            title: hint,
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },

  /**
   * controller 控制移动
   */
  setTouchMove: function(e) {
    wxh.home(this, e);
  },

  /**
   * 加入购物车
   */
  addToCart: function() {
    this.setData({
      click_add_btn: true
    })
    this.getAttrInfo();
  },

  setNumber: function(e) {
    var that = this;
    var num = parseInt(e.detail.value);
    that.setData({
      num: num ? num : 1
    })
  },

  getAttrInfo: function() {
    var that = this;
    wxh.footan(that);
    that.setData({
      status: 1
    })
  },

  /**
   * 改变规格
   */
  alertSku: function(e) {
    let index1 = e.currentTarget.dataset.top
    let index2 = e.currentTarget.dataset.bot
    let rep = this.data
    // 设置此时的值
    // 遍历规格列表
    for (let i in rep.skuidsList) {
      if (index1 == i) {
        for (let j in rep.skuidsList[index1].tags) {
          rep.skuidsList[i].tags[j].status = 0;
        }
        rep.skuidsList[i].tags[index2].status = 1;
        this.setData({
          skuidsList: this.data.skuidsList
        })
      }
    }
    // console.log(rep.skuidsList)
    let joint = []
    // 遍历找到此时选中
    for (let i in rep.skuidsList) {
      for (let j in rep.skuidsList[i].tags) {
        if (rep.skuidsList[i].tags[j].status == 1) {
          // 记录值
          joint.push(rep.skuidsList[i].tags[j].value)
        }
      }
    }
    let joint_str = joint.join(',')
    // 还需要发起一个请求
    this.getSpecBySku(joint_str);
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

  // 获取商品参数
  getProductParams: function(id) {
    api.post({
      url: '/wxsmall/Goods/getGoodsAttribute',
      data: {
        goods_id: id
      },
      success: (res) => {
        this.setData({
          paramsList: res.data
        })
      }
    })
  },

  /**
   * 获取规格信息
   */
  getSkuidInfo: function(id) {
    api.post({
      url: '/wxsmall/Goods/getGoodsSpec',
      data: {
        goods_id: id
      },
      success: (res) => {
        let ret = res.data
        // 取出默认的第一个属性
        let joint = []
        if (ret.length > 0) {
          for (let i in ret) {
            if (ret[i].tags.length > 0) {
              for (let j in ret[i].tags) {
                joint.push(ret[i].tags[0].value) //默认取出第一个
              }
            }
          }
        }
        api.post({
          url: '/wxsmall/Goods/getGoodsSpecInfo',
          data: {
            goods_id: id,
            tags_str: joint.join(',')
          },
          success: (res) => {
            // console.log(res);
            let specProductInfo = res.data
            this.setData({
              specProductInfo: specProductInfo,
              spec_id: specProductInfo.spec_id, // 默认的
              stock: specProductInfo.stock, //默认规格的库存
              current_spec_price: specProductInfo.price // 默认规格的价格
            })
          }
        })
        this.setData({
          skuidsList: ret
        })
      }
    })
  },

  checkTime(arg) {
    if (arg < 10) {
      arg = '0' + arg;
    }
    return arg;
  },

  /**
   * 获取该商品的评论
   */
  getComments() {
    let rep = this.data;
    api.post({
      url: '/wxsmall/Goods_Comment/getGoodsCommentList',
      data: {
        page: 1,
        row: 3,
        goods_id: rep.goods_id
      },
      success: (res) => {
        console.log(res)
        let ret = res.data;
        this.setData({
          total_comments: ret.comment_num,
          commentsList: ret.list
        })
      }
    })
  },

  getGoodsDetails: function(id) {
    let temp = this.data
    api.post({
      url: '/wxsmall/Goods/getGoodsInfo',
      data: {
        goods_id: id,
      },
      success: (res) => {
        console.log(res)
        let rep = res.data;
        if (rep.is_find == 0) { // 表示商品已结下架
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 1500,
            mask: true
          })

          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)

          return;
        }
        this.getSkuidInfo(temp.goods_id); // 如果商品已结丢失就不需要走了
        this.getProductParams(temp.goods_id);
        this.getComments(); // 获取该商品的评论 默认显示三条
        if (rep.type == 2) { // 判断若是拼团
          let ret = rep.group_info
          // do sth
          // 保存拼团id到全局
          this.setData({
            group_id: ret.group_id
          })

          let end_time = ret.end_time; // 时间戳
          let currentTimeStamp = Date.parse(new Date()) / 1000;
          let at = end_time - currentTimeStamp; // 剩余时间
          let days = parseInt(at / 60 / 60 / 24, 10);
          let hrs = parseInt(at / 60 / 60 % 24, 10);
          var mm = parseInt(at / 60 % 60, 10);
          var ss = parseInt(at % 60, 10);
          hrs = this.checkTime(hrs);
          mm = this.checkTime(mm);
          ss = this.checkTime(ss);
          let finalStr = '';
          // 剩余时间
          if (days == 0) {
            finalStr = `剩余${hrs}时${mm}分`;
          } else {
            finalStr = `剩余${days}天${hrs}时${mm}分`;
          }

          this.setData({
            end_time_hint: finalStr
          })

        } else if (rep.type == 1) { // 秒杀
          let ret = rep.seckill_info;
          // 倒计时
          let end_time = ret.end_time; // 时间戳
          let currentTimeStamp = Date.parse(new Date()) / 1000;
          let at = end_time - currentTimeStamp; // 剩余时间
          setInterval(() => { // 每次减一
            let days = parseInt(at / 60 / 60 / 24, 10);
            let hrs = parseInt(at / 60 / 60 % 24, 10);
            var mm = parseInt(at / 60 % 60, 10);
            var ss = parseInt(at % 60, 10);
            hrs = this.checkTime(hrs);
            mm = this.checkTime(mm);
            ss = this.checkTime(ss);
            if (at > 0) {
              at--;
            }
            let _countDown = {
              days: days,
              hrs: hrs,
              mm: mm,
              ss: ss
            }

            this.setData({
              countDown: _countDown,
              seckill_id: ret.seckill_goods_id
            })
          }, 1000)
        }

        console.log(1)
        console.log(res)
        this.setData({
          productInfo: res.data,
          service_number: res.data.service_mobile,
          details: res.data.details
        })

        WxParse.wxParse('details', 'html', rep.details, this, 0);
      }
    })
  },

  /**
   * 确认下单
   */
  goOrder: function() {
    this.setData({
      click_confimr_order_btn: true
    })
    this.getAttrInfo();
  },

  // 跳转到填写订单页面
  navigateLink() {
    let rep = this.data;
    let goods_data = [];
    let goods_item = {};
    // 跳转到详情页需要携带参数 选择商品的情况
    goods_item.goods_id = rep.goods_id
    goods_item.goods_spec_id = rep.spec_id
    goods_item.goods_num = rep.num
    goods_data.push(goods_item)
    wx.navigateTo({
      url: '/pages/pay-order/index?goodsInfo=' + JSON.stringify(goods_data) + '&seckill_id=' + rep.seckill_id + '&number=' + rep.number,
    })
  },

  modelbg: function(e) {
    this.setData({
      prostatus: false,
      click_confimr_order_btn: false, // 还原状态
      click_add_btn: false,
    })
  },

  /**
   * 关闭选取规格弹框
   */
  close() {
    this.setData({
      prostatus: false
    })
  },

  // 规格选择好 点击确定
  confirm: function() {
    if (api.isLogin(this)) {
      let rep = this.data
      let joint = []
      // 判断库存
      if (rep.num > rep.stock) {
        wx.showToast({
          title: '库存不足',
          icon: 'none',
          duration: 1500,
          mask: true
        })
        return;
      }
      // 遍历找到此时选中
      for (let i in rep.skuidsList) {
        for (let j in rep.skuidsList[i].tags) {
          if (rep.skuidsList[i].tags[j].status == 1) {
            // 记录值
            joint.push(rep.skuidsList[i].tags[j].value)
          }
        }
      }
      let joint_str = joint.join(',')
      this.setData({
        sku_choose: joint_str
      })
      // 通过规格去获取该规格下的商品价格
      this.getSpecBySku(joint_str);
      this.close();
      if (rep.click_add_btn) { // 判断若是点加入购物车的按钮
        this.setData({
          click_add_btn: false
        })
        this.getAccessAddCartPort();
      }
      if (rep.click_confimr_order_btn) { // 判断若是点击确认下单的按钮
        this.setData({
          click_confimr_order_btn: false
        })
        this.navigateLink();
      }
      if (rep.join_group_flag) { // 判断若是点击去参团的按钮
        this.setData({
          join_group_flag: false
        })
        this.navigateToLinkJoin();
      }
      if (rep.launch_group_flag) { // 判断若是点击立即开团的按钮
        this.setData({
          launch_group_flag: false
        })
        this.navigateToLinkLaunchGroup();
      }
      if (rep.exchange_flag) { // 判断若是点击立即开团的按钮
        this.setData({
          exchange_flag: false
        })
        this.navigateToLinkExchange();
      }
    }
  },

 
  /**
   * 访问添加到购物车的接口
   */
  getAccessAddCartPort() {
    if (api.isLogin(this)) {
      let rep = this.data;
      let {
        number
      } = rep
      api.post({
        url: '/wxsmall/Cart/addCart',
        data: {
          goods_id: rep.goods_id,
          goods_spec_id: rep.spec_id,
          goods_num: rep.num,
          token: rep.token,
          number: number ? number : 0
        },
        success: (res) => {
          wx.showToast({
            title: '加入购物车成功',
            duration: 2000
          })
        }
      })
    }
  },
  // 购买数量加
  bindPlus() {
    let rep = this.data;
    let _num = rep.num + 1;
    this.setData({
      num: _num
    })
  },

  // 购买数量减少
  bindMinus() {
    let rep = this.data;
    if (rep.num > 1) {
      let _num = rep.num - 1;
      this.setData({
        num: _num
      })
    }
  },

  // 右上角分享
  onShareAppMessage() {
    let data = this.data
    return {
      title: data.productInfo.goods_name,
      imageUrl: data.productInfo.flash[0],
      path: `/pages/load/load?id=${data.goods_id}&invite_code=${app.globalData.invite_code}`,
      success: function(res) {
        console.log("分享成功");
      },
      fail: function(res) {
        console.log("分享失败");
      }
    }
  }
})