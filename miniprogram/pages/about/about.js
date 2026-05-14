// pages/about/about.js
// "弹药库" 关于页：展示段位 / 勋章墙 / 项目信息。

const progression = require('../../utils/progression.js');

Page({
  data: {
    rank: { id: 'bronze', name: '青铜詹蜜', threshold: 0 },
    nextRank: { id: 'silver', name: '白银詹蜜', threshold: 10 },
    viewCount: 0,
    copyCount: 0,
    badges: [],
    projectInfo: {
      cards: 150,
      aliases: 441,
      categories: 30,
      version: 'v2.0',
      author: 'happytang',
      license: 'MIT'
    }
  },

  onLoad: function () {
    try {
      const snapshot = progression.getCurrentRank();
      this.setData({
        rank: snapshot.rank,
        nextRank: snapshot.nextRank,
        viewCount: snapshot.viewCount,
        copyCount: snapshot.copyCount,
        badges: snapshot.badges
      });
    } catch (e) {
      // 兜底：getCurrentRank 失败仍保持默认 data，不影响页面渲染。
    }
  },

  /**
   * 返回上一页。
   */
  goBack: function () {
    try {
      wx.navigateBack({ delta: 1 });
    } catch (e) {
      // silent
    }
  }
});
