// pages/live-detail/index.js
const app = getApp()
const api = require('../../../utils/api-tp.js')
const Config = require('../../../config.js')
import TIM from 'tim-wx-sdk';
let barrageList = []
let that;
let ops = {
  SDKAppID: 1400366158 // 接入时需要将 0 替换为您的云通信应用的 SDKAppID
};
let tim = TIM.create(ops); // SDK 实例通常用 tim 表示
tim.setLogLevel(1); // 普通级别，日志量较多，接入时建议使用
tim.on(TIM.EVENT.SDK_READY, function(event) {
  // 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
  // event.name - TIM.EVENT.SDK_READY
  console.log(event)
});

tim.on(TIM.EVENT.MESSAGE_REVOKED, function(event) {
  // 收到消息被撤回的通知。使用前需要将SDK版本升级至v2.4.0或以上。
  // event.name - TIM.EVENT.MESSAGE_REVOKED
  // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
  console.log(event)
});

tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function(event) {
  // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
  // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
  // event.data - 存储 Conversation 对象的数组 - [Conversation]
  console.log(event)
});

tim.on(TIM.EVENT.GROUP_LIST_UPDATED, function(event) {
  // 收到群组列表更新通知，可通过遍历 event.data 获取群组列表数据并渲染到页面
  // event.name - TIM.EVENT.GROUP_LIST_UPDATED
  // event.data - 存储 Group 对象的数组 - [Group]
  console.log(event)
});

tim.on(TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED, function(event) {
  // 收到新的群系统通知
  // event.name - TIM.EVENT.GROUP_SYSTEM_NOTICE_RECEIVED
  // event.data.type - 群系统通知的类型，详情请参见 GroupSystemNoticePayload 的 <a href="https://imsdk-1252463788.file.myqcloud.com/IM_DOC/Web/Message.html#.GroupSystemNoticePayload"> operationType 枚举值说明</a>
  // event.data.message - Message 对象，可将 event.data.message.content 渲染到到页面
  console.log(event)
  // 获取提示信息
  if (event.data.message.payload) {
    let temp = event.data.message.payload.userDefinedField  // 数据如：Ares进入了直播间
    // 系统消息区分是观看人数还是进入直播间的提示
    if (temp.indexOf('online_') === -1) { // 进入直播间的提示
      let obj = {}
      if(temp.indexOf('进') > -1) {
        let index = temp.indexOf('进')
        let nickname = temp.substr(0, index)
        let strWithNoNickname = temp.substr(index)
        obj.nickname = nickname
        obj.words = strWithNoNickname
      }else {
        obj.nickname = ''
        obj.words = temp
      }
      obj.color = getRandomFontColor()
      barrageList = [...that.data.barrageList, obj]
      that.setData({ barrageList })
      setScrollTop();
    }else {  // 观看人数
      let index = temp.indexOf('_')
      let final = temp.substr(index + 1)
      that.setData({ online_people: final })
    }
  }
});

tim.on(TIM.EVENT.ERROR, function(event) {
  // 收到 SDK 发生错误通知，可以获取错误码和错误信息
  // event.name - TIM.EVENT.ERROR
  // event.data.code - 错误码
  // event.data.message - 错误信息
  console.log(event)
});

tim.on(TIM.EVENT.SDK_NOT_READY, function(event) {
  // 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
  // event.name - TIM.EVENT.SDK_NOT_READY
  console.log(event)
});

// 自己发送后 在自己的客户端收不到
tim.on(TIM.EVENT.MESSAGE_RECEIVED, function(event) {
  // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
  // event.name - TIM.EVENT.MESSAGE_RECEIVED
  // event.data - 存储 Message 对象的数组 - [Message]
  // console.log(event.data)
  let arr = event.data
  // 设置弹幕数据 针对别人发弹幕
  if (arr[0].nick) {
    let obj = {}
    obj.nickname = arr[0].nick
    obj.words = arr[0].payload.text
    obj.color = getRandomFontColor()
    barrageList = [...that.data.barrageList, obj]
    that.setData({ barrageList })
    setScrollTop();
  }
});


/**
 * 让用户每次发送的数据都能显示在最底部
 */
function setScrollTop() {
  var query = wx.createSelectorQuery(), e = that;
  wx.createSelectorQuery().in(e).select('.barrage').boundingClientRect(function (res) {
    console.log(res)
    e.setData({
      chatbottom: res.bottom,
    })
  }).exec()

  query.in(e).select('.item-outer').boundingClientRect(function (res) {
    if (res.bottom > e.data.chatbottom) {
      let temp = Math.ceil(parseInt(res.bottom) - parseInt(e.data.chatbottom))
      e.setData({
        scrollTop: temp // 如此保证scrollTop的值 让滚动条一直滚动到最后 9999 开发工具可以设置为辞职 苹果真机不行
      })
    }
  }).exec()
}

/**
 * 获取随机颜色
 */
