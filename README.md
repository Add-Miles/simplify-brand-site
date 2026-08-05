# Simplify 品牌首页（稳定演示版 v1.0）

公司品牌站首页原型。愿景：**用科技简化生活**。业务：云计算 · 量化金融 · AI 应用。

## 在线演示

GitHub Pages 发布后：

**https://add-miles.github.io/simplify-brand-site/**

## 本地预览

```bash
cd simplify-brand-site
python3 -m http.server 5173
# http://localhost:5173
```

## 内容结构（成熟科技公司首页）

| 区块 | 作用 |
|------|------|
| Hero | 品牌与一句话定位 |
| 公司 | 我们做什么、现阶段 |
| 业务 | 三条线 + 明确状态（可用 / 建设中） |
| 产品 | Flash Launch（云计算入口） |
| 联系 | 合作邮箱、招聘、社交（待补） |
| Footer | 导航、法律、语言 |

## 已确认事实

- 愿景：用科技简化生活
- 产品：Flash Launch → https://flashlaunch.net/
- 招聘 / 合作邮箱（来自官网）：career@simplify-net.com
- 法律页、关于页、招聘页链至 simplify-net.com
- 小红书 / 抖音链接待补

## 文案原则

- 短句、具体、标明状态，避免口号堆叠
- 参考：`humanizer-zh`、`brand-voice`、Anthropic `frontend-design` 写作部分

## 技术

静态站：`index.html` + `css/site.css` + `js/site.js`  
无构建步骤，可直接 GitHub Pages 托管。
