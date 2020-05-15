 // packageA/pages/design-community/design-community.js
const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    articleIndex: 0,
    articleSize: 6,
    articleList: [],
    hasMore: true,
    tabIndex: '',
    cate_id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu();
    api.isLogin(this);
    this.checkUserFollow();
  },

  /**
   * 关注该设计师
   */
  tapFollow: function(e) {
    let rep = this.data,
      temp = rep.article_info;
    let is_follow = e.currentTarget.dataset.follow;
    if (!is_follow) {
      api.post({
        url: '/wxsmall/User/userFollowDesigner',
        data: {
          token: rep.token,
          designer_id: temp.designer_id
        },
        success: (res) => {
          temp.designer_follow = true //前端的显示
          this.setData({
            article_info: temp
          })
        }
      })
    }
  },


  /**
   * 获取文章列表
   */
  getArticleList() {
    let rep = this.data
    api.post({
      url: '/wxsmall/Designer/getDesignCircleList',
      data: {
        token: rep.token,
        page: ++rep.articleIndex,
        row: rep.articleSize,
        category_id: rep.cate_id
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        if (ret.length < rep.articleSize) {
          this.setData({
            hasMore: false
          })
        }

        let newList = rep.articleList.concat(ret)
        this.setData({
          articleList: newList
        })
      }
    })
  },

  /**
   * 检查用户是否有关注的
   */
  checkUserFollow: function() {
    let rep = this.data
    api.post({
      url: '/wxsmall/Designer/checkUserFollowArticle',
      data: {
        token: rep.token,
      },
      success: (res) => {
        // console.log(res)
        if (res.data.status) { //用户有关注
          this.setData({
            followFlag: true,
            tabIndex: 999, // 用户有关注默认显示关注的
            cate_id: 0,
          })
        } else {
          this.setData({
            tabIndex: 0
          })
        }
        this.getArticleSort(); //不管有没有关注
      }
    })
  },

  /**
   *  获取文章分类
   */
  getArticleSort: function() {
    let rep = this.data
    api.post({
      url: '/wxsmall/Designer/getDesignCircleCategory',
      data: {
        token: rep.token,
      },
      success: (res) => {
        // console.log(res)
        let ret = res.data
        if (!rep.followFlag) {
          let deault_cate_id = ret[0].id
          this.setData({
            cate_id: deault_cate_id
          })
        } else {
          this.setData({
            cate_id: 0
          })
        }
        this.setData({
          articleSortList: res.data
        })

        this.getArticleList(); // 获取文章列表
      }

    })
  },


  alertTabs: function(e) {
    let index = e.currentTarget.dataset.index
    let cate_id = e.currentTarget.dataset.id
    if (index == '999') { //点击关注的时候
      cate_id = 0;
    }
    if (index == this.data.tabIndex) {
      return;
    }
    this.setData({
      tabIndex: index,
      cate_id: cate_id,
      articleIndex: 0,
      hasMore: true,
      articleList: []
    })

    this.getArticleList();
  },

  goDetail: function(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/packageA/pages/design-community-detail/design-community-detail?id=' + id,
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.getArticleList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(e) {

  }
})