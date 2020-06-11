//app.js
const api = require('/utils/api-tp.js');
import TIM from 'tim-wx-sdk';
App({
  onLaunch: function(option) {
    console.log(option)
    const that = this
    // 针对自定义头部添加
    wx.getSystemInfo({
      success: e => {
        // console.log(e)
        this.globalData.windowW = e.windowWidth
        this.globalData.windowH = e.windowHeight
        this.globalData.screenH = e.screenHeight; // 手机屏幕总高度
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })

    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    });
    updateManager.onUpdateFailed(function () {
      return that.msg('新版本下载失败')
    })

    if(that.globalData.CustomBar && that.globalData.StatusBar) {
      if (option.query.hasOwnProperty('scene')) {
        switch (option.scene) {
          //扫描小程序码
          case 1047:
            this.globalData.invite_code = option.query.scene;
            break;
          //长按图片识别小程序码
          case 1048:
            var scene = decodeURIComponent(option.query.scene); // 参数形如： 565256_EGJLS
            if (scene.indexOf('_') > -1) { // 传递房间号与邀请码
              let [number, invite_code] = scene.split('_')
              app.globalData.invite_code = invite_code;
              app.globalData.number = number;
              app.globalData.openPages = `/pages/live-detail/live-detail?number=${number}&backHomeFlag=true`
              wx.redirectTo({ url: `/pages/load/load` })
            } else { // 只是传递房间号 进入房间即可 // 参数形如： 565256
              app.globalData.number = scene;
              app.globalData.openPages = `/pages/live-detail/live-detail?number=${number}&backHomeFlag=true`
              wx.redirectTo({ url: `/pages/load/load` })
            }
            break;
          //手机相册选取小程序码
          case 1049:
            break;
          //直接进入小程序
          case 1001:
            break;
        }
      }
    }

    // 如果用户已登录
    if(this.hasLogin()) {
      this.getUserInfo()
    }

    let ops = {
      SDKAppID: 1400310038 // 接入时需要将 0 替换为您的云通信应用的 SDKAppID
    };
    // 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
    let tim = TIM.create(ops); // SDK 实例通常用 tim 表示

    // 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
    // tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
    tim.setLogLevel(1); // release级别，SDK 输出关键信息，生产环境时建议使用
  },

  // 获取用户信息
  getUserInfo() {
    const token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/User/getUserInfo',
      data: {
        token,
      },
      success: res => {
        console.log(res)
        let { type, live_status, invite_code } = res.data
        this.globalData.userType = type
        this.globalData.live_status = live_status
        this.globalData.invite_code = invite_code
        if (res.data.hasOwnProperty('reason')) {
          this.globalData.reason = res.data.reason
        }
      }
    })
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
    share_img: 'https://kebo.weirong100.com/static/home/img/shop/img.jpg',
    userType: null, // 用户身份标识
    live_status: '', // live_status 0=可申请 1=审核中 3=直播封禁 4=重复申请
    reason:'', // 审核被驳回的原因
    invite_code: '' , // 用户邀请码
    number: '', // 主播房间号
    indexPage: '/pages/live/live', // tabbar的分享进入的路径
    indexTitle: '好物可播小程序分享啦'
  },
})