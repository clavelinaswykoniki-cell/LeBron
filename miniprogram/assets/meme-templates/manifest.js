/**
 * 梗图模板清单（手动维护）
 *
 * 加新梗图：
 *   1. 把图扔到 miniprogram/assets/meme-templates/
 *   2. 在下面 module.exports 数组里 append 一条记录
 *
 * 字段说明：
 *   id           - 唯一 ID（建议跟文件名同步）
 *   name         - 显示在选择列表的中文名
 *   file         - 文件名（相对本目录）
 *   textPosition - 反驳文字盖在图哪个位置: "top" | "center" | "bottom"
 *   textColor    - 文字颜色: "white" | "gold" | "black"
 *
 * 示例（用户加图后取消注释）：
 *   {
 *     id: "doge-lakers",
 *     name: "湖人 Doge",
 *     file: "doge-lakers.png",
 *     textPosition: "bottom",
 *     textColor: "white"
 *   }
 *
 * 详细文档见 ./README.md
 */
module.exports = [
  // 用户在此追加模板。当前为空时，梗图工厂会退化为「纯紫金渐变」唯一选项。
]
