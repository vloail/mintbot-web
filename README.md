# ⚡ MINTBOT — 批量 Mint NFT 控制台

纯前端批量 mint 网站（mintbot 风格深色控制台）。无需后端，浏览器直连 RPC，私钥不出本机。

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

- **两种钱包模式**
  - 🔗 连接钱包：MetaMask 等，单钱包顺序循环 mint（本地 nonce 递增，安全）
  - 📦 批量私钥：粘贴私钥列表（每行一个），任务按钱包分组——**钱包内顺序执行（nonce 不冲突）、钱包之间并行**（并发数可调）
- **内置网络预设**：GIWA Testnet、Robinhood Chain、Ethereum、Base、Arbitrum、Polygon + 自定义 RPC
- **内置函数签名**：mint(uint256)、mint(uint256,address)、publicMint(uint256)、mint(address,uint256)、claim()、freeMint()、mintPOAP(string)、自定义 ABI JSON
- **合约预设**：POAP Attendance（GIWA Testnet 0x8Cd7207d60D236F2b71c7AD677fcd45053Da0d1c）
- **🛒 OpenSea SeaDrop 模式**（内置 OUTLANDERS on RH 预设）：
  - Robinhood Chain 上 OpenSea SeaDrop 合约批量 mint（Erc721SeaDropV1）
  - 一键读取链上 drop 配置（价格/时段/每钱包上限/feeRecipient/signers）
  - 按钱包自动判断阶段：有签名→签名阶段（TEAM/WL/COMMUNITY），无签名→Public
  - mintPublic（公开阶段，无需签名，全自动）与 mintSigned（签名阶段）双支持
  - EIP-712 签名本地验证（recover 对比 signer 白名单）
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

- 私钥仅在本机浏览器内处理，不上传任何服务器（纯前端直连 RPC）
- 批量模式每个钱包顺序执行，钱包间并行；中途「停止」会等当前批次发完，已广播的交易不可撤回
- 每个钱包的 nonce 是本地递增的，若中途 RPC 丢交易，后续可能 nonce 冲突 —— 失败项会记入「失败列表」可复制后重跑
- POAP 合约每个地址只能 mint 一次，名字列表行数 = 钱包数
- OpenSea 签名阶段（TEAM/WL/COMMUNITY）的 EIP-712 签名由 OpenSea 后端签发：在 opensea.io 集合页 DevTools → Network → 点 Mint，抓 mintSigned 请求参数填入「签名 JSON」。Public 阶段无需签名
- OUTLANDERS 公开阶段：2026-08-15 17:00 UTC（北京时间 8/16 01:00）→ 08-22，0.0015 ETH/个，每钱包上限 5
