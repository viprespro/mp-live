const api = require('../../../utils/api-tp.js')
var app = getApp()
var context = null;
var isButtonDown = false; //是否在绘制中
var arrx = []; //动作横坐标
var arry = []; //动作纵坐标
var arrz = []; //总状态，识别按下到抬起的一个组合
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectColor: 'black',
    slideValue: 50,
    sign: 0,
    canvasImage: '',
    canvasw: wx.getSystemInfoSync().windowWidth,
    canvash: wx.getSystemInfoSync().windowWidth / 1.5,
    original_canvas: true,
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    console.log(ops)
    api.isLogin(this);
    if (ops.id) {
      this.setData({
        pre_order_id: ops.id
      })
    }
    //画布初始化处理
    this.initCanvas();
    this.clearDraw();
    this.getContactInfo();
    this.getSysInfo();
  },

  getSysInfo: function() {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowW: res.windowWidth,
          windowH: res.windowHeight
        })
      },
    })
  },

  /**
   * 获取图片信息
   */
  bindLoad(e) {
    console.log(e)
    let contractW = e.detail.width;
    let contractH = e.detail.height;
    let ret = contractH * app.globalData.windowW / contractW
    console.log(ret)
    this.setData({
      contractH_after: ret // 合同经过等比列缩放之后的高度
    })
  },

  /**
   * 确认签名
   */
  confirmSign() {
    this.setSign(); //执行保存到本地
  },


  getDrawBgInfo() {
    wx.downloadFile({
      url: this.data.contract[0],
      success: (res) => {
        console.log(res)
        this.setData({
          canvasimgbg: res.tempFilePath
        })
      }
    })
  },

  canvasdraw: function(canvas) {
    let rep = this.data,
      windowW = rep.windowW,
      windowH = rep.windowH,
      canvasimgbg = rep.canvasimgbg, // ok
      canvasimg1 = rep.canvasImage; // 要画的图
    // 背景图
    canvas.drawImage(canvasimgbg, 0, 0, windowW, rep.contractH_after);
    canvas.drawImage(canvasimg1, 20, rep.contractH_after - 80, 100, 40);
    canvas.draw(true, setTimeout(() => {
      this.save()
    }, 1500));
  },

  save: function() {
    let rep = this.data,
      windowW = rep.windowW,
      windowH = rep.windowH
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: windowW,
      height: rep.contractH_after,
      destWidth: windowW,
      destHeight: rep.contractH_after,
      canvasId: 'canvas',
      success: (res) => {
        console.log(res)
        // wx.saveImageToPhotosAlbum({
        //   filePath: res.tempFilePath,
        //   success(res) {}
        // })
        wx.previewImage({
          urls: [res.tempFilePath],
        })

        this.setData({
          afterContract: res.tempFilePath
        })
      }
    })
  },


  /**
   * 上传生成的图片
   */
  uploadGenerated() {
    let rep = this.data;
    let that = this;
    if (rep.afterContract) {
      wx.showLoading({
        title: '上传中',
        mask: true
      })
      // 请求接口上传签了名字的合同
      wx.uploadFile({
        url: app.globalData.api_url + '/wxsmall/User/userSignContract', //接口
        filePath: rep.afterContract,
        name: 'file',
        header: {
          "Content-Type": "multipart/form-data",
        },
        formData: {
          token: that.data.token,
          pre_order_id: that.data.pre_order_id
        },
        success: function(res) {
          console.log(res)
          if (JSON.parse(res.data).code == 0) {
            wx.hideLoading();
            wx.showToast({
              title: '上传成功',
              icon: 'success',
              duration: 2000
            })

            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
            }, 2000)

          } else {
            wx.hideLoading();
            wx.showToast({
              title: '上传失败',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: function(error) {
          console.log(error);
        }
      })
    }
  },

  /**
   * 预览生成后的合同
   */
  previewAfter() {
    wx.previewImage({
      urls: [this.data.afterContract],
    })
  },

  getContactInfo() {
    let that = this;
    let rep = this.data;
    api.post({
      url: '/wxsmall/Order/getPreOrderInfo',
      data: {
        id: rep.pre_order_id,
        token: rep.token
      },
      success: function(res) {
        console.log(res)
        that.setData({
          contract: [res.data.pre_info.contract] // 合同图
        })
        that.getDrawBgInfo(); // 画图的背景图
      }
    })
  },

  // 预览图片
  previewImage: function(e) {
    let current = e.target.dataset.src;
    //预览图片
    wx.previewImage({
      current: current,
      urls: this.data.contract,
    });

    this.setData({
      contract_canvas: true
    })
  },

  initCanvas: function() {
    context = wx.createCanvasContext('mycanvas', this);
    context.beginPath();
    context.setStrokeStyle("#000000");
    context.setLineWidth(8);
    context.setLineCap("round");
    context.setLineJoin("round");
  },

  canvasStart: function(e) {
    isButtonDown = true; //在绘制
    arrz.push(0);
    arrx.push(e.changedTouches[0].x);
    arry.push(e.changedTouches[0].y);
  },

  canvasMove: function(e) {
    if (isButtonDown) {
      arrz.push(1);
      arrx.push(e.changedTouches[0].x);
      arry.push(e.changedTouches[0].y);
    }

    //如果不清原有的，会出现很多线重叠
    context.clearRect(0, 0, this.data.canvasw, this.data.canvash)
    for (var i = 0; i < arrx.length; i++) {
      if (arrz[i] == 0) {
        context.moveTo(arrx[i], arry[i]);
      } else {
        context.lineTo(arrx[i], arry[i])
      }
    }

    context.stroke();
    context.draw();
  },

  clearDraw: function() {
    arrx = [];
    arry = [];
    arrz = [];
    context.clearRect(0, 0, this.data.canvasw, this.data.canvash);
    context.draw();
    this.setData({
      canvasImage: ""
    })
  },

  setSign: function() {
    let that = this;
    if (arrx.length == 0) {
      wx.showModal({
        title: '提示',
        content: '签名内容不能为空！',
      })
      return false;
    }

    that.setData({
      contract_canvas: true,
      original_canvas: false
    })

    //生成图片
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function(res) {
        that.setData({ // 设置图片临时路径
          canvasImage: res.tempFilePath // 画在合同上的图
        })

        let canvas = wx.createCanvasContext('canvas');
        that.canvasdraw(canvas);
      }
    }, this)
  },
})