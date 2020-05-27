//app.js
const api = require('/utils/api-tp.js');
import TIM from 'tim-wx-sdk';
App({
  onLaunch: function(e) {
    // console.log(e)
    const scene = e.query.scene // 邀请码
    if (scene) {
      this.globalData.invite_code = scene; // 保存全局
      wx.redirectTo({
        url: '/pages/live-detail/live-detail?number=' + scene,
      })
    }

    // 针对自定义头部添加
    wx.getSystemInfo({
      success: e => {
        this.globalData.screenH = e.screenHeight; // 手机屏幕总高度
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })

    this.getSysInfo();
    this.getUserInfo()

    let ops = {
      SDKAppID: 1400310038 // 接入时需要将 0 替换为您的云通信应用的 SDKAppID
    };
    // 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
    let tim = TIM.create(ops); // SDK 实例通常用 tim 表示

    // 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
    // tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
    tim.setLogLevel(1); // release级别，SDK 输出关键信息，生产环境时建议使用
  },

  /**
   * 获取设备信息
   */
  getSysInfo: function() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.windowW = res.windowWidth
        this.globalData.windowH = res.windowHeight
      },
    })
  },

  // 获取用户信息
  getUserInfo() {
    let token = wx.getStorageSync('token')
    if(token) {
      api.get({
        url: '/wxsmall/User/getUserInfo',
        data: {
          token,
        },
        success: res => {
          console.log(res)
          let { type,live_status} =  res.data
          this.globalData.userType = type
          this.globalData.live_status = live_status
          if(res.data.hasOwnProperty('reason')) {
            this.globalData.reason = res.data.reason
          }
        }
      })
    }
  },


  msg(title, duration = 1500, mask = true, icon = 'none') {
    if (Boolean(title) === false) return
    wx.showToast({
      title,
      icon,
      duration,
      mask
    })
  },

  hasLogin() {
    let token = wx.getStorageSync('token')
    if (!token) {
      return false
    }
    return true
  },

  /**
   * 全局变量定义
   */
  globalData: {
    userInfo: null,
    bind_phone: '', //绑定过的手机号
    invite_code: '', // 邀请码
    windowW: '',
    windowH: '',
    openPages: '',
    locte_cate: {}, //用于定位分类栏
    logo: '',
    share_img: '',
    userType: null, // 用户身份标识
    live_status: '', // live_status 0=可申请 1=审核中 3=直播封禁 4=重复申请
    reason:'', // 审核被驳回的原因
  },
})