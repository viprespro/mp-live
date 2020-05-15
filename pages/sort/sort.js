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
  },
  onLoad: function(ops) {
    this.computeScrollViewHeight();
  },
  goColumList: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/sort-column/index?categoryId=' + id,
    })
  },

  getCates: function() {
    let category_id = this.data.currentCateId;
    api.post({
      url: '/wxsmall/Category/getCategory',
      success: (res) => {
        console.log(res)
        let ret = res.data
        // 判断全局
        let obj = app.globalData.locte_cate;
        if (Object.keys(obj).length > 0) {
          app.globalData.locte_cate = {}; // 将其情况 切换tab的时候不在更细  只有点击导航那里才会跳转
          this.setData({
            currentCateId: obj.topId,
            currentSecondCateId: obj.category,
            if_reload: obj.topId, // 判断是否需要重载
          })



          this.getSecondCates(obj.topId);
        } else {
          // 设置默认
          this.setData({
            currentCateId: ret[0].category_id
          })
          // 获取默认的二级分类
          this.getSecondCates(ret[0].category_id);
        }
        this.setData({
          catesList: ret
        })
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
            currentSecondCateId: id // 二级id就是传递过来的一级id
          })

          let arr = []
          // 通过此id找到1级分类
          for (let i in this.data.catesList) {
            if (id == this.data.catesList[i].category_id) {
              arr.push(this.data.catesList[i])
            }
          }

          this.setData({
            secondCatesList: arr
          })

          this.getThirdCates(id);

        } else {
          // 设置默认
          this.setData({
            currentSecondCateId: ret[0].category_id
          })
          // 获取默认的二级分类
          this.getThirdCates(ret[0].category_id);

          this.setData({
            secondCatesList: ret
          })
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
      if_reload: id
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
    // 判断是否需要重新加载
    // app.globalData.locte_cate => 存在则代表是从首页导航栏导航过来
    if (rep.if_reload == rep.currentCateId && Object.keys(app.globalData.locte_cate).length == 0 ) {
      return;
    }
    this.getCates();
  },
})