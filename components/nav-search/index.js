// components/clearInput/clearInput.js
const app = getApp()
Component({
  externalClasses: ['input-class', 'icon-class'],

  /**
   * 组件的属性列表
   */
  properties: {
    inputHint: {
      type: String,
      value: '搜索'
    },
    bg: {
      type:String,
      value: '#fff'
    },
    size: {
      type: Number,
      value: 32
    },
    color: {
      type: String,
      value: '#ccc'
    },
    fromIndex: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    navSearchPage() {
      let { fromIndex } = this.data
      let url
      if (fromIndex == 0) {
        url = '/pages/search-live/index'
      }
      if (fromIndex == 1) {
        url = '/packageA/pages/search/search'
      }
      wx.navigateTo({
        url,
      })
    }
  }
})