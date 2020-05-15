// packageA/pages/seckill-list/index.js
const api = require('../../../utils/api-tp.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    seckillList: [], //秒杀列表
    pageIndex: 0,
    pageSize: 10,
    hasMore: true,
    current_id: 1,
    zoneList: [
      {
        status: 0,
        title: '已结束',
      },
      {
        status: 1,
        title: '正在秒杀',
      },
      {
        status: 2,
        title: '即将开始',
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    api.isLogin(this);
    this.getList()
  },

  // 商品詳情
  toDetail(e) {
    let { id } = e.currentTarget.dataset
    let url = '/pages/product-detail/index?id=' + id
    wx.navigateTo({ url })
  },

  // 獲取列表
  getList() {
    let { current_id, pageIndex, pageSize, hasMore, seckillList} = this.data
    if(!hasMore) return
    wx.showLoading({
      title: '加载中...',
    })
    api.post({
      url: '/wxsmall/Seckill/getList',
      data:{
        status: current_id,
        page: pageIndex,
        pagesize: pageSize
      },
      success: res => {
        console.log(res)
        let data = res.data.goods_list
        let len = data.length
        let moreFlag = true
        if(!len && pageIndex == 1) {
          // 暫無數據
          return;
        }
        if(len < pageSize) {
          // 無更多數據
          moreFlag = false
        }
        this.setData({
          hasMore: moreFlag,
          pageIndex: pageIndex+ 1,
          seckillList: [...seckillList].concat(data)
        })
      }
    })
  },

  // 选择时区
  tapItem(e) {
    let { id } = e.currentTarget.dataset
    let { zoneList, current_id } = this.data
    if(id === current_id) return
    this.setData({ current_id: id, pageIndex: 1, hasMore: true, seckillList: [] })
    this.getList()
  },

  // 滑动底部时触发
  bindscrolltolower() {
    this.getList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.hideShareMenu()
  },
})