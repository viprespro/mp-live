const api = require('../../utils/api-tp.js')
var app = getApp();
Page({
  data: {
    _num: 0,
    region: ['省', '市', '区'],
    cartId: '',
    pinkId: '',
    couponId: '',
    id: 0,
    userAddress: [],
    provinceList: [], // 省会列表
    cityList: [], // 城市列表
    modalName: null,
    array: [{
        time: '周一到周天收货', // 默认
        selected: true,
        type: 1
      },
      {
        time: '周一到周五收货',
        selected: false,
        type: 2
      },
      {
        time: '仅周末收货',
        selected: false,
        type: 3
      }
    ],
    final_time: '周一到周天收货', // 选择的最终的收货时间 默认
  },
  onLoad: function(opts) {
    api.isLogin(this);

    console.log(opts)

    // 新增地址
    if (opts.title) { 
      this.setData({ title: opts.title })
    }

    // 编辑地址
    if (opts.id && opts.title) { 
      wx.setNavigationBarTitle({
        title: opts.title,
      })
      this.setData({
        id: opts.id
      })
      this.getAddressInfo();
    }
    this.getRegionList();
  },

  /**
   * 获取用户地址信息
   */
  getAddressInfo: function () {
    let rep = this.data
    if (rep.id) {
      api.post({
        url: '/wxsmall/User/getUserAddressInfo',
        data: {
          token: rep.token,
          address_id: rep.id
        },
        success: (res) => {
          console.log(res)
          this.setData({
            userAddress: res.data
          })
        }
      })
    }
  },

  

  /**
   * 确定收货时间
   */
  confirmTime: function() {
    this.setData({
      modalName: null
    })
    let time_arr = this.data.array
    for (let i in time_arr) {
      if (time_arr[i].selected == true) {
        this.setData({
          final_time: time_arr[i].time // 选择最终的收货时间
        })
      }
    }
  },

  /**
   * 选择收货时间
   */
  selectCurrent: function(e) {
    let flag = e.currentTarget.dataset.flag,
      index = e.currentTarget.dataset.index,
      rep = this.data,
      time_arr = rep.array; // 收货地址时间集合
    if (!flag) { // 若没选中
      for (let i in time_arr) {
        time_arr[i].selected = false;
        time_arr[index].selected = true;
        this.setData({
          array: time_arr
        })
      }
    }
  },

  getSub: function(e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
    let name = e.currentTarget.dataset.name
    this.setData({
      province: name
    })
    // 获取第二级别
    this.getSubAddr(id);
  },
  getFinal: function(e) {
    let id = e.currentTarget.dataset.id //最低等级的id
    let name = e.currentTarget.dataset.name
    this.setData({
      area: name,
      dist: id
    })
  },
  getThird: function(e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
    let name = e.currentTarget.dataset.name
    this.setData({
      city: name
    })
    // 获取第二级别
    this.getThirdAddr(id);
  },
  /**
   * 获取三级列表
   */
  getThirdAddr: function(id) {
    api.post({
      url: '/wxsmall/User/getAddressList',
      data: {
        region_id: id,
        token: this.data.token
      },
      success: (res) => {
        console.log(res)
        this.setData({
          areaList: res.data
        })
      }
    })
  },

  /**
   * 获取二级列表
   */
  getSubAddr: function(id) {
    api.post({
      url: '/wxsmall/User/getAddressList',
      data: {
        region_id: id,
        token: this.data.token
      },
      success: (res) => {
        console.log(res)
        this.setData({
          cityList: res.data
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
    let { province, city, area } = this.data
    let total = province + '—' + city + '—' +area
    this.setData({
      total,
      modalName: null
    })
  },
  getRegionList: function() {
    api.post({
      url: '/wxsmall/User/getAddressList',
      data: {
        region_id: '', //顶级
        token: this.data.token
      },
      success: (res) => {
        // console.log(res)
        this.setData({
          provinceList: res.data
        })
      }
    })
  },
  defaulttap: function(e) {
    var num = this.data._num;
    if (num == 1) {
      this.setData({
        _num: 0
      })
    } else {
      this.setData({
        _num: 1
      })
    }
  },
  formSubmit: function(e) {
    var warn = "";
    var that = this;
    var flag = true;
    var cartId = '';
    var name = e.detail.value.name;
    var phone = e.detail.value.phone;
    var area = JSON.stringify(this.data.region);
    var fulladdress = e.detail.value.fulladdress;
    var addressP = {};
    let rep = this.data;
    // 获取收货时间的type值
    let type;
    for (let i in rep.array) {
      if (rep.array[i].selected == true) {
        type = rep.array[i].type
      }
    }
    if (name == "") {
      warn = '请输入姓名';
    } else if (!/^1(3|4|5|7|8|9)\d{9}$/i.test(phone)) {
      warn = '您输入的手机号有误'
    } else if (!rep.dist) {
      warn = '所在省市填写有误';
    } else if (fulladdress == "") {
      warn = "请填写具体地址";
    } else {
      flag = false;
    }
    if (flag == true) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    } else {
      // 验证通过之后访问接口保存
      console.log(rep.dist)
      if (rep.id != 0) { //修改地址
        api.post({
          url: '/wxsmall/User/editAddress',
          data: {
            address_info: fulladdress,
            token: rep.token,
            region_id: that.data.dist,
            realname: name,
            mobile: phone,
            status: rep._num,
            address_id: rep.id,
            delivery_time: type
          },
          success: (res) => {
            console.log(res)
            wx.showToast({
              title: '修改成功',
              icon: ''
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
            }, 1500)
          }
        })
      } else {
        api.post({
          url: '/wxsmall/User/addUserAddress',
          data: {
            address_info: fulladdress,
            token: rep.token,
            region_id: that.data.dist,
            realname: name,
            mobile: phone,
            status: rep._num,
            delivery_time: type
          },
          success: (res) => {
            console.log(res)
            wx.showToast({
              title: '添加成功',
              icon: ''
            })
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
            }, 1500)
          }
        })
      }
    }
  }


})