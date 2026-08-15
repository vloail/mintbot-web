# ⚡ MINTBOT — 批量 Mint NFT 控制台

纯前端批量 mint 网站（mintbot 风格深色控制台）。无需后端，浏览器直连 RPC，**带本地账号系统**：私钥用你的密码加密后仅存本浏览器（PBKDF2 + AES-GCM），不上传任何服务器。

## 快速开始

1. 点右上角 **👤 注册 / 登录**（密码用于加密钱包，忘了无法找回）
2. 点 **👛 我的钱包** → **创建钱包**（自动生成 12 词助记词，务必抄下）或 **批量创建**（一次生成 N 个，无📄助记词、导出私钥 CSV），或 **导入** 已有私钥/助记词
3. 选 mint 类型：顶部 Tab 切 **🧪 普通合约**（网络/合约/函数）或 **🛒 OpenSea Mint**（填集合链接一键自动配置）
4. 钱包来源选「👤 账号钱包」，勾选要 mint 的钱包 → **▶ 开始批量 Mint**

也可以直接**粘贴私钥列表**（模式 B，不依赖账号）。

## 🌐 线上地址

- **主站（国内可达）**：https://vloail.github.io/mintbot-web/
- **全球备用（国内需代理）**：https://mintbot.liaolv.workers.dev
- **源码**：https://github.com/vloail/mintbot-web

## 本地开发

```bash
cd ~/mintbot-web
python3 -m http.server 8787
# 浏览器打开 http://localhost:8787
```

## 部署

```bash
# Cloudflare Workers（需 wrangler + CLOUDFLARE_API_TOKEN）
~/hermes-demo-tool/node_modules/.bin/wrangler deploy

# GitHub Pages（仓库 main 分支根目录，已开启自动构建）
# 更新 index.html 后：git add/commit/push（push 需要能连上 github.com）
```

直接双击 index.html（file://）也可以，但部分 RPC 会因 CORS 拒绝 file:// 来源，推荐用本地服务。

## 功能

- **两种钱包来源**
  - 👤 账号钱包：注册/登录后创建或导入钱包（加密存本浏览器），勾选批量 mint
  - 📦 粘贴私钥：每行一个，任务按钱包分组——**钱包内顺序执行（nonce 不冲突）、钱包之间并行**（并发数可调）
- **钱包管理**：单个创建（12 词助记词）/ ⚡ 批量创建（无📄助记词，一键导出私钥 CSV，最多 500 个）/ 导入（私钥或助记词）/ 导出 / 删除
- **顶部 Tab 切换**：🧪 普通合约 Mint ｜ 🛒 OpenSea Mint（显眼入口）
- **内置网络预设**：GIWA Testnet、Robinhood Chain、Ethereum、Base、Arbitrum、Polygon + 自定义 RPC
- **内置函数签名**：mint(uint256)、mint(uint256,address)、publicMint(uint256)、mint(address,uint256)、claim()、freeMint()、mintPOAP(string)、自定义 ABI JSON
- **合约预设**：POAP Attendance（GIWA Testnet 0x8Cd7207d60D236F2b71c7AD677fcd45053Da0d1c）
- **🛒 OpenSea SeaDrop 模式**（填集合链接一键自动配置）：
  - 粘贴 opensea.io 集合链接/slug → 自动解析 NFT 合约、SeaDrop 合约、全部阶段（时间/价格/上限/状态）
  - 链上 drop 配置一键读取（价格/时段/每钱包上限/feeRecipient/signers）
  - 按钱包自动判断阶段：有签名→签名阶段（TEAM/WL/COMMUNITY），无签名→Public
  - mintPublic（公开阶段，无需签名，全自动）与 mintSigned（签名阶段）双支持
  - EIP-712 签名本地验证（recover 对比 signer 白名单）
  - 新集合：GitHub Actions → fetch-opensea → Run workflow → 填 slug 抓取一次后即可自动配置
- **Gas 控制**：EIP-1559 / legacy 自动识别，倍率可调；gasLimit 自动估算（失败回退 300k）
- **运行面板**：总任务/成功/失败/进行中统计、进度条、实时日志、失败列表一键复制
- 配置自动保存到 localStorage
- ethers.js 多 CDN 兜底加载（jsdelivr → cdnjs → unpkg），无需本地 vendor 文件

## 用法

1. 选网络（或自定义 RPC + Chain ID）
2. 填合约地址（或选 POAP 预设）
3. 选 mint 函数；带 uint 参数的填「单次数量」，需要名字的填「名字列表」
4. 「每钱包调用次数」= 每个钱包重复调用几次；「并发数」= 同时跑几个钱包
5. 免费 mint 填 value=0；付费 mint 填每笔 ETH 价值
6. 模式 A 先点「连接钱包」；模式 B 粘贴私钥列表
7. 点「▶ 开始批量 Mint」

## 注意

- 账号私钥仅加密存本浏览器（PBKDF2 15 万次迭代 + AES-GCM），不上传任何服务器；清缓存/换浏览器/忘记密码都会丢失，助记词务必抄下
- 批量模式每个钱包顺序执行，钱包间并行；中途「停止」会等当前批次发完，已广播的交易不可撤回
- 每个钱包的 nonce 是本地递增的，若中途 RPC 丢交易，后续可能 nonce 冲突 —— 失败项会记入「失败列表」可复制后重跑
- POAP 合约每个地址只能 mint 一次，名字列表行数 = 钱包数
- OpenSea 签名阶段（TEAM/WL/COMMUNITY）的 EIP-712 签名由 OpenSea 后端签发：在 opensea.io 集合页 DevTools → Network → 点 Mint，抓 mintSigned 请求参数填入「签名 JSON」。Public 阶段无需签名
- OUTLANDERS 公开阶段：2026-08-15 17:00 UTC（北京时间 8/16 01:00）→ 08-22，0.0015 ETH/个，每钱包上限 5

## 添加新的 OpenSea 集合

1. GitHub 仓库 Actions 页面 → fetch-opensea → Run workflow → 填 slug（如 outlandersonrh）→ 运行
2. 等待 1 分钟，runner 抓取页面并解析成 `opensea_data/{slug}.json`
3. 回到网站，填集合链接 → ⚡ 自动配置 即可
