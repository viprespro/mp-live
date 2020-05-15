const api = require('../../../utils/api-tp.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    proveList: [],
    delay_flag: true,
    description: '' // 退款说明 默认为空
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    console.log(ops)
    api.isLogin(this);
    if (ops.order_id && ops.order_goods_id) {
      this.setData({
        order_id: ops.order_id,
        order_goods_id: ops.order_goods_id
      })

      this.getReturnDetailInfo()
    }
  },

  confirmReason(e) {
    let reason = this.getReasonCheckd()
    this.setData({
      return_reason: reason
    })
    this.hideModal()
  },

  confirmType() {
    let type = this.getTypeChecked()
    this.setData({
      return_type: type
    })
    this.hideModal()
  },

  /**
   * 提交申请
   */
  submitApply() {
    let temp = this.data
    if (temp.delay_flag) {
      this.setData({
        delay_flag: false
      })
      setTimeout(() => {
        this.setData({
          delay_flag: true
        })
      }, 5000)
      this.confirmReason()
      this.confirmType()
      api.post({
        url: '/wxsmall/Refund/userApplyOrderRefund',
        data: {
          token: temp.token,
          order_id: temp.order_id,
          order_goods_id: temp.order_goods_id,
          explain: temp.description,
          max_price: temp.info.max_price,
          reason: temp.return_reason,
          type: temp.return_type,
          pic_list: temp.proveList.join(',')
        },
        success: (res) => {
          console.log(res)
          wx.showToast({
            title: res.message,
            duration: 2000,
            icon: 'none'
          })

          setTimeout(() => {
            wx.redirectTo({
              url: '/packageA/pages/return-detail/index?refund_id=' + res.data.refund_id,
            })
          }, 2000)
        }
      })
    }
  },

  getReasonCheckd() {
    let name;
    let arr = this.data.reasonList
    for (let i in arr) {
      if (arr[i].check) {
        name = arr[i].name
      }
    }
    return name;
  },

  getTypeChecked() {
    let type_num;
    let arr = this.data.typeList
    for (let i in arr) {
      if (arr[i].check) {
        type_num = i;
      }
    }
    return type_num;
  },

  /**
   * 绑定退款说明的的数据
   */
  bindDescribe(e) {
    this.setData({
      description: e.detail.value
    })
  },

  /**
   * 选择当前
   */
  selectCur(e) {
    let rep = e.currentTarget.dataset
    let index = rep.index
    let flag = rep.flag
    let temp = this.data
    let reasonList_ = temp.reasonList
    let typeList_ = temp.typeList
    if (flag == 0) { // 退款原因
      for (let i in reasonList_) {
        reasonList_[i].check = false
        reasonList_[index].check = true
      }

      this.setData({
        reasonList: reasonList_
      })
    }

    if (flag == 1) { // 退款类型
      for (let i in typeList_) {
        typeList_[i].check = false
        typeList_[index].check = true
      }

      this.setData({
        typeList: typeList_
      })
    }
  },

  /**
   * 获取退款详情
   */
  getReturnDetailInfo() {
    let temp = this.data;
    api.post({
      url: '/wxsmall/Refund/getRefundDetails',
      data: {
        token: temp.token,
        order_id: temp.order_id,
        order_goods_id: temp.order_goods_id
      },
      errCallback: true,
      success: (res) => {
        // console.log(res)
        if (res.code == 1) {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
          return;
        }
        res = res.data
        this.setData({
          info: res,
          reasonList: res.reason,
          typeList: res.type
        })
      }
    })
  },

  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },

  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  /**
   * 删除图片
   */
  delImg: function(e) {
    let rep = this.data;
    let index = e.currentTarget.dataset.index;
    let proveList_ = rep.proveList;
    for (let i in proveList_) {
      if (i == index) {
        proveList_.splice(index, 1)
      }
    }
    this.setData({
      proveList: proveList_
    })
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
    if (index == 0) {
      allowCount = 3;
    }
    wx.chooseImage({
      count: allowCount, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths;
        let tempLen = tempFilePaths.length;
        if (index == 0) {
          let len = rep.proveList.length
          if (that.isAllowedCount(index, len, tempLen)) { // 允许上传的图片张数之后 先上传到服务器返回图片的全路径
            that.uploadToServer(tempFilePaths, 'images', function(ret) {
              console.log(ret)
              let arr1 = rep.proveList;
              arr1.unshift(ret);
              that.setData({
                proveList: arr1
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
        name: type,
        header: {
          "Content-Type": "multipart/form-data",
        },
        formData: {
          token: rep.token,
          type: 5
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
    let index = e.currentTarget.dataset.index;
    let rep = this.data;
    let _urls = [];
    if (index == 0) {
      _urls = rep.proveList
    }
    wx.previewImage({
      current: current,
      urls: _urls,
    });
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