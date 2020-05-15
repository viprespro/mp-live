const app = getApp()
const locationUrl = 'https://apis.map.qq.com/ws/geocoder/v1/'
const tencentMapKey = 'ZNDBZ-W3YR6-6KXSB-MLKXV-6HFXK-UMFOT'
const api = require('../../../utils/api-tp.js');
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    size: 20,
    hasMore: true,
    cityList: [], // 所有的城市列表
    childCityList: [], // 所有的城市列表
    cityId: null, // 当前城市id
    location: '', // 当前定位/选取的城市
    locationId: null, // 当前定位/选取的城市的id
    style: null, // 当前选择风格
    gender: null, // 当前选择的设计师的性别
    sort: null, //排序方式
    show_city_status: 0,
    current_located_city_id: '', //当前定位城市的id
    city_status: 0, //是否显示城市与mask
    designerIndex: 0,
    designerSize: 10, // 设计师限制条数
    designerList: [], //设计师列表
    designerHasMore: true,
    temporary_arr: [], //临时存储的如果选择区的列表
    style_status: false,
    sex_status: false,
    default_status: false,
    default_name:'',
  },


  searchWithDefault(e) {
    let def = e.currentTarget.dataset.def;
    let temp;
    if (def == 0) {
      temp = '年限';
    }
    if (def == 1) {
      temp = '人气';
    }
    if(def == 2) {
      temp = '默认';
      def = '';
    }
    this.setData({
      default_name: temp,
      type: def,
      designerIndex: 0,
      designerHasMore: true,
      default_status: false
    })
    this.getDesignerList();
  },

  /**
   * 条件查询设计师 性别
   */
  searchWithSex(e) {
    let sex = e.currentTarget.dataset.gender // 1 男 2 女
    let gender_name;
    if (sex == 1) {
      gender_name = '男';
    } else if(sex == 2){
      gender_name = '女';
    }else {
      gender_name = '全部';
      sex = '';
    }
    this.setData({
      gender_name: gender_name,
      gender: sex,
      designerIndex: 0,
      designerHasMore: true,
      sex_status: false
    })
    this.getDesignerList();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    api.isLogin(this);
    that = this;
    that.getLocalLocation();
    that.getCityList(); //分页
    that.getAllCityList(); // 全部
    that.getStyleList(); //获取设计师风格
  },

  /**
   * 选择当前的风格
   */
  selectCurrentStyle(e) {
    let rep = e.currentTarget.dataset;
    let id = rep.id
    if(id == 0) {
      id = '';
    }
    let name = rep.name;
    this.setData({
      style_id: id,
      style_name: name,
      designerIndex: 0,
      hasMore: true,
      designerList: [],
      style_status: false
    })
    this.getDesignerList();
  },

  getStyleList() {
    let rep = this.data;
    api.post({
      url: '/wxsmall/Index/getBuildingStyle',
      data: {
        token: rep.token
      },
      success: (res) => {
        console.log(res)
        this.setData({
          styleList: res.data || []
        })
      }
    })
  },

  /**
   * 关注设计师
   */
  follow: function(e) {
    let id = e.currentTarget.dataset.id,
      rep = this.data,
      arr = rep.designerList;

    // 如果已经关注 就不能再次点击了
    for (let i in arr) {
      if (id == arr[i].designer_id) {
        if (arr[i].is_follow) {
          return;
        }
      }
    }

    api.post({
      url: '/wxsmall/User/userFollowDesigner',
      data: {
        token: rep.token,
        designer_id: id
      },
      success: (res) => {
        // console.log(res)
        for (let i in arr) {
          if (id == arr[i].designer_id) {
            arr[i].is_follow = true;
          }
        }

        this.setData({
          designerList: arr
        })

        wx.showToast({
          title: '已关注',
          icon: 'none',
          duration: 2000
        })
      }
    })
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
    if (!rep.hasMore) {
      this.setData({
        index: 0,
        hasMore: true
      })
    }
    this.getCityList();
  },

  /**
   * 当前位置定位
   */
  getLocalLocation: function() {
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
          console.log(result)
          if (result) {
            let city = result.result.ad_info.city
            let city_name = result.result.ad_info.city.substring(0, city.length - 1);

            // 遍历城市
            that.setData({
              location: city_name,
              important_sequence: city_name //将这个字段保存起来之后会用到
            });

            // 通过此时的定位按默认排序
            that.getInitData();

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
   * 获取页面的时候的初始数据
   */
  getInitData: function() {
    let rep = this.data;
    let location = rep.important_sequence;
    let current_city_id;
    let arr = rep.allCityList;
    for (let i in arr) {
      if (location == arr[i].short_name) {
        this.setData({
          current_selected_city_id: arr[i].id
        })
      }
    }

    this.getDesignerList();

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
        page: ++rep.index,
        row: rep.size
      },
      success: (res) => {
        console.log(res)
        let ret = res.data
        if (ret.length < rep.size) {
          this.setData({
            hasMore: false
          })
        }
        that.setData({
          cityList: res.data
        });
      }
    })
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
   * 选择城市列表
   */
  selectCity: function(e) {
    let index = e.currentTarget.dataset.index,
      rep = this.data,
      all = rep.allCityList,
      city_id;
    if (index == 0) { // 点击第一个的时候
      if (rep.city_status == 0) {
        if (rep.just_record) {
          this.setData({
            current_selected_city_id: rep.just_record
          })
        }
        this.setData({
          city_status: 1,
          style_status: false,
          sex_status: false,
          default_status: false
        })
      } else {
        if (rep.current_city_selected_flag == 1) { //如果只是选择了某个城市的时候
          this.setData({
            location: rep.current_city_selected_name,
            city_status: 0, //关闭mask
          })
          this.getDesignerList();
        }

        this.setData({
          city_status: 0,
        })
      }

      // 判断一下如果之前它是选择的最低的地区的那么就不用遍历
      if (rep.temporary_arr.length == 0) {
        for (let i in all) {
          if (rep.location == all[i].short_name) {
            this.setData({
              current_located_city_id: all[i].id //当前定位城市id
            })
          }
        }

        this.getChildList();
      }


    }

    if (index == 1) { // 选择风格
      if (rep.style_status) {
        this.setData({
          style_status: false,
        })
      } else {
        this.setData({
          style_status: true,
          city_status: 0,
          sex_status: false,
          default_status: false
        })
      }
    }

    if (index == 2) {
      if (rep.sex_status) { // 选择性别
        this.setData({
          sex_status: false
        })
      } else {
        this.setData({
          sex_status: true,
          city_status: 0,
          style_status: false,
          default_status: false
        })
      }
    }

    if (index == 3) { // 选择默认排序
      if (rep.default_status) {
        this.setData({
          default_status: false
        })
      } else {
        this.setData({
          default_status: true,
          city_status: false,
          style_status: false,
          sex_status: false
        })
      }
    }
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
      designerIndex: 0,
      designerHasMore: true
    })

    // 记录此时这些数据将其保存到list集合中去 因为下次再次点开的话 应该还是这些地区才合理
    this.setData({
      temporary_arr: rep.childCityList
    })


    this.getDesignerList(); // 请求设计师列表

  },

  /**
   * 获取设计师的列表
   */
  getDesignerList: function() {
    let rep = this.data
    if (!rep.designerHasMore) return;
    // 可能是城市id 也可能是地区id 如果地区id真 城市id就设置为空
    if (rep.current_located_city_id == rep.current_selected_city_id || rep.current_selected_city_id && rep.current_located_city_id == '') { // 说明此时是通过城市id来获取 第二种情况就是初始时候的数据
      this.setData({
        current_located_city_id: ''
      })
    } else {
      this.setData({
        current_selected_city_id: ''
      })
    }

    api.post({
      url: '/wxsmall/Designer/getDesignerList',
      data: {
        token: rep.token,
        page: ++rep.designerIndex,
        row: rep.designerSize,
        dist: rep.current_located_city_id, //其实是最低区id
        style_id: rep.style_id ? rep.style_id : '',
        city: rep.current_selected_city_id,
        gender: rep.gender ? rep.gender : '',
        type: rep.type ? rep.type : ''
      },
      success: (res) => {
        console.log(res)
        this.setData({
          designerList: res.data || []
        })
      }
    })
  },

  /**
   * 点击mask的时候
   */
  tapMask: function() {
    let rep = this.data
    if (rep.current_city_selected_flag == 1) {
      this.setData({
        location: rep.current_city_selected_name,
        city_status: 0, //关闭mask
      })

      this.getDesignerList();
    }

    this.setData({
      city_status: 0,
      style_status: false,
      sex_status: false,
      default_status: false
    })
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