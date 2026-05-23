## 用户端（app.js）

| Method | Path | 说明 | 位置 |
|---|---|---|---|
| GET | `/api/meta/themes` | 主题列表 | `app.js:1247` |
| GET | `/api/leaderboard/config` | 榜单配置 | `app.js:2841` |
| GET | `/api/leaderboard/list?...` | 榜单数据 | `app.js:3062` |
| GET | `/api/meta/currency` | 币种元数据 | `app.js:3471` |
| GET | `/api/wallet/ledger?limit=20` | 钱包流水 | `app.js:3538` |
| GET | `/api/recharge/status?orderId=...` | 充值订单状态 | `app.js:3592` |
| GET | `/api/meta/material-overrides` | 材料覆盖配置 | `app.js:3809` |
| GET | `/api/meta/materials` | 材料白名单 | `app.js:3917` |
| GET | `/api/meta/market-tags` | 市场标签元数据 | `app.js:4012` |
| GET | `/api/wallet` | 钱包余额 | `app.js:5567,5699` |
| GET | `/api/orders/list?limit=30` | 订单列表（首页） | `app.js:5568` |
| GET | `/api/orders/list?limit=50` | 订单列表（订单页） | `app.js:6947` |
| GET | `/api/market/listings?mine=true&limit=80` | 我的上架 | `app.js:5569` |
| GET | `/api/market/listings?...` | 市场列表（动态查询） | `app.js:6584-6585` |
| GET | `/api/notifications/unread-count` | 未读通知数 | `app.js:5570,6849` |
| GET | `/api/products` | 商品列表 | `app.js:6510` |
| GET | `/api/orders/policy` | 订单策略 | `app.js:6635` |
| GET | `/api/notifications/list?limit=50` | 通知列表 | `app.js:6865` |
| POST | `/api/notifications/mark-read` | 标记单条/全部通知已读 | `app.js:6898,6921` |
| POST | `/api/orders/refund` | 订单退款 | `app.js:7179` |
| POST | `/api/orders` | 创建订单 | `app.js:7204` |
| POST | `/api/market/listings/create` | 创建收购单/上架 | `app.js:7416` |
| POST | `/api/market/buy` | 购买上架 | `app.js:7450` |
| POST | `/api/market/sell-to-buy` | 向收购单交货 | `app.js:7512` |
| POST | `/api/market/bid` | 拍卖出价 | `app.js:7558` |
| POST | `/api/market/unlist` | 下架 | `app.js:7601` |
| POST | `/api/market/supply/refresh` | 刷新供货 | `app.js:7612` |
| POST | `/api/market/pause` | 暂停上架 | `app.js:7640` |
| POST | `/api/market/resume` | 恢复上架 | `app.js:7651` |
| POST | `/api/market/price` | 改价 | `app.js:7662` |
| POST | `/api/market/remark` | 改备注 | `app.js:7673` |
| POST | `/api/market/settings` | 上架设置（价格/规则等） | `app.js:7708` |
| POST | `/api/auth/login` | 登录 | `app.js:7751` |
| POST | `/api/auth/logout` | 登出 | `app.js:7780` |
| POST | `/api/recharge/create` | 创建充值订单 | `app.js:7825` |
| POST | `/api/redeem/use` | 使用兑换码 | `app.js:7875` |
| POST | `/api/wallet/exchange` | 货币兑换 | `app.js:7950` |
| POST (multipart/form-data) | `/api/market/icon/upload?...` | 上传市场图标 | `app.js:8483` |

## 管理端（admin.js）