function getRandomFontColor() {
  let red = Math.floor(Math.random() * 266);
  let green = Math.floor(Math.random() * 266);
  let blue = Math.floor(Math.random() * 266);
  return 'rgb(' + red + ',' + green + ' , ' + blue + ')'
}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowW: app.globalData.windowW,
    fullScreenHeight: app.globalData.screenH,
    headerH: app.globalData.CustomBar,
    userId: '', // 用户id
    barrageList: [],
    showInput: false, // 是否显示输入框
    focus: false,
    firstTap: false,
    goodsList: [],
    pageIndex: 1,
    pageSize: 10,
    hasMore: true,
    showGoodsInfo: false,
    showEmpty: false, // 是否展示缺省提示
    ids: '', // 已经选中的商品id
    showTips: false, // 是否显示某个人加入进入直播间
    online_people: '', // 观看人数 
  },

  // 主推商品详情
  toDetail(e) {
    let { id } = e.currentTarget.dataset
    let url = `/pages/product-detail/index?id=${id}`
    wx.navigateTo({
      url,
    })
  },

  preventDefault() {
    return;
  },

  handleCommu() {
    app.msg('该功能仅支持观看者')
  },

  navCart() {
    let url = `/pages/cart/cart`
    wx.navigateTo({ url })
  },

  // 前往商品详情
  navPurchase(e) {
    let url = `/pages/product-detail/index?id=${e.currentTarget.dataset.id}`
    wx.navigateTo({
      url,
    })
  },

  hideGoods() {
    this.setData({ showGoodsInfo: false })
  },

  showGoods() {
    let data = this.data
    if (!data.firstTap) {
      this.getGoodsList()
      this.setData({
        firstTap: true
      })
    }
    this.setData({ showGoodsInfo: true, })
  },

  getGoodsList() {
    let data = this.data
    if (!data.hasMore) return
    api.get({
      url: '/wxsmall/Live/liveCart',
      data: {
        number: data.info.number,
        page: data.pageIndex++,
        pagesize: data.pageSize
      },
      success: res => {
        console.log(res)
        let ret = res.data
        let len = ret.length
        let emptyFlag = false
        let moreFlag = true
        if (!len && data.pageIndex == 2) { // 空数组
          emptyFlag = true
        }
        if (len < data.pageSize) { // 没有更多数据
          moreFlag = false
        }
        let originalList = [...data.goodsList]
        this.setData({
          total: res.total,
          goodsList: originalList.concat(ret),
          hasMore: moreFlag ? true : false,
          showEmpty: emptyFlag ? true : false
        })
      }
    })
  },

  // 获取推流信息
  getPushInfo() {
    let data = this.data
    wx.uploadFile({
      url: Config.HTTP_REQUEST_URL + '/wxsmall/Live/push',
      filePath: data.cover,
      name: 'cover', // 后端需要通过此字段来获取
      header: {
        "Content-Type": "multipart/form-data",
        "Charset": "utf-8"
      },
      formData: {
        token: wx.getStorageSync('token'),
        title: data.live_name,
        goods_ids: data.ids
      },
      success: function (res) {
        res = JSON.parse(res.data)
        if (res.code == 0) { // 推流信息
          that.setData({
            info: res.data,
            main_goods: res.data.main_goods,
            online: res.online
          })
          // 获取推流信息之后登录到IM的服务器
          let promise = tim.login({
            userID: res.data.userid,
            userSig: res.data.usersig
          });
          promise.then(function (imResponse) {
            console.log(imResponse.data); // 登录成功
          }).catch(function (imError) {
            console.warn('login error:', imError); // 登录失败的相关信息
          });
        } else {
          app.msg(res.message)
        }
      },
      fail: function (res) {
        console.log(res)
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },

  // 旋转相机
  rotateTap() {
    this.ctx.switchCamera({
      success: res => {
        console.log('switchCamera success')
      },
      fail: res => {
        console.log('switchCamera fail')
      }
    })
  },

  // 点击返回
  handleBackTap() {
    wx.showModal({
      title: '提示',
      content: '返回即代表结束直播，确定退出吗？',
      success: res => {
        if (res.confirm) {
          wx.navigateBack({
            delta: 1
          })
          // 退出
          that.handleIMLogout()
        }
      }
    })
  },

  /**
   * 通过IM的api调用
   */
  // 退出登录 登出IM服务器
  handleIMLogout() {
    let promise = tim.logout();
    if(promise) {
      promise.then(function (imResponse) {
        console.log(imResponse.data); // 登出成功
      }).catch(function (imError) {
        console.warn('logout error:', imError);
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...',
    })
    that = this;
    // 设置屏幕常亮 兼容ios
    wx.setKeepScreenOn({ keepScreenOn: true })
    // 设置屏幕亮度 0-1范围 设置了 用户自己去设置调节屏幕的亮度
    // wx.setScreenBrightness({ value: .6 }) 
    
    that.ctx = wx.createLivePusherContext('pusher')
    if (options.object) {
      let parse = JSON.parse(options.object)
      let { name, cover, ids } = parse
      that.setData({
        live_name: name,
        cover,
        ids,
      })
      that.getPushInfo()
    }
  },


  onReady(res) {
    this.ctx = wx.createLivePusherContext('pusher')
  },

  // 页面销毁
  onUnload() {
    that.handleIMLogout()
  },

  // 主播分享自己的直播间
  onShareAppMessage: function() {
    let { number} = this.data.info
    return {
      title: '直播间分享啦！',
      imageUrl: this.data.cover,
      path: `/pages/load/load?number=${number}&invite_code=${app.globalData.invite_code}`,
      success: function (res) {
        console.log("转发成功:");
      },
      fail: function (res) {
        console.log("转发失败:");
      }
    }
  }
})