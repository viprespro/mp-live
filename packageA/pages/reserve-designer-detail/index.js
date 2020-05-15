const api = require('../../../utils/api-tp.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    console.log(ops)
    api.isLogin(this);
    if (ops.id) {
      this.setData({
        reserve_id: ops.id
      })
    }
    this.getReserveInfo();
  },

  /**
   * 保存
   */
  save() {
    let rep = this.data;
    let _imgList = rep.imgList;
    if (_imgList.length == 0) {
      return;
    }
    api.post({
      url: '/wxsmall/Designer/designerUploadImgs',
      data: {
        token: rep.token,
        pre_order_id: rep.reserve_id,
        images: _imgList.join(',')
      },
      success: (res) => {
        wx.showToast({
          title: '上传成功,等待审核',
          icon: 'success',
          image: '',
          duration: 2000,
          mask: true,
        })

        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
      }
    })
  },


  /**
   * 上传图片
   */
  uploadImg: function(e) {
    let index = e.currentTarget.dataset.index,
      allowCount, // 允许一次上传的张数
      that = this,
      rep = that.data;
    if (index == 0) { // 身份证正反面
      allowCount = 2;
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
          let len = rep.imgList.length
          if (that.isAllowedCount(index, len, tempLen)) { // 允许上传的图片张数之后 先上传到服务器返回图片的全路径
            that.uploadToServer(tempFilePaths, 'images', function(ret) {
              console.log(ret)
              let arr1 = rep.imgList;
              arr1.unshift(ret);
              that.setData({
                imgList: arr1
              })
            });
          }
        }
      }
    })
  },

  /**
   * 判断上传图片是否符合
   */
  isAllowedCount: function(_index, _len, _tempLen) {
    let allowCount;
    if (_index == 0) {
      allowCount = 2
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
   * 上传到服务器
   */
  uploadToServer(paths, type, callback) {
    let rep = this.data;
    let id_type = 1;
    for (let i = 0; i < paths.length; i++) {
      wx.uploadFile({
        url: app.globalData.api_url + '/wxsmall/Designer/uploadImg',
        filePath: paths[i],
        name: type,
        header: {
          "Content-Type": "multipart/form-data",
        },
        formData: {
          token: rep.token,
          type: id_type
        },
        success: function(res) {
          console.log(res)
          let ret = JSON.parse(res.data);
          if (ret.code == 0) { // 上传成功
            callback(ret.data);
          }
        }
      })
    }
  },

  /**
   * 预览图片
   */
  previewImage: function(e) {
    let current = e.target.dataset.src,
      index = e.currentTarget.dataset.index,
      rep = this.data,
      _urls = [];
    if (index == 0) {
      _urls = rep.imgList
    }
    wx.previewImage({
      current: current,
      urls: _urls,
    });
  },

  /**
   * 删除图片
   */
  delImg: function(e) {
    let index = e.currentTarget.dataset.index,
      src = e.currentTarget.dataset.src,
      rep = this.data,
      _imgList = rep.imgList,
      _photoUrls = rep.photoUrls;
    if (index == 0) {
      for (let i in _imgList) {
        if (_imgList[i] == src) {
          _imgList.splice(i, 1)
        }
      }
      this.setData({
        imgList: _imgList
      })
    }
  },

  getReserveInfo() {
    let rep = this.data;
    api.post({
      url: '/wxsmall/Designer/designerPreOrderInfo',
      data: {
        token: rep.token,
        pre_order_id: rep.reserve_id
      },
      success: (res) => {
        console.log(res)
        this.setData({
          reserveInfo: res.data
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

  }
})