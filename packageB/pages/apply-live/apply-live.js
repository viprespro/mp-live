const api = require('../../../utils/api-tp.js')
import { $verify, $api } from '../../../common/utils.js'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: '',
    pay: '', // 入驻支付费用
    array: [],
    shop_list: [], // 机构列表
    hobbiesList: [],
    // 验证码
    btnValue: '获取验证码',
    btnDisabled: false,
    cell: '',
    code: '',
    currentType: '',
    selected_shop_id: '', // 已经选中的机构的id

    // 可播新增
    type: 1,
    title: '',
    notes: '', // 说明
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if(options.type){
      let arr = ['','申请入驻主播','申请入驻经纪人','申请入驻服务商','申请入驻合伙人']
      this.setData({ title: arr[options.type], type: Number(options.type)})
      this.getPageInfo()
    }   
  },

  // 获取页面信息
  getPageInfo() {
    let { type } = this.data
    api.get({
      url: '/wxsmall/live/getInfo',
      method: 'GET',
      data: {
        type
      },
      success: res => {
        console.log(res)
        res = res.data
        this.setData({ fee: res.fee, notes: res.explain })
      }
    })
  },

  /**
   * 验证手机
   */
  bindPhoneBlur(e) {
    let { value } = e.detail
    if(!value) return
    if(!$verify.isPhoneNo(value)) {
      $api.msg('手机号输入有误')
    }
  },

  /**
   * 绑定手机号
   */
  bindPhone(e) {
    this.setData({ cell: e.detail.value })
  },

  bindCode(e) {
    this.setData({ code: e.detail.value })
  },

  /**
   * 获取验证码
   */
  tapGetCode(){
    let { btnDisabled, cell } = this.data
    if(!$verify.isPhoneNo(cell)) return $api.msg('手机号输入有误')
    if(btnDisabled) return
    // 获取验证码
    api.post({
      url: '/wxsmall/Login/sendSms',
      data: {
        mobile: cell,
        format: 'live_apply'
      },
      success: res => {
        if(res.code == 0){
          this.setData({ btnDisabled: true, btnValue: 60 + 's' })
          let counts = 60
          let timer = setInterval(() => {
            if (counts == 1) {
              clearInterval(timer)
              this.setData({ btnValue: '点击重新获取', btnDisabled: false })
              return
            }
            counts -= 1
            this.setData({ btnValue: counts + 's' })
          }, 1000)
        }else {
          $api.msg(res.message)
        }
      }
    })
  },

  /**
   * 兴趣爱好选择
   */
  itemSelected(e) {
    let { index } = e.currentTarget.dataset
    let arr = [...this.data.hobbiesList]
    arr.map((item,i) => {
      if(index == i) {
        item.selected = !item.selected
      }
    })
    this.setData({ hobbiesList: arr })
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    let { value } = e.detail
    let { shop_list } = this.data
    // 根据索引去拿到当前选中的id
    this.setData({
      index: e.detail.value,
      selected_shop_id: shop_list[value].id
    })
  },

  loadData() {
    let { currentType } = this.data
    api.get({
      url: '/wxsmall/Live/applyPage',
      data: {
        type: currentType  // 刚好与type对应 0平台 1机构哦
      },
      success: res => {
        console.log(res)
        res = res.data
        // 为每个爱好添加selected字段
        if (res.category_list.length) {
          res.category_list.map((item) => {
            item.selected = false
          })
        }
        let arr = [] // 存放机构数据
        if(res.shop_list && res.shop_list.length) {
          res.shop_list.map((item)=> {
            arr.push(item.name)
          })
        }
        this.setData({
          hobbiesList: res.category_list,
          pay: res.price - 0,
          shop_list: currentType == 1 ? res.shop_list: null,
          array: currentType == 1 ? arr : [],
        })      
      }
    })
  },

  // 提交申请
  handleSubmit() {
    let data = this.data
    let { cell, code, type, fee } = data
    let flag = false
    let hints = ''

    if (!cell) {
      hints = '手机号不能为空'
    }else if(!$verify.isPhoneNo(cell)) {
      hints = '手机号输入有误'
    }else if (!code) {
      hints = '验证码不能有空'
    }else {
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
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let token = wx.getStorageSync('token')
    api.post({
      url: '/wxsmall/Live/apply',
      data: {
        token,
        mobile: cell,
        sms_code: code,
        type,
      },
      success: res => {
        console.log(res)
        if(res.code == 0){
          wx.hideLoading()
          res = res.data
          // 发起支付
          wx.requestPayment({
            timeStamp: res.timeStamp,
            nonceStr: res.nonceStr,
            package: res.package,
            signType: 'MD5',
            paySign: res.paySign,
            success(res) {
              console.log(res)
              if (res.errMsg === 'requestPayment:ok') {
                let title = ''
                if(type == 1) {
                  title = '已提交，等待后台审核！'
                }else {
                  title = '已提交'
                }
                wx.showToast({
                  title,
                  icon: 'none',
                  duration: 1500,
                  mask: true
                })

                if(type === 1) { // z手动改变
                  app.globalData.live_status = 1
                }

                setTimeout(() => {
                  // 此时返回上页 如果再次申请 必然是申请不了的 后台自己判断就行了
                  wx.navigateBack({
                    delta: 1
                  })
                }, 1500)
              }
            },
            fail(res) {
              console.log(res)
              wx.showToast({
                title: '支付取消',
                icon: 'none',
                duration: 1500
              })
            }
          })
        }else {
          $api.msg(res.message)
        }
      }
    })
  },

  bindUsername(e) {
    this.setData({
      username: e.detail.value
    })
  },

  bindPwd(e) {
    let value = e.detail.value
    this.setData({
      password: value
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