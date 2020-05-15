var WxParse = require('../../../wxParse/wxParse.js');
const api = require('../../../utils/api-tp.js')
const app = getApp()
var wxh = require('../../../utils/wxh.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article_info: {},
    isHidePlaceholder: false,
    draft: '', //草稿
    cmtIndex: 0,
    cmtSize: 10,
    cmtList: [],
    hasMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    console.log(ops)
    api.isLogin(this);
    if (ops.id) {
      this.setData({
        article_id: ops.id
      })
    }
    this.getArticleInfo();
  },


  /**
   * controller 控制移动
   */
  setTouchMove: function(e) {
    wxh.home(this, e);
  },

  /**
   * 获取评论列表
   */
  tapGetCmtList: function(e) {
    let name = e.currentTarget.dataset.name
    this.setData({
      modalName: name,
      cmtIndex: 0, //让它重新发起请求
      hasMore: true,
      cmtList: []
    })
    this.getCmtList(); // 为什么打开过的模态框一次后不会再重新请求接口

  },

  /**
   * 关注该设计师
   */
  tapFollow: function() {
    let rep = this.data,
      temp = rep.article_info
    if (!temp.designer_follow) {
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
   * 用户点赞该文章
   */
  like: function() {
    let rep = this.data
    api.post({
      url: '/wxsmall/Designer/userComplimentsArticle',
      data: {
        token: rep.token,
        article_id: rep.article_id
      },
      success: (res) => {
        console.log(res)
        let temp = rep.article_info
        if (temp.is_compliments) { //已经是点赞状态 取消点赞
          temp.compliments -= 1;
          temp.is_compliments = false;
          this.setData({
            article_info: temp
          })
        } else {
          temp.compliments += 1;
          temp.is_compliments = true;
          this.setData({
            article_info: temp
          })
        }
      }
    })
  },

  /**
   * 收藏该篇文章
   */
  collect: function() {
    let rep = this.data
    api.post({
      url: '/wxsmall/Designer/userFollowArticle',
      data: {
        token: rep.token,
        article_id: rep.article_id
      },
      success: (res) => {
        console.log(res)
        if (rep.article_info.is_follow) { //用户已经收藏 此时取消收藏
          wx.showToast({
            title: '取消收藏',
            icon: 'none',
            duration: 2000
          })
          let temp = rep.article_info
          temp.is_follow = false;
          this.setData({
            article_info: temp
          })
        } else {
          wx.showToast({
            title: '收藏成功',
            icon: 'none',
            duration: 2000
          })
          let temp = rep.article_info
          temp.is_follow = true;
          this.setData({
            article_info: temp
          })
        }
      }
    })
  },

  bindscrolltolower: function() {
    this.getCmtList();
  },

  bindInput: function(e) {
    // console.log(e)
    this.setData({
      draft: e.detail.value
    })
  },

  /**
   * 展示评论的框
   */
  showModal: function(e) {
    let rep = this.data
    let name = e.currentTarget.dataset.name
    this.setData({
      modalName: name
    })
  },

  hideModal: function() {
    this.setData({
      modalName: null
    })
  },

  /**
   * 获取评论列表
   */
  getCmtList: function() {
    let rep = this.data
    if (!rep.hasMore) return;
    api.post({
      url: '/wxsmall/Designer/getArticleComments',
      data: {
        token: rep.token,
        article_id: rep.article_id,
        page: ++rep.cmtIndex,
        row: rep.cmtSize
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        if (ret.length < rep.cmtSize) {
          this.setData({
            hasMore: false
          })
        }

        let newList = rep.cmtList.concat(ret) //数据库库应该需要一个时间来排序
        this.setData({
          cmtList: newList
        })
      }
    })
  },

  /***
   * 发布评论
   */
  postComment: function() {
    let rep = this.data,
      temp = rep.article_info //文章信息
    if (!rep.draft) {
      this.setData({
        modalName: null
      })
      return;
    }
    api.post({
      url: '/wxsmall/Designer/userCommentArticle',
      data: {
        token: rep.token,
        comment: rep.draft,
        article_id: rep.article_info.id
      },
      success: (res) => { // 发表成功
        console.log(res)
        wx.showToast({
          title: '发表成功',
          icon: 'none',
          duration: 2000
        })
        temp.comment_num += 1;
        this.setData({
          article_info: temp,
          modalName: null,
          draft: ''
        })
      }
    })
  },

  /**
   * 获取文章详情
   */
  getArticleInfo: function() {
    let rep = this.data
    api.post({
      url: '/wxsmall/Designer/getArticleInfo',
      data: {
        token: rep.token,
        article_id: rep.article_id
      },
      success: (res) => {
        console.log(res)
        if (res.data.is_find == 0) { // 表示文章已丢失
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 1500,
            mask:true
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
          return;
        }
        this.setData({
          article_info: res.data,
          content: res.data.content
        })
        WxParse.wxParse('content', 'html', rep.content, this, 0);
      }
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
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let rep = this.data;
    return {
      title: rep.article_info.title,
      path: '/pages/load/load?article_id=' + rep.article_id,
      success: (res) => {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        })
      }
    }
  }
})