# Raw Perspectives 素材库

给反驳卡的「看详情」扩展字段（events / data / causes / background / analysis）建素材库。

## 工作流（批量模式）

```
Step 1   你 复制 _doubao-prompt.md → 粘豆包发送
         (prompt 里固定写死了 7 个核心黑点)

Step 2   豆包 在抖音/B站/小红书/虎扑/知乎搜罗
         返回一大段 markdown：7 个黑点 × 5 节 = 35 段结构化内容

Step 3   你 把豆包返回全文存到
         docs/raw-perspectives/_doubao-batch-1.md

Step 4   你 告诉 Claude「batch-1 搜完了」

Step 5   Claude 把 batch md 拆分到 7 张单卡 md：
         - black_2011_8_points.md
         - black_team_hopping.md
         - ...

Step 6   你 逐张校对：删水内容、加深度论点、改数据、
         在 §六 写你自己的洞察、§七 给 Claude 指令

Step 7   你 告诉 Claude「这几张素材好了」

Step 8   Claude 读完 → 输出扩展卡 JSON → 落到
         miniprogram/data/rebuttal_cards_extended.js
```

## 目录结构

```
docs/raw-perspectives/
├── README.md              # 这个文件
├── _doubao-prompt.md      # 给豆包用的搜罗 prompt（复制即用）
├── _template.md           # 每张卡的空白素材模板
└── {card_id}.md           # 一张卡一个文件
```

## 命名规则

文件名用反驳卡的 `id`：

```
black_2011_8_points.md      # 8 分释兵权
black_bubble_ring.md        # 米奇冠军
docx_excel_king.md          # Excel 球王
black_team_hopping.md       # 抱团跑路
```

可以在 `miniprogram/data/rebuttal_cards*.js` 里查 id。

## 流程示例

### Step 1：在豆包跑搜罗

打开豆包 → 新建对话 → 复制 `_doubao-prompt.md` 全文 → 把里面的 `[卡名]` 替换成你要搜的（比如 `8 分释兵权`）→ 发送。

豆包会在抖音/B 站/小红书/知乎/虎扑/微博搜中文观点，按结构化输出。

### Step 2：粘到 md 文件

新建文件 `docs/raw-perspectives/black_2011_8_points.md`，把豆包返回的内容粘进去。

参考 `_template.md` 的结构。

### Step 3：你把关修改

豆包搜的是网络观点，会有：
- 重复的废话
- 不准确的数据
- 黑粉视角缺真理深度论点

你过一遍，**该删的删、该改的改、要加的加**（比如「持球大核打无球错配」这种你自己懂球的深度论点）。

### Step 4：告诉 Claude

「`black_2011_8_points.md` 素材好了，重新生成扩展卡」

Claude 读这个 md → 输出该卡的扩展字段 JSON → 落到 `miniprogram/data/rebuttal_cards_extended.js`。

## 分工

| 角色 | 职责 |
|---|---|
| **豆包** | 联网搜罗，输出大量原始观点（quantity） |
| **你** | 内容把关（你懂篮球比 AI 深），删水内容、加深度论点（quality） |
| **Claude** | 结构化、整理、生成 JSON（structure） |

豆包出量，你出质，Claude 出形。
