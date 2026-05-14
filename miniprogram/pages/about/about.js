// pages/about/about.js
// "弹药库" 关于页：展示段位 / 勋章墙 / 项目信息。

const progression = require('../../utils/progression.js');
const arsenal = require('../../data/arsenal');

// 从 arsenal 实时计算数据规模，避免硬编码 drift。
const PROJECT_INFO = (function () {
  try {
    return {
      cards: arsenal.cards.length,
      aliases: arsenal.aliases.length,
      categories: new Set(arsenal.cards.map(function (c) { return c.category; })).size,
      version: 'v2.0',
      author: 'happytang',
      license: 'MIT'
    };
  } catch (e) {
    return { cards: 0, aliases: 0, categories: 0, version: 'v2.0', author: 'happytang', license: 'MIT' };
  }
})();

Page({
  data: {
    rank: { id: 'bronze', name: '青铜詹蜜', threshold: 0 },
    nextRank: { id: 'silver', name: '白银詹蜜', threshold: 10 },
    viewCount: 0,
    copyCount: 0,
    badges: [],
    projectInfo: PROJECT_INFO
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
