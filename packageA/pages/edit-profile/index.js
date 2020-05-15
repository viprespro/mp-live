const api = require('../../../utils/api-tp.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoUrls: [],
    idCardList: [], // 身份证正反面
    avatarList: [], //虽然只是需要一张
    realname: '',
    flag: 0, //  0标识是设计师
    style_ids: [],
    style_names: [], //擅长风格的数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    console.log(ops)
    api.isLogin(this);
    if (ops.identityFlag) { // 判断是设计师跳转还是工人跳转
      this.setData({
        flag: ops.identityFlag
      })
    }

    if (ops.id) {
      this.setData({
        work_type: ops.id //工人类型id
      })
    }

    this.getCityList();
  },

  /**
   * 
   */
  confirmChoosing() {
    let rep = this.data
    let arr = rep.styleList
    let _style_ids = []
    let _style_names = []
    for (let i in arr) {
      if (arr[i].selected == true) {
        _style_ids.push(arr[i].style_id);
        _style_names.push(arr[i].style_name)
      }
    }
    if (_style_ids.length > 3) {
      wx.showToast({
        title: '最多选三种风格',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    this.setData({
      style_ids: _style_ids.join(','),
      style_names: _style_names.join(',')
    })
    this.hideModel();
  },

  /**
   * 选择当前的风格
   */
  chooseCurrentStyle(e) {
    let rep = this.data
    let id = e.currentTarget.dataset.id,
      _styleList = rep.styleList;

    // 最简单的方式 只是改变数组的选中状态 确定的时候 只需遍历数组 拿到选中状态的数据即可
    for (let i in _styleList) { // 修改选中与非选中状态
      if (id == _styleList[i].style_id) {
        if (_styleList[i].selected) {
          _styleList[i].selected = false;
        } else {
          _styleList[i].selected = true;
        }
      }
    }
    this.setData({
      styleList: _styleList
    })
  },

  /**
   * 设计师选择风格
   */
  chooseStyle(e) {
    let rep = this.data
    this.setData({
      modalName: e.currentTarget.dataset.name
    })
    api.post({
      url: '/wxsmall/Index/getBuildingStyle',
      data: {
        token: rep.token
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        for (let i in ret) {
          ret[i].selected = false; // 数组添加一个状态
        }
        this.setData({
          styleList: ret || []
        })
      }
    })
  },

  /**
   * 选择当前城市
   */
  chooseCurrent(e) {
    let temp = e.currentTarget.dataset,
      id = temp.id,
      name = temp.name;
    let rep = this.data
    // 请求三级 地区
    api.post({
      url: '/wxsmall/User/getAddressList',
      data: {
        token: rep.token,
        region_id: id
      },
      success: (res) => {
        console.log(res)
        this.setData({
          modalName: 'dist',
          distList: res.data || []
        })
      }
    })
  },

  chooseCurrentDist(e) {
    let temp = e.currentTarget.dataset,
      id = temp.id,
      name = temp.name;
    this.setData({
      dist: id,
      dist_name: name
    })

    this.hideModel();
  },

  /**
   * 获取城市列表
   */
  getCityList() {
    api.post({
      url: '/wxsmall/Region/getCity',
      success: (res) => {
        console.log(res)
        this.setData({
          cityList: res.data
        });
      }
    })
  },


  /**
   * 绑定值
   */
  bindInput(e) {
    let index = e.currentTarget.dataset.index,
      val = e.detail.value;

    if (index == 0) {
      this.setData({
        realname: val
      })
    }

    if (index == 1) {
      this.setData({
        mobile: val
      })
    }

    if (index == 2) {
      this.setData({
        id_num: val
      })
    }

    if (index == 3) {
      this.setData({
        city: val
      })
    }

    if (index == 4) {
      this.setData({
        addr_detail: val
      })
    }

    if (index == 5) {
      this.setData({
        style: val
      })
    }

    if (index == 6) {
      this.setData({
        years: val
      })
    }
  },

  /**
   * 提交
   */
  submit: function() {
    let rep = this.data,
      flag = rep.flag, // 标识设计师还是工人
      api_url;
    let accessFlag = true;
    let warn = '';

    // 表单验证
    if (rep.avatarList.length == 0) {
      warn = '请选择头像'
    } else if (!rep.realname) {
      warn = '姓名不能为空';
    } else if (!/^1(3|4|5|7|8|9)\d{9}$/i.test(rep.mobile)) {
      warn = '手机号输入有误';
    } else if (!/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(rep.id_num)) {
      warn = '身份证输入有误';
    } else if (!rep.dist) {
      warn = '所在城市不能为空';
    } else if (!rep.addr_detail) {
      warn = '详细地址不能为空';
    } else if (!rep.style_ids) {
      if (flag == 0) {
        warn = '风格不能为空'
      }
    } else if (!rep.years) {
      warn = '工作年限不能为空';
    } else if (rep.idCardList.length != 2) {
      warn = '身份证正反面应为2张';
    } else if (rep.photoUrls.length == 0) {
      warn = '毕业证书或资质为空';
    } else {
      accessFlag = false;
    }

    if (accessFlag) { // 说明有没通过的 因为通过之后必定走flag=false
      wx.showModal({
        title: '提示',
        content: warn,
      })
    } else { // 全部验证通过
      if (flag == 0) { //设计师
        api_url = '/wxsmall/Designer/toBeDesigner';
      } else {
        api_url = '/wxsmall/Worker/toBeWorker';
      }
      // 请求接口
      api.post({
        url: api_url,
        data: {
          token: rep.token,
          avatar: rep.avatarList[0],
          realname: rep.realname,
          mobile: rep.mobile,
          id_card: rep.id_num,
          dist: rep.dist,
          address: rep.addr_detail,
          style_ids: rep.style_ids ? rep.style_ids : '', // 如果是工人的话 这个字段没有
          work_type: rep.work_type ? rep.work_type : '',
          years: rep.years,
          id_card_image: rep.idCardList.join(','),
          diploma: rep.photoUrls.join(',')
        },
        success: (res) => {
          wx.showToast({
            title: '申请成功,等待审核',
            icon: 'none',
            duration: 2000
          })

          setTimeout(() => {
            wx.switchTab({
              url: '/pages/user/user', //跳转回到个人中心 有个审核的过程
            })
          }, 2000)
        }
      })
    }

  },

  /**
   * 城市选择
   */
  cityChoose(e) {
    let name = e.currentTarget.dataset.name
    this.setData({
      modalName: name
    })
  },

  /**
   * 隐藏模态框
   */
  hideModel() {
    this.setData({
      modalName: null
    })
  },

  /**
   * 删除图片
   */
  delImg: function(e) {
    let index = e.currentTarget.dataset.index,
      src = e.currentTarget.dataset.src,
      rep = this.data,
      _idCardList = rep.idCardList,
      _photoUrls = rep.photoUrls;
    if (index == 0) {
      for (let i in _idCardList) {
        if (_idCardList[i] == src) {
          _idCardList.splice(i, 1)
        }
      }
      this.setData({
        idCardList: _idCardList
      })
    }

    if (index == 1) {
      for (let i in _photoUrls) {
        if (_photoUrls[i] == src) {
          _photoUrls.splice(i, 1)
        }
      }
      this.setData({
        photoUrls: _photoUrls
      })
    }
  },

  /**
   * 判断上传图片是否符合
   */
  isAllowedCount: function(_index, _len, _tempLen) {
    let allowCount;
    if (_index == 0) {
      allowCount = 2
    }

    if (_index == 1) {
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
    if (index == 0) { // 身份证正反面
      allowCount = 2;
    } else if (index == 1) { // 毕业证书等...
      allowCount = 3;
    } else if (index == 2) { // 上传头像 只允许传一张
      allowCount = 1;
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
          let len = rep.idCardList.length
          if (that.isAllowedCount(index, len, tempLen)) { // 允许上传的图片张数之后 先上传到服务器返回图片的全路径
            that.uploadToServer(tempFilePaths, 'id_card_image', function(ret) {
              console.log(ret)
              let arr1 = rep.idCardList;
              arr1.unshift(ret);
              that.setData({
                idCardList: arr1
              })
            });
          }
        } else if (index == 1) {
          let len = rep.photoUrls.length
          if (that.isAllowedCount(index, len, tempLen)) { // 允许上传的图片张数之后 先上传到服务器返回图片的全路径
            that.uploadToServer(tempFilePaths, 'diploma', function(ret) {
              console.log(ret)
              let arr2 = rep.photoUrls;
              arr2.unshift(ret);
              that.setData({
                photoUrls: arr2
              })
            });

          }

        } else if (index == 2) { // 上传头像
          // 上传成功之后先访问接口 拿到服务器中路径
          that.uploadToServer(tempFilePaths, 'avatar', function(ret) {
            // console.log(ret)
            that.setData({
              avatarList: [ret]
            })
          });
        }
      }
    })
  },

  /**
   * 上传到服务器
   */
  uploadToServer(paths, type, callback) {
    let rep = this.data,
      that = this;
    let id_type;
    if (rep.flag == 0) { // 设计师
      id_type = 2; // 上传类型 设计师
    } else {
      id_type = 4; //上传类型 工人
    }
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
      _urls = rep.idCardList
    } else if (index == 1) {
      _urls = rep.photoUrls
    } else if (index == 2) {
      _urls = rep.avatarList
    }
    wx.previewImage({
      current: current,
      urls: _urls,
    });
  },

})