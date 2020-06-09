const api = require('../../../utils/api-tp.js')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    qrcode: '',
    timestart: '',
    timeend: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    api.isLogin(this);
    this.getQRCode();
  },
  //点击开始的时间  
  timestart: function(e) {
    this.setData({
      timestart: e.timeStamp
    });
  },
  //点击结束的时间
  timeend: function(e) {
    this.setData({
      timeend: e.timeStamp
    });
  },

  /**
   * 长按保存
   */
  saveImg(e) {
    var _this = this;
    var times = _this.data.timeend - _this.data.timestart;
    if (times > 300) {
      wx.getSetting({
        success: function(res) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: function(res) {
              var imgUrl = _this.data.qrcode;
              wx.downloadFile({ //下载文件资源到本地，客户端直接发起一个 HTTP GET 请求，返回文件的本地临时路径
                url: imgUrl,
                success: function(res) {
                  // 下载成功后再保存到本地
                  wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath, //返回的临时文件路径，下载后的文件会存储到一个临时文件
                    success: function(res) {
                      wx.showToast({
                        title: '成功保存到相册',
                        icon: 'success'
                      })
                    }
                  })
                }
              })
            },
            fail: (res) => { //拒绝授权
              console.log(res)
              wx.showModal({
                title: '提示',
                content: '您拒绝了地址授权，是否重新授权',
                success: function(res) {
                  if (res.confirm) {
                    wx.openSetting({})
                  }
                }
              })
            }
          })
        },
      })
    }
  },

  getQRCode() {
    api.get({
      url: '/wxsmall/User/getUserInviteQrcode',
      data: {
        token: wx.getStorageSync('token')
      },
      success: (res) => {
        console.log(res)
        if(res.code != 0) {
          app.msg(res.message)
        }else {
          this.setData({
            qrcode: res.data.qrcode
          })
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(ops) {
    return {
      title: app.globalData.indexTitle,
      imageUrl: app.globalData.share_img, //图片地址
      path: '/pages/load/load?invite_code=' + app.globalData.invite_code, // 用户点击首先进入的当前页面
      success: function(res) {
        console.log("转发成功:");
      },
      fail: function(res) {
        console.log("转发失败:");
      }
    }
  }
})