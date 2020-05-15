// pages/my-profile/index.js
const api = require('../../utils/api-tp.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    api.isLogin(this);
    this.getUserInfo();
  },

  /**
   * 点击保存
   */
  saveProfile() {
    let rep = this.data,
      that = this;
    if (rep.filePath) {
      wx.uploadFile({
        url: app.globalData.api_url + '/wxsmall/User/updateUserInfo',
        filePath: rep.filePath,
        name: 'file',
        header: {
          "Content-Type": "multipart/form-data",
        },
        formData: {
          token: rep.token,
          nickname: rep.nickNameInput ? rep.nickNameInput : ''
        },
        success: function(res) {
          console.log(res)
          if (JSON.parse(res.data).code == 0) {
            wx.showToast({
              title: '更新成功',
              icon: 'none',
              duration: 2000
            })
            that.getUserInfo();
          } else {
            wx.showToast({
              title: '更新失败',
              icon: 'none',
              duration: 2000
            })
          }

        },
        fail: function(res) {
          console.log(res)
        },
        complete: function(res) {
          console.log(res)
        },
      })
    } else {
      api.post({
        url: '/wxsmall/User/updateUserInfo',
        data: {
          token: rep.token,
          nickname: rep.nickNameInput ? rep.nickNameInput : ''
        },
        success: (res) => {
          console.log(res)
          if (res.code == 0) {
            wx.showToast({
              title: '更新成功',
              icon: 'none',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: '更新失败',
              icon: 'none',
              duration: 2000
            })
          }

          that.getUserInfo();
        }
      })
    }
  },

  /**
   * 输入的昵称
   */
  bindInput(e) {
    this.setData({
      nickNameInput: e.detail.value
    })
  },

  /**
   * 获取用户信息
   */
  getUserInfo() {
    let rep = this.data
    api.post({
      url: '/wxsmall/User/getUserInfo',
      data: {
        token: rep.token
      },
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.data
        })
      }
    })
  },

  /**
   * 编辑头像
   */
  editAvatar() {
    let that = this,
      _userInfo = that.data.userInfo;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        console.log(res)
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths
        _userInfo.avatar = tempFilePaths[0];
        that.setData({
          userInfo: _userInfo,
          filePath: tempFilePaths[0]
        })
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
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**
   * 用户点击右上角分享
   */
  goAddr: function() {
    wx.navigateTo({
      url: '/pages/address/address?sign=' + 1,
    })
  }
})