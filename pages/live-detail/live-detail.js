// pages/live-detail/index.js
const app = getApp()
const api = require('../../utils/api-tp.js')
import TIM from 'tim-wx-sdk';
let barrageList = []
let that;
let ops = {
  SDKAppID: 1400366158 // 接入时需要将 0 替换为您的云通信应用的 SDKAppID
};
let tim = TIM.create(ops); // SDK 实例通常用 tim 表示
tim.setLogLevel(1); // 普通级别，日志量较多，接入时建议使用

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
  if (event.data.message.payload) {
    let temp = event.data.message.payload.userDefinedField  // 数据如：Ares进入了直播间
    // 系统消息区分是观看人数还是进入直播间的提示
    if (temp.indexOf('online_') === -1) { // 进入直播间的提示
      let obj = {}
      if (temp.indexOf('进') > -1) {
        let index = temp.indexOf('进')
        let nickname = temp.substr(0, index)
        let strWithNoNickname = temp.substr(index)
        obj.nickname = nickname
        obj.words = strWithNoNickname
      } else {
        obj.nickname = ''
        obj.words = temp
      }
      obj.color = getRandomFontColor()
      barrageList = [...that.data.barrageList, obj]
      that.setData({ barrageList })
      setScrollTop();
    } else {  // 观看人数
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
  // console.log(event)
  let arr = event.data

  // 获取是谁发的
  // console.log(event.data[0].nick)
  // 获取到的文字信息
  // console.log(event.data[0].payload.text)

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
 * 获取随机颜色
 */
function getRandomFontColor() {
  let red = Math.floor(Math.random() * 266);
  let green = Math.floor(Math.random() * 266);
  let blue = Math.floor(Math.random() * 266);
  return 'rgb(' + red + ',' + green + ' , ' + blue + ')'
}

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


Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowW: app.globalData.windowW,
    fullScreenHeight: app.globalData.screenH,
    headerH: app.globalData.CustomBar,
    follow: true,
    inputVal: '',
    userId: '', // 用户id
    groupId: null, // 群id
    playUrl: '', // 拉流地址
    barrageList: [],
    showInput: false, // 是否显示输入框
    focus: false,
    goodsList: [],
    pageIndex: 1,
    pageSize: 10,
    hasMore: true,
    showGoodsInfo: false,
    firstTap: false,
    showEmpty: false, // 是否展示缺省提示
    nickname: '', // 当前用户昵称
    scrollTop: '', // 设置cover-view 设置顶部滚动的偏移量
    count: 0, // 点赞数
    online: '',
    showTips: false, // 是否显示某个人加入进入直播间
    online_people: '', // 观看人数 
  },

  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...',
    })
    that = this;
    
    // 设置屏幕常亮 兼容ios
    wx.setKeepScreenOn({ keepScreenOn: true })
    // 设置屏幕亮度 0-1范围
    wx.setScreenBrightness({ value: .6 })

    // 获取用户昵称
    that.getUserInfo()

    // 实现登录用户扫码进入直播间返回
    if (options.backHomeFlag) {
      this.setData({
        backHomeFlag: options.backHomeFlag
      })
    }

    if(options.like) {
      this.setData({ count: options.like })
    }

    if (options.number) {
      this.setData({
        number: options.number
      })
      this.getLiveInfo()
    }

    let query = wx.createSelectorQuery()
    query.select('.barrage').boundingClientRect(function(rect) {
      console.log(rect)
    }).exec();

  },

  // 主推商品详情
  toDetail(e) {
    let { id } = e.currentTarget.dataset
    let { number } = this.data // number表明来自于当前主播
    let url = `/pages/product-detail/index?id=${id}&number=${number}`
    wx.navigateTo({
      url,
    })
  },

  handleLikeClick() {
    this.setData({
      count: Number(this.data.count) + 1
    });
  },


  preventDefault(e) {
    return;
  },

  getUserInfo() {
    let token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/User/getUserInfo',
      data: {
        token,
      },
      success: res => {
        console.log(res)
        let {
          nickname,
          avatar
        } = res.data
        this.setData({
          nickname,
          avatar
        })
      }
    })
  },

  hideGoods() {
    this.setData({
      showGoodsInfo: false
    })
  },

  showGoods() {
    let data = this.data
    if (!data.firstTap) {
      this.getGoodsList()
      this.setData({
        firstTap: true
      })
    }
    this.setData({
      showGoodsInfo: true,
    })
  },

  getGoodsList() {
    let data = this.data
    if (!data.hasMore) return
    api.get({
      url: '/wxsmall/Live/liveCart',
      data: {
        number: data.number,
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

  navCart() {
    let url = `/pages/cart/cart`
    wx.navigateTo({
      url,
    })
  },

  navPurchase(e) {
    let { number } = this.data // number表明来自于当前主播
    let url = `/pages/product-detail/index?id=${e.currentTarget.dataset.id}&number=${number}`
    wx.navigateTo({
      url,
    })
  },

  // textarea失去焦点触发
  bindBlur() {
    this.setData({
      showInput: false,
      fullScreenHeight: app.globalData.screenH
    })
  },

  // 获取直播信息
  getLiveInfo() {
    let token = wx.getStorageSync('token')
    let data = this.data
    api.get({
      url: '/wxsmall/Live/viewLive',
      data: {
        token,
        number: data.number
      },
      success: res => {
        console.log(res)
        //意外情况
        if (res.code == 1) {
          wx.showToast({
            title: res.message,
            duration: 2000,
            icon: 'none'
          })
          setTimeout(() => {
            let pages = getCurrentPages()
            if (pages.length > 1) {
              wx.navigateBack({
                delta: 1
              })
            }else {
              wx.switchTab({
                url: '/pages/live/live',
              })
            }
          }, 2000)
          return;
        }
        res = res.data
        // 登录到即时通讯服务器
        let promise = tim.login({
          userID: res.userid,
          userSig: res.usersig
        });
        promise.then(function(imResponse) {
          console.log(imResponse.data); // 登录成功
          wx.hideLoading()
          // 用户端模拟发送 后备使用这种方式
          let obj = {}
          obj.nickname = data.nickname
          obj.words = '进入了直播间'
          obj.color = getRandomFontColor()
          barrageList = [...that.data.barrageList, obj]
          that.setData({ barrageList })
          setScrollTop();
        }).catch(function(imError) {
          console.warn('login error:', imError); // 登录失败的相关信息
        });
        this.setData({
          userId: res.userid,
          groupId: res.groupid,
          playUrl: res.url,
          other_info: res,
          follow: res.is_follow,
          main_goods: res.main_goods,
          online_people: res.online
        })
      }
    })
  },


  /**
   * 发送弹幕问题
   */
  sendTap() {
    let data = this.data
    if (!data.inputVal) {
      wx.showToast({ title: '发送内容不能为空', duration: 1500, icon: 'none', mask: true })
      return;
    }
    
    // 针对自己发送的弹幕
    setTimeout(() => {
      let arr = []
      let curObj = {}
      curObj.nickname = data.nickname
      curObj.words = data.inputVal
      curObj.color = getRandomFontColor()
      curObj.avatar = data.avatar
      arr.push(curObj)
      this.setData({
        barrageList: data.barrageList.concat(arr),
        inputVal: null
      })
      // 设置scrollTop的值
      setScrollTop()
    }, 500)

    // 1. 创建消息实例，接口返回的实例可以上屏
    let message = tim.createTextMessage({
      to: data.groupId,
      conversationType: TIM.TYPES.CONV_GROUP,
      payload: {
        text: data.inputVal
      }
    });

    // 2. 发送消息
    let promise = tim.sendMessage(message);
    promise.then(function(imResponse) {
      // 发送成功
      console.log(imResponse);
    }).catch(function(imError) {
      // 发送失败
      console.warn('sendMessage error:', imError);
    });
  },


  bindInput(e) {
    this.setData({
      inputVal: e.detail.value
    })
  },

  interactionTap() {
    let data = this.data
    let temp;
    if (!data.showInput) {
      temp = data.fullScreenHeight - 50
    } else {
      temp = app.globalData.screenH
    }
    this.setData({
      showInput: !this.data.showInput,
      fullScreenHeight: temp,
      focus: true
    })
  },

  followTap() {
    wx.showToast({
      title: '已关注',
      icon: 'none'
    })
    let token = wx.getStorageSync('token')
    let data = this.data
    api.post({
      url: '/wxsmall/Live/followLive',
      data: {
        token,
        number: data.number
      },
      success: res => {
        console.log(res)
        if(res.code != 0) {
          app.msg(res.message)
        }
      }
    })

    this.setData({
      follow: true
    })
  },

  onReady(res) {
    this.ctx = wx.createLivePlayerContext('player')
  },
  statechange(e) {
    console.log('live-player code:', e.detail.code)
  },
  error(e) {
    console.error('live-player error:', e.detail.errMsg)
  },


  onUnload() {
    this.backTap()
  },

  backTap() {
    // 退出IM服务器
    let promise = tim.logout();
    if(promise) {
      promise.then(function (imResponse) {
        console.log(imResponse.data); // 登出成功
        // 访问接口 后端调用IM发送系统消息
        api.post({
          url: '/wxsmall/Live/exitLiveByUser',
          data: {
            number: that.data.number,
            token: wx.getStorageSync('token')
          },
          success: res => {
            console.log(res)
          }
        })
      }).catch(function (imError) {
        console.warn('logout error:', imError);
      });
    }
    // 扫码进入退出时候回到首页
    if (that.data.backHomeFlag) {
      wx.switchTab({
        url: '/pages/live/live',
      })
    } else {
      wx.navigateBack({
        delta: 1
      })
    }
  },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
    let { number } = this.data
    return {
      title: '直播间分享啦！',
      imageUrl: '',
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