# DESIGN.md — Simplify 公司官网首页（v2）

> **设计宣言：** 成熟技术公司的「关于我们」级首页——有论点、有段落、有结构密度，不是一句口号一张黑底。

**Skills 驱动：** web-design（Phase A/B）· design-taste-frontend · frontend-design · redesign-existing · humanizer-zh · article-writing  
**灵感源：** Anthropic Company 级「论点 + 章节叙事」；Simplify 官网 About 文案骨架；Figma 社区暗色 B2B company 站通稿（大标题 + 分章声明 + 多栏能力 + 团队 + CTA）；style-seed **暗黑科技** 去霓虹改冷钢。

**硬约束：** 首页**不出现** Flash Launch 名称与链接。  
**可有：** 背景机构 logo 多行滚动（SparkX 式 runway）+ 团队窗口点击切换。

---

## 0. Design Read

公司品牌首页 · 商务/合作/招聘观众 · 冷黑 B2B 官方站（论点型，非 SaaS 获客页）

| Dial | 值 | 理由 |
|------|-----|------|
| VARIANCE | 6 | 分章节不对称，避免三等销售卡 |
| MOTION | 4 | L2 克制 reveal + 顶栏 |
| DENSITY | 5 | 成熟公司需要可读段落与区块厚度 |

---

## 1. Visual Theme & Atmosphere

**Style：** Cold steel company editorial  
**Keywords：** 论点、章节、分割线、冷黑、密度、可信、少卡多文  
**Tone：** 正式可核对 — 不是极简装饰空白、不是产品 slogan 海报  
**Feel：** 像公司公开说明的第一章：你能读完，也能转发给别人。

**Signature：** 首屏之后第一条巨大「为什么」声明（全宽大号段落），建立公司感。

**Interaction：** L2 · CSS only  
**Dependencies：** 静态 CSS + 现有 site.js 顶栏/scroll/reveal

---

## 2. Color Palette

```css
:root {
  --bg: #000000;
  --surface: #0c0c0e;
  --surface-alt: #080809;
  --border: rgba(255,255,255,0.09);
  --border-strong: rgba(255,255,255,0.16);
  --text: #f2f3f5;
  --text-2: #a8b0bd;
  --text-3: #6d7585;
  --accent: #e6eaf0;
  --live: #b7c7db;
  --bg-rgb: 0,0,0;
  --accent-rgb: 230,234,240;
}
```

禁：紫霓虹、暖奶油、酸绿。强调色近白，信任感靠字重与排版。

---

## 3. Typography

Outfit + 系统中文。  
H1 完整论句（例：为构建者提供能发、能跑、能被信任的…）。禁仅「让事情变简单」类六字口号作 H1。  
Section H2：clamp(1.65rem, 3vw, 2.4rem)  
Body：1.05rem / 1.75 行高 / max ~40em

标题无渐变字、无大发光。

---

## 4. 信息架构 & 线框

```
[Nav] Logo · 业务 · 方式 · 团队 · 联系 · 招聘 · 关于 | [商务合作]

[Hero]
  公司全称
  H1 完整论点（一句完整中文判断）
  2–3 句 lede（公司是谁、做什么类别工作、地点）
  [商务合作] [了解我们 → about]

[Why] 全宽声明：「为什么是现在」+ 两段正文

[Work] 业务三条 — 每条：标题 + 较长说明（非碎片 tag）

[Belief] 我们相信 — 2×2 原则格（来自 About 骨架，缩短）

[Team] 创始团队名录 + 链领导团队

[Contact] 商务 / 招聘 双栏厚面板

[Footer]
```

**删除：** 产品说明书节、背景 marquee、侧栏碎标签、`让事情变简单` 作唯一 H1。

---

## 5. 文案源规则

以 [simplify-net 关于页](https://simplify-net.com/zh-cn/about/) 为论点源，改写成首页篇幅；  
**不自创**「让事情变简单」类口号；**不出现** 产品品牌名 Flash Launch。

Hero H1 方向：`把想法变成真实世界可用的软件与成果。`  
（源：About 主线「把想法变成真实世界的软件、产品和成果」）

---

## 6–9. 组件 · 纵深 · 动效 · 响应

- 分区用顶部分割线；业务/原则用线格而非厚 bezel 卡  
- 顶栏锁定：全宽 → 玻璃胶囊  
- reveal L2；无 marquee  
- ≥980 三列业务 / 原则 2×2；≤768 单列 + 汉堡  

---

## CTA（一意图一标签）

| 意图 | 文案 |
|------|------|
| 商务 | 商务合作 |
| 关于 | 了解我们 |
| 招聘 | 查看职位 |

---

**Phase C：** 本轮直接按 v2 落地首页代码（用户已明确否定 v1 口号与空页）。
