# 梗图模板（meme-templates）

往这个目录扔 PNG / JPG，小程序的「梗图工厂」就能用上。

## 怎么加一张梗图

**Step 1**：把图扔进这个目录，**用英文小写文件名 + 短横线**：

```
miniprogram/assets/meme-templates/
├── doge-lakers.png
├── facepalm.jpg
├── king-of-the-court.png
└── ...
```

**Step 2**：编辑同目录的 `manifest.js`，加一条记录：

```js
module.exports = [
  {
    id: "doge-lakers",                 // 唯一 ID，跟文件名对齐就行
    name: "湖人 Doge",                  // 用户看到的名字，可中文
    file: "doge-lakers.png",            // 文件名，相对本目录
    textPosition: "bottom",             // 文字放哪：top / center / bottom
    textColor: "white"                  // 文字颜色：white / gold / black
  },
  // ... 你的下一张
]
```

**Step 3**：重启微信开发者工具（或 npm run check:syntax 验证），刷新「梗图工厂」页面，新模板就出现了。

## 图片要求

| 项 | 建议 | 硬限制 |
|---|---|---|
| 尺寸 | 750×1334（小程序竖屏标准） | 任何尺寸都行，会自动 cover 缩放 |
| 格式 | PNG（带透明）/ JPG（无透明） | gif 不支持 |
| 文件大小 | < 500KB | 单文件 < 2MB（小程序限制） |
| 总数 | 5-10 张起步 | 总包体 < 2MB 主包，超了要分包 |

## 版权提示

⚠️ 真实 NBA 球员照片、官方队徽 **有商标 / 肖像权风险**，正式上线前注意：
- **不要**用 NBA 官方授权的图（你看到的所有职业摄影照片）
- **不要**用球员清晰人脸照
- **可以**用：粉丝原创涂鸦、卡通形象、表情包（doge、暴漫脸、抓狂等）、湖人色色块设计、自己画的

**最安全**：自己 PS / 找 CC0 素材 / AI 生成。

## 关于文字布局

合成时反驳文字会盖在图上，位置由 `textPosition` 控制：
- `top` — 上方 20% 区域，黑底白字
- `center` — 中间正中，大字粗描边
- `bottom` — 下方 30% 区域，最常用（**默认推荐**）

文字颜色 `textColor`：
- `white` — 白色，最通用
- `gold` — 湖人金 #fbbf24，紫金背景上好看
- `black` — 黑色，亮色背景上用
