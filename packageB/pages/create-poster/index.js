const util = require('../../../utils/util.js')
import { $api } from '../../../common/utils.js'
import Poster from '../../../miniprogram_dist/poster/poster';
const api = require('../../../utils/api-tp.js')
const Config = require('../../../config.js')
const app = getApp()
const posterConfig = {
  jdConfig: {
    width: 750,
    height: 1334,
    backgroundColor: '#fff',
    debug: false,
    pixelRatio: 1,
    blocks: [
      {
        width: 690,
        height: 708,
        x: 30,
        y: 183,
        borderWidth: 2,
        borderColor: '#f0c2a0',
        borderRadius: 20,
      },
      {
        width: 634,
        height: 74,
        x: 59,
        y: 770,
        backgroundColor: '#fff',
        opacity: 0.5,
        zIndex: 100,
      },
    ],
    texts: [
      {
        x: 113,
        y: 61,
        baseLine: 'middle',
        text: 'Ares',
        fontSize: 28,
        color: '#8d8d8d',
      },
      {
        x: 30,
        y: 113,
        baseLine: 'top',
        text: '直播的时间',
        fontSize: 36,
        color: '#333',
      },
      {
        x: 92,
        y: 810,
        fontSize: 38,
        baseLine: 'middle',
        text: '直播间的标题',
        width: 570,
        lineNum: 1,
        color: '#000',
        zIndex: 200,
      },
      // {
      //     x: 59,
      //     y: 895,
      //     baseLine: 'middle',
      //     text: [
      //         {
      //             text: '2人拼',
      //             fontSize: 28,
      //             color: '#ec1731',
      //         },
      //         {
      //             text: '¥99',
      //             fontSize: 36,
      //             color: '#ec1731',
      //             marginLeft: 30,
      //         }
      //     ]
      // },
      // {
      //     x: 522,
      //     y: 895,
      //     baseLine: 'middle',
      //     text: '已拼2件',
      //     fontSize: 28,
      //     color: '#929292',
      // },
      // {
      //     x: 59,
      //     y: 945,
      //     baseLine: 'middle',
      //     text: [
      //         {
      //             text: '商家发货&售后',
      //             fontSize: 28,
      //             color: '#929292',
      //         },
      //         {
      //             text: '七天退货',
      //             fontSize: 28,
      //             color: '#929292',
      //             marginLeft: 50,
      //         },
      //         {
      //             text: '运费险',
      //             fontSize: 28,
      //             color: '#929292',
      //             marginLeft: 50,
      //         },
      //     ]
      // },
      {
        x: 360,
        y: 1065,
        baseLine: 'top',
        text: '长按识别小程序码',
        fontSize: 38,
        color: '#080808',
      },
      {
        x: 360,
        y: 1123,
        baseLine: 'top',
        text: '超值好货一起拼',
        fontSize: 28,
        color: '#929292',
      },
    ],
    images: [
      {
        width: 62,
        height: 62,
        x: 30,
        y: 30,
        borderRadius: 62,
        url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587710287566&di=a06cf84c8d5b53dc4aef41149d8ff8b1&imgtype=0&src=http%3A%2F%2Fa3.att.hudong.com%2F14%2F75%2F01300000164186121366756803686.jpg',
      },
      {
        width: 634,
        height: 634,
        x: 59,
        y: 210,
        url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587710287566&di=a06cf84c8d5b53dc4aef41149d8ff8b1&imgtype=0&src=http%3A%2F%2Fa3.att.hudong.com%2F14%2F75%2F01300000164186121366756803686.jpg',
      },
      {
        width: 220,
        height: 220,
        x: 92,
        y: 1020,
        url: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1587710287566&di=a06cf84c8d5b53dc4aef41149d8ff8b1&imgtype=0&src=http%3A%2F%2Fa3.att.hudong.com%2F14%2F75%2F01300000164186121366756803686.jpg',
      },
    ]

  },
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posterConfig: posterConfig.jdConfig,
    title: '', // 直播间标题
    cover: '', // 直播间封面
    time: '', // 直播时间
    avatar:'',
    nickname: '',
    number: '', // 直播的房间好
    path: '', // 封面的网络地址
    qrCode: '',// 小程序二维码
    startDate: '',
    startTime: '',
    endDate: '', 
    endTime: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opts) {
    console.log(opts)
    if(opts.number) {
      this.setData({ number: opts.number })
    }

    // 若是自定义的时间
    // let date = new Date()
    // this.setData({ time: util.formatTimeCus(date) })

    this.getUserInfo()
  },

  bindTimeChange: function (e) {
    let { index } = e.currentTarget.dataset
    let { value } = e.detail; 
    if(index == 1) {
      this.setData({
        startTime: value
      })
    }
    if (index == 3) {
      this.setData({
        endTime: value
      })
    }
  },

  bindDateChange: function (e) {
    let { index } = e.currentTarget.dataset
    let { value } = e.detail; 
    if(index == 0) {
      this.setData({
        startDate: value
      })
    }
    if (index == 2) {
      this.setData({
        endDate: value
      })
    }
  },

  // 获取小程序二维码与封面图片的网络地址
  getQrCode() {
    wx.showLoading({
      title: '上传中...',
      mask: false
    })
    let { cover, number } = this.data
    wx.uploadFile({
      url: Config.HTTP_REQUEST_URL + '/wxsmall/live/getWxCode',
      filePath: cover,
      name: 'image',
      header: {
        "Content-Type": "multipart/form-data",
        "Charset": "utf-8"
      },
      formData: {
        token: wx.getStorageSync('token'),
        number,
      },
      success: res => {
        res = JSON.parse(res.data).data
        console.log(res)
        this.setData({
          path: res.path,
          qrCode: res.wxcode
        })
        wx.hideLoading()
      }
    })
  },

  getUserInfo() {
    let token = wx.getStorageSync('token')
    api.get({
      url: '/wxsmall/User/getUserInfo',
      data: {
        token
      },
      success: res => {
        // console.log(res)
        let { avatar, nickname } = res.data
        this.setData({ avatar, nickname})
      }
    })
  },

  // 绑定直播时间
  bindTime(e) {
    this.setData({ time: e.detail.value })
  },

  // 绑定直播间的标题
  bindTitle(e) {
    this.setData({ title: e.detail.value })
  },

  // 上传图片
  uploadImg() {
    let _this = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        let tempFilePaths = res.tempFilePaths
        _this.setData({
          cover: tempFilePaths[0]
        })

        _this.getQrCode()
      }
    })
  },

  // 生成海报
  onCreateOtherPoster() {
    let { title, cover, avatar, nickname, path, qrCode, startDate, startTime, endDate, endTime} = this.data
    if(!title) {
      return $api.msg('直播标题不能为空')
    }else if(!cover) {
      return $api.msg('直播封面不能为空')
    } else if (!startDate || !startTime || !endDate || !endTime) {
      return $api.msg('直播时间请填写完整')
    }
    // console.log(posterConfig.jdConfig)
    let config = posterConfig.jdConfig
    let texts = config.texts
    let imgs = config.images
    imgs[0].url = avatar  //  设置头像
    imgs[1].url = path  //  设置头像
    imgs[2].url = qrCode
    texts[0].text = nickname // 设置昵称
    texts[1].text = '直播时间：' + this.foo(startDate) + ' ' + startTime + '至' +  this.foo(endDate) + ' ' + endTime  // 设置直播时间
    texts[2].text = title // 设置直播标题

    this.setData({ posterConfig: config }, () => {
      Poster.create();    // 入参：true为抹掉重新生成 
    });
  },

  // 2020-04-28 转为4-28
  foo(argus) {
    let index = argus.indexOf('-')
    let ret1 = argus.slice(index + 1)
    let index2 = ret1.indexOf('-')
    let ret2 = ret1.slice(0, index2)
    let ret3 = ret1.slice(index2)
    if (ret2 < 10) {
      ret2 = ret2.slice(1)
    }
    if (ret3 < 10) {
      ret3 = ret3.slice(1)
    }
    ret3 = ret3.slice(1)
    return ret2 + '月' + ret3
  },

  onPosterSuccess(e) {
    const { detail } = e;
    wx.previewImage({
      current: detail,
      urls: [detail]
    })
  },
  onPosterFail(err) {
    console.error(err);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})