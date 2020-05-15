const api = require('../../../utils/api-tp.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    starIndex1: 5,
    starIndex2: 5,
    cmtPicsList: [],
    delay_flag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    api.isLogin(this);
    console.log(ops)
    if (ops.goods_id) {
      this.setData({
        goods_id: ops.goods_id
      })
    }

    if (ops.order_id) {
      this.setData({
        order_id: ops.order_id
      })
    }

    if (ops.goods_spec_id) {
      this.setData({
        goods_spec_id: ops.goods_spec_id
      })
    }


    if (ops.goods_img) {
      this.setData({
        goods_img: ops.goods_img
      })
    }
  },

  /**
   * 绑定评论内容
   */
  bindInput(e) {
    this.setData({
      content: e.detail.value
    })
  },

  /**
   * 发表评论
   */
  postComment() {
    let rep = this.data;
    if (!rep.content) {
      return wx.showToast({
        title: '评论不能为空',
        icon: 'none'
      })
    }
    if (rep.delay_flag) {
      this.setData({
        delay_flag: false
      })
      setTimeout(() => {
        this.setData({
          delay_flag: true
        })
      }, 5000)
      api.post({
        url: "/wxsmall/Goods_Comment/userCommentGoods",
        data: {
          token: rep.token,
          order_id: rep.order_id,
          goods_id: rep.goods_id,
          goods_spec_id: rep.goods_spec_id,
          goods_score: rep.starIndex1,
          business_score: rep.starIndex2,
          images: rep.cmtPicsList.join(','),
          comment: rep.content
        },
        success: (res) => {
          console.log(res)
          wx.showToast({
            title: '评论成功',
            icon: 'none',
            duration: 1500
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        }
      })
    }

  },

  /**
   * 删除图片
   */
  delImg: function(e) {
    let index = e.currentTarget.dataset.index,
      src = e.currentTarget.dataset.src,
      rep = this.data,
      _cmtPicsList = rep.cmtPicsList;
    if (index == 0) {
      for (let i in _cmtPicsList) {
        if (_cmtPicsList[i] == src) {
          _cmtPicsList.splice(i, 1)
        }
      }
      this.setData({
        cmtPicsList: _cmtPicsList
      })
    }
  },


  /**
   * 判断上传图片是否符合
   */
  isAllowedCount: function(_index, _len, _tempLen) {
    let allowCount;
    if (_index == 0) {
      allowCount = 3
    }
    if (_len > allowCount || _len + _tempLen > allowCount) {
      wx.showToast({
        title: `最多上传${allowCount}张图片`,
        icon: 'none',
        duration: 2000
      })
      return false;
    } else {
      return true;
    }
  },

  /**
   * 上传图片
   */
  uploadImg: function(e) {
    let index = e.currentTarget.dataset.index,
      allowCount, // 允许一次上传的张数
      that = this,
      rep = that.data;
    if (index == 0) { // 评价的张数3
      allowCount = 3;
    }
    wx.chooseImage({
      count: allowCount, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths,
          tempLen = tempFilePaths.length;
        if (index == 0) {
          let len = rep.cmtPicsList.length
          if (that.isAllowedCount(index, len, tempLen)) { // 允许上传的图片张数之后 先上传到服务器返回图片的全路径
            that.uploadToServer(tempFilePaths, 'images', function(ret) {
              // console.log(ret)
              let arr1 = rep.cmtPicsList;
              arr1.unshift(ret);
              that.setData({
                cmtPicsList: arr1
              })
            });
          }
        }
      }
    })
  },


  /**
   * 上传到服务器
   */
  uploadToServer(paths, type, callback) {
    let rep = this.data;
    let that = this;
    for (let i = 0; i < paths.length; i++) {
      wx.uploadFile({
        url: app.globalData.api_url + '/wxsmall/Designer/uploadImg',
        filePath: paths[i],
        name: 'images',
        header: {
          "Content-Type": "multipart/form-data",
        },
        formData: {
          token: rep.token,
          type: 1
        },
        success: function(res) {
          // console.log(res)
          let ret = JSON.parse(res.data);
          if (ret.code == 0) { // 上传成功
            callback(ret.data);
          }
        }
      })
    }
  },

  // 预览图片
  previewImage: function(e) {
    var current = e.target.dataset.src;
    //预览图片
    wx.previewImage({
      current: current,
      urls: this.data.photoUrls,
    });
  },


  onChange1(e) {
    const index = e.detail.index;
    this.setData({
      'starIndex1': index
    })
  },

  onChange2(e) {
    const index = e.detail.index;
    this.setData({
      'starIndex2': index
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.hideShareMenu()
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