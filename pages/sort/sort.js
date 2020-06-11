const app = getApp()
const api = require('../../utils/api-tp.js')
Page({
  data: {
    scrollHeight: 0,
    list: [{
      id: 1,
      name: '沙发'
    }, {
      id: 2,
      name: '沙发'
    }, {
      id: 3,
      name: '沙发'
    }, ],
    currentCateId: "", // 默认选中第一个
    currentSecondCateId: "",
    catesList: [], // 分类列表
    secondCatesList: [], //二级分类列表
    first_come_in: true, // 第一次进入
    pageIndex: 1,
    pageSize: 10,
    hasMore: true,
    productsList: [],
  },

  onLoad: function(ops) {
    this.computeScrollViewHeight();
  },


  // 1级分类下的商品列表
  getGoodsList: function () {
    let rep = this.data;
    if (!rep.hasMore) return;
    api.post({
      url: '/wxsmall/Goods/getGoodsList',
      data: {
        page: this.data.pageIndex,
        row: this.data.pageSize,
        category_id: rep.currentCateId,
      },
      success: (res) => {
        res = res.data
        if (res.length < this.data.pageSize) {
          // 说明已经没有更多的数据了
          this.setData({
            hasMore: false
          })
        }
        this.setData({
          productsList: this.data.productsList.concat(res),
          pageIndex: this.data.pageIndex + 1,
        })
      }
    })
  },


  // 前往详情
  goDetail: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/product-detail/index?id=' + id,
    })
  },


  getCates: function() {
    let category_id = this.data.currentCateId;
    api.post({
      url: '/wxsmall/Category/getCategory',
      success: (res) => {
        console.log(res)
        let ret = res.data
        this.setData({
          catesList: ret || []
        })

        if(ret.length > 0) {
          this.setData({
            currentCateId: ret[0].category_id
          })
          // 获取默认的二级分类
          this.getSecondCates(ret[0].category_id);
        }
      }
    })
  },

  getSecondCates: function(id) {
    api.post({
      url: '/wxsmall/Category/getCategory',
      data: {
        category_id: id
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        if (res.status == 98) { //说明没有二级分类 & 三级分类
          this.setData({
            showSecondColumn: false // 隐藏二级与三级目录
          })
          // 获取该一级分类下的商品
          this.getGoodsList() 

          // let arr = []
          // for (let i in this.data.catesList) {
          //   if (id == this.data.catesList[i].category_id) {
          //     arr.push(this.data.catesList[i])
          //   }
          // }

          // this.setData({
          //   secondCatesList: arr
          // })

          // this.getThirdCates(id);

        } else {
          // 设置默认
          this.setData({
            currentSecondCateId: ret[0].category_id,
            showSecondColumn: true
          })

          this.setData({
            secondCatesList: ret
          })

          // 获取默认的二级分类
          this.getThirdCates(ret[0].category_id);
        }
      }
    })
  },

  getThirdCates: function(id) {
    api.post({
      url: '/wxsmall/Category/getCategory',
      data: {
        category_id: id
      },
      success: (res) => {
        let ret = res.data
        // 如果没有三级分类的情况 把二级的给它
        if (res.status == 98) {
          let rep = this.data.secondCatesList,
            arr = []
          // 遍历第二级分类 找到选中的二级
          for (let i in rep) {
            if (rep[i].category_id == id) {
              arr.push(rep[i])
            }
          }
          this.setData({
            thirdCatesList: arr
          })
        } else {
          // 获取默认的三级分类
          this.setData({
            thirdCatesList: ret
          })
        }
      }
    })
  },

  //计算 scroll-view 的高度
  computeScrollViewHeight() {
    let that = this
    let query = wx.createSelectorQuery().in(this)
    query.select('.nav-bar').boundingClientRect(function(res) {
      //得到标题的高度
      let titleHeight = res.height
      //获取屏幕可用高度
      let screenHeight = wx.getSystemInfoSync().windowHeight
      //计算 scroll-view 的高度
      let scrollHeight = screenHeight - titleHeight - 8
      that.setData({
        scrollHeight: scrollHeight
      })
    }).exec()
  },

  // 一级分类切换
  tabsAlert: function(e) {
    let id = e.currentTarget.dataset.index
    if (id == this.data.currentCateId) {
      return;
    }
    this.setData({
      currentCateId: id,
      secondCatesList: [],
      thirdCatesList: [],
      productsList: [],
      hasMore: true,
      pageIndex: 1,
      scrollLeft: id* 40
    })
    this.getSecondCates(id);
  },

  // 二级分类切换
  catesAlert: function(e) {
    let id = e.currentTarget.dataset.id
    if (id == this.data.currentSecondCateId) {
      return;
    }
    this.setData({
      currentSecondCateId: id,
      thirdCatesList: []
    })
    this.getThirdCates(id);
  },

  onShow() {
    let rep = this.data;
    this.getCates();
  },

  // 触底加载函数
  onReachBottom() {
    const { hasMore } = this.data
    if(hasMore) {
      this.getGoodsList()
    }else {
      app.msg('没有更多了~')
    }
  }

})