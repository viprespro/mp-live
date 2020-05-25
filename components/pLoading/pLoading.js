const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    loading: {
      type: Boolean,
      default: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    navHeight: app.globalData.CustomBar
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
