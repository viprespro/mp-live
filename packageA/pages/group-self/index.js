const api = require('../../../utils/api-tp.js')
const wxh = require('../../../utils/wxh.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    if (api.isLogin(this)){
      if (ops.id) {
        this.setData({
          order_id: ops.id //订单id
        })
      }
      this.getGroupInfo();
    }
  },

  setTouchMove: function (e) {
    var that = this;
    if (e.touches[0].clientY < 500 && e.touches[0].clientY > 0) {
      that.setData({
        top: e.touches[0].clientY
      })
    }
  },

  /**
   * 抢好货
   */
  goDetail() {
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + this.data.goods_id,
    })
  },

  getGroupInfo() {
    let rep = this.data;
    api.post({
      url: '/wxsmall/Group/groupDetail',
      data: {
        token: rep.token,
        order_id: rep.order_id
      },
      success: (res) => {
        console.log(res)
        // 判断人数设置状态
        let ret = res.data;
        console.log(ret)
        if (ret.person - ret.record_person == 0) {
          this.setData({
            status: true,
            groupInfo: res.data,
            goods_id: res.data.goods_id
          })
          return;
        }

        // 倒计时
        let end_time = res.data.end_time; // 时间戳
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
          } else {
            this.setData({
              status: false
            })
          }
          let _countDown = {
            days: days,
            hrs: hrs,
            mm: mm,
            ss: ss
          }
          this.setData({
            countDown: _countDown
          })
        }, 1000)

        this.setData({
          groupInfo: res.data,
          goods_id: res.data.goods_id,
          group_record_id: res.data.group_record_id // 拼团id
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function(ops) {
    let rep = this.data;
    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
    }
    console.log(rep.group_record_id)
    return {
      title: rep.groupInfo.share_title ,
      imageUrl: rep.groupInfo.share_img , //图片地址
      path: '/pages/product-detail/index?id=' + rep.goods_id + '&group_record_id=' + rep.group_record_id, 
      success: function(res) {
        // 转发成功
        console.log("转发成功:");
      },
      fail: function(res) {
        // 转发失败
        console.log("转发失败:");
      }
    }
  }
})