| Method | Path | 说明 | 位置 |
|---|---|---|---|
| GET | `/api/meta/themes` | 主题元数据 | `admin.js:1167` |
| GET | `/api/admin/locales` | 语言包列表 | `admin.js:1420` |
| POST | `/api/admin/locales/upload` | 上传语言包 | `admin.js:1749` |
| GET | `/api/admin/l10n/manifest?...` | 远端清单探测/拉取（语言/主题） | `admin.js:1897,2496,2873` |
| POST | `/api/admin/locales/sync-manifest` | 从清单同步语言包 | `admin.js:1970` |
| POST | `/api/admin/locales/default` | 设置默认语言 | `admin.js:2019` |
| POST | `/api/admin/locales/action` | 语言包动作（remove/toggleWeb/toggleGame） | `admin.js:2032,2040,2047` |
| GET | `/api/admin/themes` | 主题列表 | `admin.js:2140` |
| POST | `/api/admin/themes/upload` | 上传主题包 | `admin.js:2730` |
| POST | `/api/admin/themes/sync-manifest` | 从清单同步主题 | `admin.js:2946` |
| POST | `/api/admin/themes/default` | 设置默认主题 | `admin.js:2995` |
| POST | `/api/admin/themes/action` | 主题动作（remove/toggleWeb） | `admin.js:3008,3016` |
| GET | `/api/meta/currency` | 币种元数据 | `admin.js:4217` |
| POST | `/api/admin/auth/login` | 管理员登录 | `admin.js:4511` |
| GET | `/api/admin/auth/me` | 当前管理员信息 | `admin.js:4540` |
| GET | `/api/meta/market-tags` | 市场标签元数据 | `admin.js:4598` |
| GET | `/api/admin/market/tags-config` | 市场标签配置 | `admin.js:5498` |
| GET | `/api/admin/market/limitation-config` | 市场限制配置 | `admin.js:5502` |
| POST | `/api/admin/market/tags-config` | 保存市场标签配置 | `admin.js:5531` |
| POST | `/api/admin/market/limitation-config` | 保存市场限制配置 | `admin.js:5545` |
| GET | `/api/meta/material-overrides` | 材料覆盖配置 | `admin.js:6401` |
| GET | `/api/meta/materials` | 材料白名单 | `admin.js:6551` |
| POST | `/api/admin/redeem/create` | 生成兑换码 | `admin.js:7100` |
| GET | `/api/admin/redeem/list?limit=200` | 兑换码列表 | `admin.js:7112` |
| POST | `/api/admin/products/upsert` | 创建/更新商品 | `admin.js:7221` |
| POST (multipart/form-data) | `/api/admin/products/icon?...` | 上传商品图标 | `admin.js:7260` |
| POST | `/api/admin/products/reset-limit` | 重置商品限购 | `admin.js:7300` |
| POST | `/api/admin/group-buy/consume` | 核销团购券 | `admin.js:7315` |
| POST | `/api/admin/products/active` | 启用/停用商品 | `admin.js:7463` |
| GET | `/api/admin/products/list?includeInactive=true&limit=300` | 商品列表（含停用） | `admin.js:7494` |
| GET | `/api/admin/orders/list?...` | 订单列表 | `admin.js:7536` |
| GET | `/api/admin/economy/settings` | 经济配置 | `admin.js:7547` |
| GET | `/api/admin/material-overrides/list?...` | 材料覆盖列表 | `admin.js:7992` |
| POST | `/api/admin/material-overrides/upsert` | 创建/更新材料覆盖 | `admin.js:8040` |
| POST (multipart/form-data) | `/api/admin/material-overrides/icon?...` | 上传材料图标 | `admin.js:8075` |
| POST | `/api/admin/material-overrides/delete` | 删除材料覆盖 | `admin.js:8092` |
| POST | `/api/admin/economy/exchange` | 保存兑换配置 | `admin.js:8111` |
| POST | `/api/admin/economy/market` | 保存市场经济配置 | `admin.js:8133` |
| POST | `/api/admin/economy/leaderboard` | 保存榜单配置 | `admin.js:8214` |
| POST | `/api/admin/economy/currency` | 保存币种显示配置 | `admin.js:8236` |
| POST | `/api/admin/system/webshop` | 保存 WebShop 系统配置 | `admin.js:8254` |
| POST | `/api/admin/system/market` | 保存市场系统配置 | `admin.js:8275` |
| POST | `/api/admin/system/maintenance` | 保存维护配置 | `admin.js:8292` |
| POST | `/api/admin/system/logging` | 保存日志配置 | `admin.js:8308` |
| POST | `/api/admin/system/notification` | 保存通知模板配置 | `admin.js:8441` |
| POST | `/api/admin/notifications/announce` | 发送系统公告 | `admin.js:8461` |
| POST | `/api/admin/system/broadcast` | 保存广播模板配置 | `admin.js:8472` |
| POST | `/api/admin/visual/settings` | 保存视觉策略配置 | `admin.js:8488` |
| GET | `/api/admin/market/listings?...` | 管理端市场上架列表 | `admin.js:8537` |
| POST | `/api/admin/market/unlist` | 管理员强制下架 | `admin.js:8549` |
| GET | `/api/admin/users/visual-permission?userId=...` | 查询用户视觉权限 | `admin.js:8620` |
| POST | `/api/admin/users/visual-permission` | 设置用户视觉权限 | `admin.js:8655` |
| GET | `/api/admin/users/lookup?identifier=...` | 查用户（标识符） | `admin.js:8689,8778` |
| GET | `/api/admin/users/list?...` | 用户列表 | `admin.js:8704` |
| POST | `/api/admin/users/logout` | 强制用户下线 | `admin.js:8731,8822` |
| POST | `/api/admin/users/unbind` | 解绑用户 | `admin.js:8748,8810` |
| POST | `/api/admin/users/reset-password` | 重置用户密码 | `admin.js:8799` |
| POST | `/api/admin/users/wallet-adjust` | 调整用户余额 | `admin.js:8839` |
| POST | `/api/admin/admin-users/active` | 启用/停用管理员 | `admin.js:9029` |
| GET | `/api/admin/admin-users/meta?locale=...` | 管理员模板元数据 | `admin.js:9060` |
| GET | `/api/admin/admin-users/list` | 管理员列表 | `admin.js:9072` |
| POST | `/api/admin/admin-users/upsert` | 创建/更新管理员 | `admin.js:9106` |
| GET | `/api/admin/audit/list?limit=200` | 审计日志列表 | `admin.js:9123` |
| POST | `/api/admin/auth/logout` | 管理员登出 | `admin.js:9151` |
