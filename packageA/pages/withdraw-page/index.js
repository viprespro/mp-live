const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    console.log(ops)
    if (ops.balance) {
      this.setData({
        balance: ops.balance
      })
    }
    api.isLogin(this);
  },

  // 支付宝账号可能是邮箱和手机号
  bindAliAccount(e) {
    let value = e.detail.value
    this.setData({
      aliAccount: value
    })
  },

  bindRealname(e) {
    this.setData({
      realname: e.detail.value
    })
  },

  bindMoney(e) {
    this.setData({
      curVal: e.detail.value
    })
  },

  /**
   * 全部提现
   */
  withdrawAll() {
    let _val = this.data.balance;
    if(_val == 0) return
    this.setData({
      curVal: _val
    })
  },

  /**
   * 申请提现
   */
  applyToWithdraw() {
    let rep = this.data;
    if (!rep.disabled) {
      this.setData({
        disabled: true
      })

      setTimeout(() => {
        this.setData({
          disabled: false
        })
      }, 3000) // 3秒之后才能重新申请

      let _curVal = rep.curVal;
      if (!rep.realname) {
        wx.showToast({
          title: '姓名不能为空',
          icon: "none",
          duration: 1500,
        })
        return;
      } else if (!rep.aliAccount) {
        wx.showToast({
          title: '请填写支付宝账号',
          icon: "none",
          duration: 1500,
        })
        return;
      } else if (!api.isPhoneNo(rep.aliAccount) && !api.isEmail(rep.aliAccount)) {
        wx.showToast({
          title: '支付宝账号有误',
          icon: "none",
          duration: 1500,
        })
        return;
      } else if (!_curVal || _curVal == 0) {
        wx.showToast({
          title: '提现金额有误',
          icon: "none",
          duration: 1500,
        })
        return;
      } else if (Number(_curVal) > Number(rep.balance)) {
        wx.showToast({
          title: '提现金额超过最大金额',
          icon: 'none',
          duration: 1500
        })
        return;
      }
      api.post({
        url: '/wxsmall/Withdraw/withdraw',
        data: {
          token: rep.token,
          zhifubao_realname: rep.realname,
          zhifubao_account: rep.aliAccount,
          price: _curVal,
        },
        success: (res) => {
          console.log(res)
          wx.showToast({
            title: '申请成功',
            duration: 1500
          })

          this.setData({
            balance: Number(rep.balance - _curVal),
            curVal: null
          })
        }
      })

    }


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