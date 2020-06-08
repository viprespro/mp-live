const app = getApp()
const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusH: app.globalData.StatusBar,
    navHeight: app.globalData.CustomBar,
    category_id: 0,
    keywords: '',
    cateList: [],
    goodsList: [],
    goods_ids:'' , // 所有已经选中的商品id集合
    showDefault: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init()
  },

  init() {
    this.loadData()
  },

  // 确认选择
  confirmChoose() {
    let { goodsList } = this.data
    let checked = this.hasChosen()
    let firstCateId 
    if(checked.length) {
      firstCateId = checked[0].cate_id
    }
    for(var item of checked) {
      if(item.cate_id != firstCateId) {
       return app.msg('请选择同类型的产品才可开播')
      }
    }
    // console.log(checked)
    let final = []
    for(let item of checked) {
      final.push(item.id)
    }
    this.setData({ goods_ids: final.join(',')})
    // 关闭当前页面并返回
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
    prevPage.setData({
      ids: this.data.goods_ids
    })
    wx.navigateBack({
      delta: 1
    })
  },

  /**
  * 用于判断goodsList中有多少被选中的
  */
  hasChosen() {
    let arr = [...this.data.goodsList]
    let newArr = []
    let itemChecked = {}
    arr.map((item) => {
      if (item.checked) {
        newArr.push({
          id: item.id,
          cate_id: item.category_id
        })
      }
    })
    return newArr;
  },

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

  searchSubmit(e) {
    let { value } = e.detail
    this.setData({ keywords: value})
    this.loadData()
  },

  tapCateItem(e) {
    let { id, name } = e.currentTarget.dataset
    let { category_id } = this.data
    if (id == category_id ) return;
    this.setData({ category_id: id, category_name: name,  })
    this.loadData()
  },

  // 获取页面数据
  loadData() {
    wx.showLoading({
      title: '加载中...',
    })
    let { keywords, category_id } = this.data
    let token = wx.getStorageSync('token')
    let data = {
      token,
      category_id,
      keywords
    }
    if(keywords == '') {
      Reflect.deleteProperty(data, 'keywords')
    }
    if(!category_id) {
      Reflect.deleteProperty(data, 'category_id')
    }
    api.get({
      url: '/wxsmall/Live/getLiveGoodsList',
      data,
      success: res => {
        console.log(res)
        res = res.data
        if(!res.goods_list.length){
          this.setData({ showDefault: true })
        }else {
          this.setData({ showDefault: false })
        }
        if(!category_id) {
          this.setData({
            cateList: res.category_list,
            goodsList: res.goods_list
          })
        }else {
          this.setData({
            goodsList: res.goods_list
          })
        }
      }
    })
  },

  // 返回上一级
  toBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})