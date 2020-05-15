const api = require('../../utils/api-tp.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAuth: false,
    cell_val: '',
    pwd_val: '',
    code: '', // 验证码 先写死
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  bindCode(e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 执行注册逻辑 授权状态为授权情况
  excuteRegister() {
    let data = this.data
    let flag = false
    let hints = ''
    if (!data.cell_val) {
      hints = '手机号不能为空'
    } else if (!api.isPhoneNo(data.cell_val)) {
      hints = '亲！手机号输入有误'
    } else if (!data.pwd_val) {
      hints = '密码不能为空'
    } else if (data.pwd_val.length < 6 || data.pwd_val.length > 20) {
      hints = '密码长度在为6-20位'
    } else if (!data.code) {
      hints = '验证码不能为空'
    } else {
      flag = true
    }
    if (!flag) {
      wx.showToast({
        title: hints,
        icon: 'none',
        duration: 1500,
        mask: true
      })
      return
    } else { // 验证通过 访问注册接口
      wx.login({
        success: (res) => {
          wx.getUserInfo({ // 获取用户的加密数据
            success(userRes) {
              console.log(userRes)
              let encryptedData = userRes.encryptedData;
              let iv = userRes.iv;
              if (res.code) {
                wx.request({
                  url: app.globalData.api_url + '/wxsmall/Login/getCode',
                  method: "POST",
                  data: {
                    code: res.code,
                    version: 2, // 老版本
                    encryptData: encryptedData,
                    iv: iv,
                    mobile: data.cell_val,
                    password: data.pwd_val,
                    sms_code: data.code // 先随便填写的
                  },
                  success: (codeRes) => {
                    console.log(codeRes)
                    let data = codeRes.data
                    if (data.code == 0) { // 跳转到首页
                      let token = data.data.token
                      wx.setStorageSync('token', token)
                      wx.reLaunch({
                        url: '/pages/home/home',
                      })
                    } else {
                      wx.showModal({
                        title: '提示',
                        content: codeRes.data.message,
                      })
                    }
                  },
                })
              }
            }
          })
        },
      })
    }
  },

  getUserInfo: function(e) {
    let that = this;
    if (!e.detail.userInfo) {
      wx.showModal({
        title: '提示',
        content: '拒绝授权将无法注册!',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            that.setData({
              showAuth: false
            })
          }
        }
      })
      return;
    }
    // 允许逻辑
    that.setData({
      showAuth: false
    })
    that.excuteRegister()
  },

  navRegister() {
    let url = `/pages/register/register`
    wx.navigateTo({
      url,
    })
  },

  // 点击登录
  loginTap() {
    let that = this
    // 先验证用户是否授权
    wx.getSetting({
      success(res) { // 用户没有授权过
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            showAuth: true
          })
        } else { // 已经授权
          that.excuteRegister()
        }
      }
    })
  },

  bindBlur(e) {
    let val = e.detail.value
    if (val && !api.isPhoneNo(val)) {
      wx.showToast({
        title: '亲！手机号输入有误',
        icon: 'none',
        duration: 1500,
        mask: true
      })
    }
  },

  bindCell(e) {
    let cell_val = e.detail.value
    this.setData({
      cell_val
    })
  },

  bindPwd(e) {
    let pwd_val = e.detail.value
    this.setData({
      pwd_val
    })
  },

  onReady: function() {
    wx.hideShareMenu()
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