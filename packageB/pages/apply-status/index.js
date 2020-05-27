// packageB/pages/apply-status/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: '',
    reason: '' // 驳回的原因
   },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opts) {
    // console.log(opts)
    if(opts.status) {
      let { status } = opts
      this.setData({ status })
    }
    if(opts.reason) {
      let { reason } = opts
      this.setData({ reason })
    }
  },

  tapApply() {
    let url = `/packageB/pages/apply-live/apply-live?type=1`
    wx.redirectTo({ url })
  }, 
})