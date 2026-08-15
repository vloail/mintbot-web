#!/usr/bin/env python3
"""解析 OpenSea 集合页面 HTML → 结构化 JSON（供 mintbot 前端自动配置用）
用法: python3 parse_opensea.py <page.html> <output.json>
"""
import re, json, sys, datetime

def main():
    page, out_path = sys.argv[1], sys.argv[2]
    raw = open(page, encoding='utf-8', errors='ignore').read()

    # slug 从 URL 或页面 canonical
    m = re.search(r'/collection/([a-zA-Z0-9_-]+)', raw)
    slug = m.group(1) if m else 'unknown'

    # 1) NFT 合约地址：页面内 "address":"0x..."（排除零地址和 0x0000 开头）
    addrs = re.findall(r'"address":"(0x[a-fA-F0-9]{40})"', raw)
    nft = next((a for a in addrs if a != '0x' + '0' * 40
                and not a.lower().startswith('0x000000000000000000000000')), None)

    # 2) dropBySlug 阶段数据
    i = raw.find('dropBySlug')
    seg = raw[i:i + 5000] if i > 0 else ''
    stages = []
    pat = re.compile(
        r'\{"label":"([^"]*)","stageType":"([^"]*)","stageIndex":(\d+),'
        r'"startTime":"([^"]*)","endTime":"([^"]*)",'
        r'"maxTotalMintableByWallet":(\d+),.*?"price":\{"usd":([\d.]+),'
        r'"token":\{"unit":([\d.]+)'
    )
    for mm in pat.finditer(seg):
        stages.append({
            'label': mm.group(1), 'type': mm.group(2), 'stageIndex': int(mm.group(3)),
            'startTime': mm.group(4), 'endTime': mm.group(5),
            'maxTotalMintableByWallet': int(mm.group(6)),
            'usd': float(mm.group(7)), 'priceEth': float(mm.group(8)),
        })

    ms = re.search(r'"maxSupply":(\d+)', raw)
    out = {
        'slug': slug,
        'fetchedAt': datetime.datetime.utcnow().isoformat() + 'Z',
        'nftContract': nft,
        'chain': 'robinhood',
        'chainId': 4663,
        'maxSupply': int(ms.group(1)) if ms else None,
        'stages': stages,
    }
    with open(out_path, 'w') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"parsed {slug}: nft={nft} stages={len(stages)} maxSupply={out['maxSupply']}")

if __name__ == '__main__':
    main()
