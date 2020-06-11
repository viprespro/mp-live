const app = getApp()
const api = require('../../utils/api-tp.js')
const Config = require('../../config.js')
import {
  $api
} from '../../common/utils.js'
Page({
  data: {
    loading: true,
    navIndex: 0,
    liveList: [],
    pageIndex: 1,
    hasMore: true,
    reload: false,
    pageSize: 10,
    indicatorDots: false,
    vertical: false,
    autoplay: true,
    interval: 3000,
    duration: 500,
    circular: true,
    showEmpty: false,
    cateList: [ // 直播分类
      {
        id: null,
        name: '精选'
      }, {
        id: null,
        name: '关注'
      }
    ],
    cate_id: '',
    navList: [{
        type: 1,
        iconPath: '/images/live/nav01.png',
        title: '入驻主播'
      },
      {
        type: 2,
        iconPath: '/images/live/nav02.png',
        title: '入驻经纪人'
      },
      {
        type: 3,
        iconPath: '/images/live/nav03.png',
        title: '入驻服务商'
      },
      {
        type: 4,
        iconPath: '/images/live/nav04.png',
        title: '入驻合伙人'
      }
    ],
    flashList: [], // 幻灯片
    swiperCurIndex: 1,
    left: 100,
    // showjoo: 1
  },

  onLoad: function(opts) {
    // 这是进入的首页 虽然后端在设置海报分享的时候配置的是load/load
    // 以防万一会走这里
    if (opts.scene) {
      var scene = decodeURIComponent(opts.scene); // 参数形如： 565256_EGJLS
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
    }
    var e = this;
    wx.request({
      url: `${Config.HTTP_REQUEST_URL}/wxsmall/index/api`,
      header: {
        "content-type": "application/json"
      },
      success: function(t) {
        // console.log(t)
        e.setData({
          showjoo: t.data.data
        });
      },
      fail: function(err) {
        e.setData({
          showjoo: 1
        });
      }
    })
  },
  
  onShow() {
    this.getList()
  },

  bindChange(e) {
    let current = e.detail.current
    this.setData({
      swiperCurIndex: current + 1
    })
  },

  /**
   * 首页导航
   */
  tapItem(e) {
    let url = ''
    let {
      type
    } = e.currentTarget.dataset
    let {
      userType,
      live_status,
      reason
    } = app.globalData
    // console.log('用户当前身份类型' + userType)
    // console.log('想要申请类型' + type)
    // console.log('申请状态' + live_status)
    // console.log('如果被驳回的原因是' + reason)
    // 申请入驻的条件为 入驻身份不能低于或等于当前身份
    if (userType >= type) {
      $api.msg('入驻身份不能低于当前身份')
      return;
    }
    if (live_status == 1 || (live_status == 0 && reason)) { // 入驻主播正在申请中
      url = `/packageB/pages/apply-status/index?status=${live_status}&reason=${reason}`
    } else {
      url = `/packageB/pages/apply-live/apply-live?type=${type}`
    }
    wx.navigateTo({
      url
    })
  },

  // 点击幻灯片去直播间
  toLive(e) {
    let {
      id
    } = e.currentTarget.dataset
    console.log(id)
    if (id == 0) return
    let like;
    let url;
    setTimeout(() => {
      wx.navigateTo({
        url: `/pages/live-detail/live-detail?number=${id}&url=${encodeURIComponent(url)}&like=${like}`,
      })
    }, 200)
  },

  navDetail(e) {
    if (api.isLogin(this)) {
      let temp = e.currentTarget.dataset
      let flag = temp.live
      if (!flag) {
        app.msg('当前未开播')
      } else {
        let number = temp.number
        let like = temp.like
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/live-detail/live-detail?number=${number}&like=${like}`,
          })
        }, 200)
      }
    }
  },

  onPullDownRefresh() {
    this.setData({
      reload: true,
      hasMore: true,
      pageIndex: 1
    })

    this.getList()
    // 调用getUserInfo接口
    app.getUserInfo()
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 200)
  },

  // 导航切换
  navTap(e) {
    let temp = e.currentTarget.dataset
    let navIndex = temp.index
    let id = temp.id
    if (navIndex == this.data.navIndex) return
    let cate_id = ''
    if (id) {
      cate_id = id
    }
    this.setData({
      navIndex,
      reload: true,
      pageIndex: 1,
      hasMore: true,
      cate_id,
      scrollLeft: navIndex * 50
    })
    this.getList()
  },

  // 获取直播列表
  getList() {
    let data = this.data
    if (!data.hasMore) return
    let token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/Live/getList',
      data: {
        token: data.navIndex == 1 ? token : '',
        page: data.pageIndex++,
        type: data.cate_id ? '' : data.navIndex,
        pagesize: data.pageSize,
        cate_id: data.cate_id
      },
      success: res => {
        console.log(res)

        this.setData({
          loading: false
        })

        if (data.pageIndex == 2) {
          // 幻灯片
          let flash = res.flash_list
          this.setData({
            flashList: flash
          })
        }

        if (data.pageIndex == 2 && !data.reload) {
          let cate = [...this.data.cateList]
          this.setData({
            cateList: cate.concat(res.category_list)
          })
        }

        res = res.data
        for (let i in res) {
          res[i].like = this.getRandomNumber()
        }
        let len = res.length
        let flag = false
        let emptyFlag = false
        if (!len && data.pageIndex == 2) { // 空数据
          emptyFlag = true
        }

        if (len < data.pageSize) { // 没有更多数据
          flag = true
        }

        this.setData({
          liveList: data.reload ? res : data.liveList.concat(res),
          hasMore: flag ? false : true,
          reload: false,
          showEmpty: emptyFlag ? true : false
        })
      }
    })
  },

  getRandomNumber() {
    let number = Math.floor(Math.random() * 15000)
    return number
  },

  onReachBottom() {
    const { hasMore } = this.data
    if(hasMore) {
      this.getList()
    }
  },

  onShareAppMessage: function() {
    return {
      title: app.globalData.indexTitle,
      path: app.globalData.indexPage,
      success: (res) => {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 1500
        })
      }
    }
  }
})