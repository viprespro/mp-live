const api = require('../../../utils/api-tp.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rolesList: [{
        id: 1,
        role: '设计师'
      },
      {
        id: 2,
        role: '工人'
      }
    ],
    status: 0, // 判断下拉框是否显示
    roled: null, // 显示的角色名称
    workerCateList: [], // 工人分类列表
    currentIdentity: '设计师',
    subCateList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    api.isLogin(this);
    // 默认选种第一个
    // this.initRole();
    this.initBelowCurrentRole();
  },

  /**
   * 设计师固定一种分类
   * 工人通过接口获取
   */
  initBelowCurrentRole() {
    let rep = this.data
    api.post({
      url: '/wxsmall/WorkerType/getType',
      data: {
        token: rep.token,
        pid: 0
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        for (let i in ret) {
          ret[i].selected = false;
        }

        this.setData({
          workerCateList: ret
        })
      }
    })
  },

  /**
   * 选择某个分类后跳转到填写资料
   */
  goFillProfile: function(e) {
    let temp = e.currentTarget.dataset;
    let index = temp.index
    let id = temp.id;
    if (id) { // id标识工人的类型id
      wx.navigateTo({
        url: '../edit-profile/index?identityFlag=' + index + '&id=' + id,
      })
    } else {
      wx.navigateTo({
        url: '../edit-profile/index?identityFlag=' + index,  //设计师
      })
    }
  },

  /**
   * 获取二级分裂
   */
  getSub(e) {
    let id = e.currentTarget.dataset.id
    let rep = this.data
    api.post({
      url: '/wxsmall/WorkerType/getType',
      data: {
        token: rep.token,
        pid: id
      },
      success: (res) => {
        console.log(res)
        this.setData({
          sub_active:true,
          subCateList: res.data || []
        })
      }
    })
  },

  /**
   * 选择当前身份
   */
  chooseCurrent: function(e) {
    let id = e.currentTarget.dataset.id,
      name = e.currentTarget.dataset.name,
      rep = this.data,
      currentIdentity = '';
    if (id == 1) {
      currentIdentity = '设计师';
      this.setData({
        sub_active:false
      })
    } else if (id == 2) {
      currentIdentity = '工人';
    }
    this.setData({
      currentIdentity: currentIdentity,
      roled: name
    })
  },

  /**
   * 点击选择
   */
  clickToChoose: function() {
    let _status = this.data.status
    if (_status == 1) {
      this.setData({
        status: 0
      })
    } else {
      this.setData({
        status: 1
      })
    }
  },
})