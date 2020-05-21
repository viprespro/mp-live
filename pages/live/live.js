const app = getApp()
const api = require('../../utils/api-tp.js')
Page({
  data: {
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
    navList: [
      {
        id: 1,
        iconPath: '/images/live/nav01.png',
        title: '入驻主播'
      },
      {
        id: 2,
        iconPath: '/images/live/nav02.png',
        title: '入驻经纪人'
      },
      {
        id: 3,
        iconPath: '/images/live/nav03.png',
        title: '入驻服务商'
      },
      {
        id: 4,
        iconPath: '/images/live/nav04.png',
        title: '入驻合伙人'
      }
    ],
    flashList: [] , // 幻灯片
    swiperCurIndex: 1,
    left: 100
  },

  onLoad: function() {
    this.getList()
  },

  bindscroll(e){
    console.log(e)
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
    let { type } = e.currentTarget.dataset
    console.log(type)

    console.log(app.globalData.type)
    // if(app.globalData.type >= ++type) return
    let url = `/packageB/pages/apply-live/apply-live?type=${type}`
    wx.navigateTo({ url })
  },

  // 点击幻灯片去直播间
  toLive(e) {
    let { id } = e.currentTarget.dataset
    console.log(id)
    if(id == 0) return
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
      }else {
        let number = temp.number
        let url = temp.url
        let like = temp.like
        setTimeout(() => {
          wx.navigateTo({
            url: `/pages/live-detail/live-detail?number=${number}&url=${encodeURIComponent(url)}&like=${like}`,
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
    setTimeout(() => {
      wx.stopPullDownRefresh()
    },200)
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
    if (navIndex == 1) { // 关注的时候需要传token
      api.isLogin(this)
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
    wx.showLoading({
      title: '加载中...',
    })
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
        
        if(data.pageIndex == 2) {
          // 幻灯片
          let flash = res.flash_list
          this.setData({ flashList: flash })
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
    this.getList()
  },
  
  onShareAppMessage: function() {
    return {
      title: '华纳播播',
      path: '/pages/live/live',
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