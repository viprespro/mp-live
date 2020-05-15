const api = require('../../../utils/api-tp.js');
const locationUrl = 'https://apis.map.qq.com/ws/geocoder/v1/'
const tencentMapKey = 'ZNDBZ-W3YR6-6KXSB-MLKXV-6HFXK-UMFOT'
const app = getApp()
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: 0,
    pid: '', // 上页传递过来的顶级分类id\
    cateList: [],
    currentPid: '', //当前选中的分类 获取工人列表
    workerList: [],
    index: 0,
    size: 10,
    hasMore: true,
    exp_num: 1, // 默认是以经验降低排序
    location: '', // 当前定位的城市或者地区
    city_index: 0,
    city_size: 40,
    cityList: [],
    city_hasMore: true,
    show_city_status: 0, //默认不显示城市框
    location:'',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(ops) {
    console.log(ops)
    that = this;
    api.isLogin(this);
    if (ops.pid) {
      this.setData({
        pid: ops.pid
      })
    }

    if (ops.type_name) {
      wx.setNavigationBarTitle({
        title: ops.type_name,
      })
    }

    this.setData({
      windowH: app.globalData.windowH
    })
    this.getCatesByPid();
    this.getLocalLocation();
    this.getCityList(); // 分页显示
  },

  /**
   * 点击mask的时候
   */
  tapMask: function() {
    let rep = this.data;
    this.setData({
      location: rep.current_city_selected_name, // 城市名称
      city_status: 0, //关闭mask
      index: 0,
      hasMore: true,
      workerList: [], //重新请求数据需要回到默认数据
    })

    this.getWorkList();
  },



  /**
   * 选择某个城市 比如北京
   */
  chooseCity: function(e) {
    let id = e.currentTarget.dataset.id,
      name = e.currentTarget.dataset.name
    this.setData({
      designerIndex: 0,
      designerHasMore: true,
      current_located_city_id: id, // 设置这个为了获取它的下级地区
      current_selected_city_id: id, // 当前选中的城市id
      just_record: id,
      current_city_selected_flag: 1, // 当前城市选中的标志
      current_city_selected_name: name //当前选中的城市的名字
    })

    this.getChildList();
  },

  /**
   * 获取所有城市
   */
  getAllCityList: function() {
    api.post({
      url: '/wxsmall/Region/getCity',
      success: (res) => {
        console.log(res)
        this.setData({
          allCityList: res.data
        });

        this.getInitData();
      }
    })
  },


  /**
   * 通过当前定位的城市名找到城市id
   */
  getInitData: function() {
    let rep = this.data;
    let location = rep.important_sequence;
    let current_city_id;
    let arr = rep.allCityList;
    for (let i in arr) {
      if (location == arr[i].short_name) {
        this.setData({
          current_selected_city_id: arr[i].id,
        })
      }
    }

    this.getWorkList(); //请求工人列表的第一个入口
  },


  /**
   * 当前位置定位
   */
  getLocalLocation: function() {
    let that = this;
    that.setData({
      location: '定位中...'
    });
    wx.getLocation({
      success: function(res) {
        app.func.httpRequest(locationUrl, {
          key: tencentMapKey,
          location: res.latitude + ',' + res.longitude
        }, 'GET', {
          'content-type': 'application/json'
        }, function(result) {
          if (result) {
            let city = result.result.ad_info.city
            let city_name = result.result.ad_info.city.substring(0, city.length - 1);

            that.getAllCityList();

            // 遍历城市
            that.setData({
              location: city_name,
              important_sequence: city_name //将这个字段保存起来之后会用到
            });

          } else {
            that.setData({
              location: '定位失败'
            });
          }
        });
      },
      fail: function(res) {
        that.setData({
          location: '定位失败'
        });
      }
    })
  },

  /**
   * 工作经验/地区进行查询
   */
  sort(e) {
    let index = e.currentTarget.dataset.index;
    let rep = this.data;
    if (index == 0) { //工作经验
      let _num = rep.exp_num;
      let final_num = ++_num % 2;
      this.setData({
        exp_num: final_num,
        index: 0,
        hasMore: true,
        workerList: []
      })
      this.getWorkList();
    }

    if (index == 1) { //地区
      this.setData({
        city_status: 1
      })
    }
  },

  /**
   * 获取城市列表
   */
  getCityList: function() {
    let rep = this.data
    api.post({
      url: '/wxsmall/Region/getCity',
      data: {
        token: rep.token,
        page: ++rep.city_index,
        row: rep.city_size
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        if (ret.length < rep.city_size) {
          this.setData({
            city_hasMore: false
          })
        }
        that.setData({
          cityList: res.data
        });
      }
    })
  },

  /**
   * 选择某个地区的时候 也就是最下级的时候 直接关闭
   */
  chooseCurrentArea: function(e) {
    console.log(e)
    let temp = e.currentTarget.dataset,
      name = temp.name,
      id = temp.id,
      rep = this.data;
    this.setData({
      city_status: 0, //直接关闭了
      location: name,
      current_located_city_id: id,
      index: 0,
      hasMore: true,
      workerList: []
    })

    // 记录此时这些数据将其保存到list集合中去 因为下次再次点开的话 应该还是这些地区才合理
    this.setData({
      temporary_arr: rep.childCityList
    })

    this.getWorkList();

  },

  /**
   * 获取城市子列表
   */
  getChildList: function(e) {
    let rep = this.data
    api.post({
      url: '/wxsmall/User/getAddressList',
      data: {
        token: rep.token,
        region_id: rep.current_located_city_id
      },
      success: (res) => {
        console.log(res)
        that.setData({
          childCityList: res.data
        });
      }
    })
  },

  /**
   * 是否显示城市
   */
  showCity: function() {
    let temp = this.data.show_city_status
    if (temp == 0) {
      this.setData({
        show_city_status: 1
      })
    } else {
      this.setData({
        show_city_status: 0
      })
    }
  },

  /**
   * 换一批城市
   */
  changeCity: function() {
    let rep = this.data
    if (!rep.city_hasMore) {
      this.setData({
        city_index: 0,
        cityList: [],
        city_hasMore: true
      })
    }
    this.getCityList();
  },

  getWorkList: function() {
    let rep = this.data
    if (!rep.hasMore) return;
    // 可能是城市id 也可能是地区id 如果地区id真 城市id就设置为空
    if (rep.current_located_city_id == rep.current_selected_city_id || rep.current_selected_city_id && rep.current_located_city_id == undefined || rep.current_selected_city_id && rep.current_located_city_id == '') { // 说明此时是通过城市id来获取 第二种情况就是初始时候的数据
      this.setData({
        current_located_city_id: ''
      })
    } else {
      this.setData({
        current_selected_city_id: ''
      })
    }
    api.post({
      url: '/wxsmall/Worker/getWorkerList',
      data: {
        token: rep.token,
        pid: rep.currentPid,
        page: ++rep.index,
        row: rep.size,
        order_type: rep.exp_num, // 1代表工作年限降序 0代表升序
        dist: rep.current_located_city_id, //选择的是地区 dist_id
        city: rep.current_selected_city_id, // 选择的时候城市 city_id
      },
      success: (res) => {
        // console.log(res)
        let ret = res.data
        if (ret.length < rep.size) {
          this.setData({
            hasMore: false
          })
        }
        let newList = rep.workerList.concat(ret);
        this.setData({
          workerList: res.data || []
        })
      }
    })
  },

  /**
   * 关注工人
   */
  follow: function(e) {
    let id = e.currentTarget.dataset.id,
      rep = this.data,
      arr = rep.workerList;

    // 如果已经关注 就不能再次点击了
    for (let i in arr) {
      if (id == arr[i].worker_id) {
        if (arr[i].is_follow) {
          return;
        }
      }
    }

    api.post({
      url: '/wxsmall/User/userFollowWorker',
      data: {
        token: rep.token,
        worker_id: id
      },
      success: (res) => {
        console.log(res)
        for (let i in arr) {
          if (id == arr[i].worker_id) {
            arr[i].is_follow = true;
          }
        }

        this.setData({
          workerList: arr
        })

        wx.showToast({
          title: '已关注',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  getCatesByPid: function() {
    let rep = this.data
    api.post({
      url: '/wxsmall/WorkerType/getType',
      data: {
        token: rep.token,
        pid: rep.pid
      },
      success: (res) => {
        // console.log(res)
        let ret = res.data
        this.setData({
          cateList: ret || []
        })

        if (ret.length > 0) {
          let default_pid = ret[0].pid
          this.setData({
            currentPid: default_pid
          })
        }
      }
    })
  },

  alertSort: function(e) {
    let index = e.currentTarget.dataset.index,
      pid = e.currentTarget.dataset.pid

    if (index == this.data.status) {
      return;
    }

    this.setData({
      status: index,
      currentPid: pid,
      index: 0,
      hasMore: true
    })

    this.getWorkList();
  },

  goDetail: function() {
    wx.navigateTo({
      url: '/packageA/pages/design-community-detail/design-community-detail',
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