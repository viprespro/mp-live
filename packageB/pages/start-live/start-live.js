const app = getApp()
const api = require('../../../utils/api-tp.js')
import { $api } from '../../../common/utils.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    live_name: '',
    cover: '', // 封面图片
    cateList: [],
    selectedId: null,
    navHeight: app.globalData.CustomBar,
    showModal: false,
    allSelected: false, // 是否全选
    pageIndex: 1,
    pageSize: 10,
    goodsList: [],
    s1: true,
    p1: true,
    c1: true,
    keywords: '', // 搜索的关键字
    reload: false, // 是否重新加载
    hasMore: true, // 更多数据
    inputValue: '', // 绑定输入框的值
    dataStatus: '', // 数据状态 
    showDefault: false, // 显示缺省
    curSortIdx: 0, // 当前默认分类
    opsIdx: 0, // 用于区分是主推选择还是附带选择
    main_goods_id: '', //主推商品ID
    goods_ids:'', // 附带商品ids
    main: '', // 主推选择 选择之后
    extra: '', // 附带选择
    selectedLength: 0, // 选择的个数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCate() // 直播分类
    this.getGoodsList() // 商品商品列表
  },

  /**
   * 用于判断goodsList中有多少被选中的
   */
  hasChosen() {
    let arr = [...this.data.goodsList]
    let newArr = []
    arr.map((item) => {
      if(item.checked) {
        newArr.push(item.id)
      }
    })
    return newArr;
  },

  // 确认选择带货的商品 主推商品选择一个 附带选择可以多个
  confirmChoose() {
    let { opsIdx, goodsList } = this.data
    if(opsIdx == 0) {
      let checked = this.hasChosen()
      if(checked.length > 1) {
        return $api.msg('主推选择只能选择一个')
      }
       // 否则记录一下 当前选中的数据
      this.setData({ main_goods_id: checked[0], main: '已选择',  selectedLength: 0 })
    }
    
    if(opsIdx == 1) {
      let checked = this.hasChosen()
      this.setData({ goods_ids: checked.join(','), extra: '已选择', selectedLength: 0 })
    }

    let arr = [...goodsList]
    arr.map((item) => {
      item.checked = false
    })

    this.hideModal();

    this.setData({ goodsList: arr })
  },

  bindScrollToBottom() {
    // console.log(123)
    this.getGoodsList()
  },

  tapSort(e) {
    let { index } = e.currentTarget.dataset
    let { s1, p1, c1 } = this.data
    switch( index ) {
      case '0': 
        c1 = !c1
        break;
      case '1':
        s1 = !s1
        break;
      case '2': 
        p1 = !p1
      default:
        break;
    }
    this.setData({ s1, p1, c1, pageIndex: 1, hasMore: true, reload: true, curSortIdx: index })
    this.getGoodsList()
  },

  /**
   * 点击搜索
   */
  tapSearch() {
    this.setData({
      reload: true,
      keywords: this.data.inputValue,
      pageIndex: 1,
      hasMore: true
    })
    
    this.getGoodsList()
  },

  bindSearchInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  /**
   * 手机确定当作搜索
   */
  searchSubmi(e) {
    console.log(123)
  },

  /**
   * 获取商品列表
   */
  getGoodsList() {
    let { curSortIdx, pageIndex, pageSize, keywords, s1, p1, c1, reload, hasMore, goodsList} = this.data
    if(!hasMore) return
    let token = wx.getStorageSync('token')
    let c11, s11, p11
    if (curSortIdx == 0) { // 佣金
       c11 = 1
       p11 = s11 = 0
    }
    if(curSortIdx == 1) { // 销量
      s11 = 1
      p11 = c11 = 0
    }
    if(curSortIdx == 2) { // 价格
      p11 = 1
      s11 = c11 = 0
    }
    api.get({
      url: '/wxsmall/Live/getLiveGoodsList',
      data: {
        token,
        page: pageIndex,
        pagesize: pageSize,
        keywords,
        sales: s11 == 1 ? s1 ? 'asc' : 'desc' : '',
        price: p11 == 1 ? p1 ? 'asc' : 'desc' : '',
        commission: c11 == 1 ? c1 ? 'asc' : 'desc' : '',
      },
      success: res => {
        console.log(res)
        res = res.data
        let lgh = res.length
        let moreFlag = true // 是否更多
        if(pageIndex == 1 && !lgh) {
          // 暂无数据
          this.setData({
            goodsList: [],
            dataStatus: '暂无数据~',
            showDefault: true,
          })
          return;
        }
        this.setData({ pageIndex: pageIndex + 1 })

        if(lgh < pageSize) {
          // 无更多数据
          moreFlag = false
        }

        if(lgh) {
          res.map((item) => {
            item.checked = false
          })
        }

        console.log(res)
        
        this.setData({
          hasMore: moreFlag,
          goodsList: reload ? res : [...goodsList].concat(res),
          reload: false,
          showDefault: false
        })
      }
    })
  },


  /**
   * 点击选择产品
   */
  tapOpts(e) {
    let { index } = e.currentTarget.dataset
    this.setData({ showModal: true, opsIdx: index }) // opsIdx 标识已经选择的项
  },

  // 单选操作
  tapItem(e) {
    let data = this.data
    let index = e.currentTarget.dataset.index
    let arr = data.goodsList
    let len = arr.length
    let temp_arr = []
    // 改变当前项的状态
    arr[index].checked = !arr[index].checked
    arr.map((item)=> {
      if(item.checked) {
        temp_arr.push(item)
      }
    })
     // 修改全选的状态
    let final
    if(temp_arr.length === len) {
      final = true
    }else {
      final = false
    }

    this.setData({
      goodsList: arr,
      allSelected: final,
      selectedLength: temp_arr.length
    })
  },

  // 全选操作
  tapAllSelect() {
    let data = this.data
    let status = data.allSelected
    let selectedLength // 已经选中的个数
    this.setData({
      allSelected: !status
    })
    let arr = [...data.goodsList]
    arr.map((item, index) => {
      if(status){
        item.checked = false
      } else {
        item.checked = true
      }
    })
    if(!status) {
      selectedLength = arr.length
    }else {
      selectedLength = 0
    }
      
    this.setData({ goodsList: arr, selectedLength })
  },


  hideModal() {
    this.setData( {showModal: false} )
  },


  // 选中某个分类
  itemSelect(e) {
    let id = e.currentTarget.dataset.id
    let list = this.data.cateList
    let temp = null
    for (let i in list) {
      list[i].checked = false
      if (list[i].id == id) {
        list[i].checked = true
        temp = list[i].id
      }
    }

    this.setData({
      cateList: list,
      selectedId: temp
    })
  },

  getCate() {
    api.get({
      url: '/wxsmall/Live/getLiveCategoryList',
      success: res => {
        console.log(res)
        res = res.data
        for (let i in res) {
          res[i].checked = false
        }
        this.setData({
          cateList: res
        })
      }
    })
  },

  // 开始直播
  startTap() {
    let data = this.data
    let flag = false
    let hints = ''
    let that = this
    if (!data.live_name) {
      hints = '直播间标题不能为空'
    } else if(!data.main_goods_id) {
      hints = '选择主推产品'
    }else if(!data.goods_ids) {
      hints = '选择附带产品'
    }else if (Boolean(data.selectedId) === false) {
      hints = '请选择直播类型'
    } else if (!data.cover) {
      hints = '直播间封面不能为空'
    } else {
      flag = true
    }
    if (!flag) {
      wx.showToast({
        title: hints,
        duration: 1500,
        mask: true,
        icon: 'none'
      })
      return
    } else {

      // 如果验证功跳转页面并且在直播页去请求参数
      let obj = {
        name: data.live_name,
        cover: data.cover,
        cateId: data.selectedId,
        goods_ids: data.goods_ids,
        main_goods_id: data.main_goods_id
      }
      console.log(obj)
      wx.redirectTo({
        url: `/packageB/pages/anchor-main/anchor-main?object=${JSON.stringify(obj)}`,
      })
    }
  },

  uploadImg() {
    let that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        let tempFilePaths = res.tempFilePaths
        that.setData({
          cover: tempFilePaths[0]
        })
      }
    })
  },

  // 直播间名称
  bingName(e) {
    this.setData({
      live_name: e.detail.value
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