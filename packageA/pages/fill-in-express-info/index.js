const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    delay_flag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    // console.log(ops)
    api.isLogin(this)
    if (ops.refund_id) {
      this.setData({
        refund_id: ops.refund_id
      })

      this.getInfo();
    }
  },

  /**
   * 提交申请
   */
  submitApply() {
    let temp = this.data
    if (temp.delay_flag) {
      this.setData({
        delay_flag: false
      })
      setTimeout(() => {
        this.setData({
          delay_flag: true
        })
      }, 5000)

      if (!temp.current_express_name) {
        wx.showToast({
          title: '请选择快递公司',
          icon: 'none'
        })
        return
      } else if (!temp.express_num) {
        wx.showToast({
          title: '物流单号不能为空',
          icon: 'none'
        })
        return
      } else {
        api.post({
          url: '/wxsmall/Refund/userConfirmExpressData',
          data: {
            token: temp.token,
            refund_id: temp.refund_id,
            express_num: temp.express_num,
            express_name: temp.current_express_name
          },
          success: (res) => {
            console.log(res)
            wx.showToast({
              title: '申请已经提交，请等待！',
              icon: 'none',
              duration: 1500,
              mask: true
            })

            setTimeout(() => {
              wx.redirectTo({
                url: '/packageA/pages/return-detail/index?refund_id=' + temp.refund_id
              })
            }, 1500)
          }
        })
      }
    }
  },

  /**
   * 绑定快递单号
   */
  bindInput(e) {
    this.setData({
      express_num: e.detail.value
    })
  },

  /**
   * 选择当前快递
   */
  selectCur(e) {
    console.log(e)
    let rep = e.currentTarget.dataset
    let express_key = rep.index
    let express_value = rep.name
    this.setData({
      current_express_key: express_key,
      current_express_name: express_value
    })
  },

  getInfo() {
    let temp = this.data
    api.post({
      url: '/wxsmall/Refund/getExpress',
      data: {
        token: temp.token,
        refund_id: temp.refund_id
      },
      success: (res) => {
        console.log(res)
        res = res.data
        this.setData({
          info: res,
          expressList: res.express_list
        })
      }
    })
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