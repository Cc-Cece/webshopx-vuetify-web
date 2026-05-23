<template>
  <v-container fluid :class="mdAndUp ? 'pa-6' : 'pa-3'">


    <!-- 主展示面板 -->
    <v-card elevation="0" variant="outlined" class="rounded-xl overflow-hidden glass-card">
      <v-row class="ma-0" :class="mdAndUp ? 'flex-nowrap' : ''">
        <!-- 左侧菜单：非移动端，或者移动端未进入详情状态时显示 -->
        <v-col v-if="mdAndUp || !showDetail" cols="12" md="3" class="border-r pa-0 bg-light-soft overflow-y-auto" :style="mdAndUp ? 'max-height: 88vh;' : ''">
          <v-list v-model:selected="activeTab" mandatory color="primary" class="bg-transparent py-4">
            <v-list-item
              value="storage"
              prepend-icon="mdi-database-outline"
              title="基础与存储引擎"
              subtitle="底层数据库与缓存设定"
              class="py-3 font-weight-bold"
              @click="showDetail = true"
            ></v-list-item>
            <v-list-item
              value="security"
              prepend-icon="mdi-shield-key-outline"
              title="安全与密钥鉴权"
              subtitle="MFA、证书与权限级别"
              class="py-3 font-weight-bold"
              @click="showDetail = true"
            ></v-list-item>
            <v-list-item
              value="webhook"
              prepend-icon="mdi-webhook"
              title="Webhook 与事件推送"
              subtitle="微服务自动化流水事件"
              class="py-3 font-weight-bold"
              @click="showDetail = true"
            ></v-list-item>
            <v-list-item
              value="cluster"
              prepend-icon="mdi-server-network"
              title="微服务集群控制"
              subtitle="服务发现与副本分配"
              class="py-3 font-weight-bold"
              @click="showDetail = true"
            ></v-list-item>
            <v-list-item
              value="tuning"
              prepend-icon="mdi-tune-variant"
              title="性能参数调优"
              subtitle="吞吐率、压缩及缓冲设定"
              class="py-3 font-weight-bold"
              @click="showDetail = true"
            ></v-list-item>
            <v-list-item
              value="ui_custom"
              prepend-icon="mdi-palette"
              title="界面个性定制"
              subtitle="主题、色板与提示音设定"
              class="py-3 font-weight-bold"
              @click="showDetail = true"
            ></v-list-item>
          </v-list>
        </v-col>

        <!-- 右侧表单：非移动端，或者移动端已进入详情状态时显示 -->
        <v-col v-if="mdAndUp || showDetail" cols="12" md="9" :class="mdAndUp ? 'pa-6 overflow-y-auto bg-surface' : 'pa-4 bg-surface'" :style="mdAndUp ? 'max-height: 88vh;' : ''">
          <!-- 移动端详情态下的返回按钮 -->
          <div class="d-flex align-center mb-4 d-md-none">
            <v-btn icon="mdi-arrow-left" variant="text" color="primary" @click="showDetail = false" class="mr-2"></v-btn>
            <span class="text-h6 font-weight-bold text-slate-800">{{ getTabTitle(activeTab[0]) }}</span>
          </div>

          <v-form ref="settingsForm" v-model="formValid" lazy-validation>
            <!-- ----------------------------------------------------- -->
            <!-- 分类 1: 基础与存储引擎 -->
            <!-- ----------------------------------------------------- -->
            <div v-if="activeTab[0] === 'storage'">
              <div class="text-h5 font-weight-bold text-slate-800 mb-2">存储与数据库引擎</div>
              <p class="text-body-2 text-medium-emphasis mb-6">配置分布式集群缓存驱动、磁盘持久化参数以及数据高频读写策略。</p>

              <v-row>
                <!-- 缓存引擎选择 (v-radio-group & v-radio) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">默认高速缓存引擎后端</div>
                    <v-radio-group v-model="settings.dbEngine" color="primary" class="mt-2">
                      <v-radio label="Redis 极速内存集群 (主推)" value="redis"></v-radio>
                      <v-radio label="Memcached 轻量分布式缓存" value="memcached"></v-radio>
                      <v-radio label="LevelDB 高效本地 KV 引擎" value="leveldb"></v-radio>
                      <v-radio label="SQLite 嵌入式事务存储" value="sqlite"></v-radio>
                    </v-radio-group>
                  </v-card>
                </v-col>

                <!-- 缓存前缀与保留期限 (v-text-field & v-select) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">缓存持久性策略</div>
                    <v-text-field
                      v-model="settings.cachePrefix"
                      label="全局缓存命名空间前缀"
                      placeholder="wxs_core:"
                      variant="outlined"
                      density="comfortable"
                      class="mb-3"
                      hide-details="auto"
                      :rules="[v => !!v || '前缀不能为空']"
                    ></v-text-field>

                    <v-select
                      v-model="settings.retention"
                      :items="[
                        { title: '极速挥发 (7天)', value: '7d' },
                        { title: '常规周期 (30天)', value: '30d' },
                        { title: '长期冷存 (90天)', value: '90d' },
                        { title: '无期限持久保存', value: 'infinite' }
                      ]"
                      label="未访问数据淘汰周期"
                      variant="outlined"
                      density="comfortable"
                    ></v-select>
                  </v-card>
                </v-col>

                <!-- 缓存持久化 (v-switch / settings-switch) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-1">物理磁盘同步 (Persistence)</div>
                    <p class="text-caption text-medium-emphasis mb-3">开启后将定时将脏内存页刷盘，以防服务器断电丢失缓存。</p>
                    <settings-switch
                      v-model="settings.diskPersistence"
                      label="启用 Redis AOF/RDB 双重持久化"
                    ></settings-switch>
                  </v-card>
                </v-col>

                <!-- 备份周期切换 (v-btn-toggle) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">自动全量冷备频率</div>
                    <v-btn-toggle
                      v-model="settings.backupFrequency"
                      mandatory
                      selected-class="bg-primary text-white"
                      density="comfortable"
                      class="rounded-lg border w-100"
                    >
                      <v-btn class="flex-grow-1" value="hourly">每小时</v-btn>
                      <v-btn class="flex-grow-1" value="daily">每日</v-btn>
                      <v-btn class="flex-grow-1" value="weekly">每周</v-btn>
                    </v-btn-toggle>
                    <div class="text-caption text-medium-emphasis mt-3">
                      冷备文件将自动上传至分布式存储服务 (OSS)。
                    </div>
                  </v-card>
                </v-col>

                <!-- 自适应延迟阈值 (v-slider) -->
                <v-col cols="12">
                  <v-card class="pa-4 rounded-xl border bg-light-soft" variant="flat">
                    <div class="d-flex justify-space-between align-center mb-1">
                      <div class="text-subtitle-2 font-weight-bold">读写延迟自适应重连阈值 (毫秒)</div>
                      <span class="text-subtitle-2 font-weight-bold text-primary">{{ settings.dbDelay }} ms</span>
                    </div>
                    <p class="text-caption text-medium-emphasis mb-4">设定与高可用存储端通信的心跳上限，超时将自动路由至只读副本。</p>
                    <v-slider
                      v-model="settings.dbDelay"
                      :min="10"
                      :max="500"
                      :step="5"
                      color="primary"
                      track-color="rgba(var(--v-theme-primary), 0.15)"
                      thumb-label
                    ></v-slider>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- ----------------------------------------------------- -->
            <!-- 分类 2: 安全与密钥鉴权 -->
            <!-- ----------------------------------------------------- -->
            <div v-else-if="activeTab[0] === 'security'">
              <div class="text-h5 font-weight-bold text-slate-800 mb-2">安全机制与密钥验证</div>
              <p class="text-body-2 text-medium-emphasis mb-6">设定微服务通信加密协议、系统敏感字段权限与控制台双因子鉴权。</p>

              <v-row>
                <!-- MFA 双因子验证与对称密钥 (v-switch & v-autocomplete) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">多因子身份与传输加密</div>
                    <settings-switch
                      v-model="settings.mfaEnabled"
                      label="强控制台登录双因子 (MFA) 校验"
                      class="mb-4"
                    ></settings-switch>

                    <v-autocomplete
                      v-model="settings.encryptionAlgo"
                      :items="[
                        'AES-GCM-256 (超高安全级)',
                        'ChaCha20-Poly1305 (移动端推荐)',
                        'RSA-OAEP-4096 (极地国防级)',
                        'HMAC-SHA256 (轻量防篡改)'
                      ]"
                      label="报文对称加密套件"
                      variant="outlined"
                      density="comfortable"
                    ></v-autocomplete>
                  </v-card>
                </v-col>

                <!-- OTP 安全验证令牌 (v-otp-input) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height text-center d-flex flex-column justify-center" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold text-left mb-2">二次鉴权预设安全码 (OTP Key)</div>
                    <p class="text-caption text-medium-emphasis text-left mb-4">修改高风险安全选项时，系统需二次验证此 6 位安全锁码。</p>
                    <v-otp-input
                      v-model="settings.otpToken"
                      length="6"
                      type="number"
                      class="mx-auto"
                      style="max-width: 320px;"
                    ></v-otp-input>
                  </v-card>
                </v-col>

                <!-- 文件上传证书 (v-file-input) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">API 加密证书载入 (.pem)</div>
                    <v-file-input
                      v-model="settings.sslCertFile"
                      accept=".pem,.crt,.key"
                      label="导入公钥/私钥授权文件"
                      prepend-icon=""
                      prepend-inner-icon="mdi-certificate-outline"
                      variant="outlined"
                      density="comfortable"
                      show-size
                      hide-details="auto"
                    ></v-file-input>
                    <div class="text-caption text-medium-emphasis mt-2">支持导入 PEM 格式证书。非对称密钥签名需要此文件参与。</div>
                  </v-card>
                </v-col>

                <!-- CORS 跨域多值组合框 (v-combobox) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">CORS 允许调用来源域</div>
                    <v-combobox
                      v-model="settings.corsOrigins"
                      label="允许跨域域名 (Enter添加)"
                      multiple
                      chips
                      closable-chips
                      variant="outlined"
                      density="comfortable"
                      placeholder="输入域名并按回车"
                      hide-details="auto"
                    ></v-combobox>
                    <div class="text-caption text-medium-emphasis mt-2">缺省为仅限本地源访问。支持逗号与空格分词。</div>
                  </v-card>
                </v-col>

                <!-- 敏感动作安全星级评估 (v-rating) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-1">高敏行为安全审查评级</div>
                    <p class="text-caption text-medium-emphasis mb-3">根据当前业务的机密等级，评定是否要求所有高敏写操作必须经过审计员手工放行。</p>
                    <div class="d-flex align-center mt-2">
                      <v-rating
                        v-model="settings.securityRating"
                        color="error"
                        active-color="error"
                        density="comfortable"
                        hover
                        empty-icon="mdi-shield-outline"
                        full-icon="mdi-shield-lock"
                      ></v-rating>
                      <span class="text-body-2 font-weight-bold ml-3 text-error">
                        级别: {{ settings.securityRating }} 星 ({{ getSecurityLevelName(settings.securityRating) }})
                      </span>
                    </div>
                  </v-card>
                </v-col>

                <!-- 自定义私钥文本区 (v-textarea) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">控制台专有加密 SSH 公钥明文</div>
                    <v-textarea
                      v-model="settings.sshPublicKey"
                      label="SSH Authorized Keys"
                      placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC..."
                      variant="outlined"
                      rows="3"
                      hide-details="auto"
                    ></v-textarea>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- ----------------------------------------------------- -->
            <!-- 分类 3: Webhook 与事件推送 -->
            <!-- ----------------------------------------------------- -->
            <div v-else-if="activeTab[0] === 'webhook'">
              <div class="text-h5 font-weight-bold text-slate-800 mb-2">Webhook 异步全局回调推送</div>
              <p class="text-body-2 text-medium-emphasis mb-6">当商城主干服务发生支付、库存售罄、用户申诉等状态变化时，自动组装 JSON 报文推送至指定第三方服务器。</p>

              <v-row>
                <!-- 终结点 URL (v-text-field with rules) -->
                <v-col cols="12">
                  <v-card class="pa-4 rounded-xl border bg-light-soft" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">终结点推送接收地址 (URL)</div>
                    <v-text-field
                      v-model="settings.webhookUrl"
                      label="Webhook Endpoint"
                      placeholder="https://api.yourdomain.com/v1/callbacks"
                      variant="outlined"
                      prepend-inner-icon="mdi-link-variant"
                      :rules="[
                        v => !!v || '回调推送地址不能为空',
                        v => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(v) || '请输入有效的 URL 地址'
                      ]"
                    ></v-text-field>
                  </v-card>
                </v-col>

                <!-- 回调触发事件多选 (v-select with multiple & chips) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">触发推送的动作事件</div>
                    <v-select
                      v-model="settings.webhookEvents"
                      :items="[
                        { title: 'order.created (创建订单)', value: 'order_created' },
                        { title: 'order.paid (用户已支付)', value: 'order_paid' },
                        { title: 'product.low_stock (库存警戒警告)', value: 'stock_low' },
                        { title: 'user.signup (新玩家注册登录)', value: 'user_signup' },
                        { title: 'auction.deal (拍卖锤定签约)', value: 'auction_deal' }
                      ]"
                      label="选择监听事件"
                      multiple
                      chips
                      variant="outlined"
                      density="comfortable"
                    ></v-select>
                  </v-card>
                </v-col>

                <!-- 重试退避策略选择 (v-radio-group) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">投递失败后重试退避策略</div>
                    <v-radio-group v-model="settings.webhookRetryPolicy" inline color="primary">
                      <v-radio label="立即重试" value="immediate" class="mr-4"></v-radio>
                      <v-radio label="线性递增重试" value="linear" class="mr-4"></v-radio>
                      <v-radio label="指数退避重试 (推荐)" value="exponential"></v-radio>
                    </v-radio-group>
                    <div class="text-caption text-medium-emphasis mt-2">
                      指数退避重试最大尝试 5 次，并在 24 小时后彻底弃置归档。
                    </div>
                  </v-card>
                </v-col>

                <!-- 多选择通道 checkboxes -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">通知投递多渠道同步</div>
                    <p class="text-caption text-medium-emphasis mb-3">除标准 Webhook 推送外，是否同时向以下通讯平台投递缩略警报卡片：</p>
                    <v-row class="ma-0">
                      <v-col cols="12" sm="6" class="pa-1">
                        <v-checkbox v-model="settings.notifyPlatforms" label="企业微信 BOT" value="wechat_bot" density="compact" hide-details></v-checkbox>
                      </v-col>
                      <v-col cols="12" sm="6" class="pa-1">
                        <v-checkbox v-model="settings.notifyPlatforms" label="钉钉群机器人" value="dingtalk" density="compact" hide-details></v-checkbox>
                      </v-col>
                      <v-col cols="12" sm="6" class="pa-1">
                        <v-checkbox v-model="settings.notifyPlatforms" label="Telegram Channel" value="telegram" density="compact" hide-details></v-checkbox>
                      </v-col>
                      <v-col cols="12" sm="6" class="pa-1">
                        <v-checkbox v-model="settings.notifyPlatforms" label="Discord Webhook" value="discord" density="compact" hide-details></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>

                <!-- 超时设置 (v-slider) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="d-flex justify-space-between align-center mb-1">
                      <div class="text-subtitle-2 font-weight-bold">推送请求超时时间 (秒)</div>
                      <span class="text-subtitle-2 font-weight-bold text-primary">{{ settings.webhookTimeout }} s</span>
                    </div>
                    <p class="text-caption text-medium-emphasis mb-4">超过设定时间接收端未响应 HTTP 200，则判定本次推送失败并加入重试队列。</p>
                    <v-slider
                      v-model="settings.webhookTimeout"
                      :min="1"
                      :max="30"
                      :step="1"
                      color="primary"
                      thumb-label
                    ></v-slider>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- ----------------------------------------------------- -->
            <!-- 分类 4: 微服务集群控制 -->
            <!-- ----------------------------------------------------- -->
            <div v-else-if="activeTab[0] === 'cluster'">
              <div class="text-h5 font-weight-bold text-slate-800 mb-2">微服务集群与服务治理</div>
              <p class="text-body-2 text-medium-emphasis mb-6">配置 Consul/Kubernetes 动态心跳监测阈值、服务自发现与当前活跃微服务开关。</p>

              <v-row>
                <!-- 服务发现与健康检查 (v-select & v-text-field) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">集群服务自发现配置</div>
                    <v-select
                      v-model="settings.discoveryMode"
                      :items="[
                        { title: 'Consul 注册中心动态监听', value: 'consul' },
                        { title: 'Kubernetes 内置 CoreDNS 解析', value: 'k8s' },
                        { title: '静态 IP 解析配置文件列表', value: 'static' }
                      ]"
                      label="注册发现后端驱动"
                      variant="outlined"
                      density="comfortable"
                      class="mb-3"
                    ></v-select>

                    <v-text-field
                      v-model="settings.healthCheckPath"
                      label="默认 HTTP 健康检查路由"
                      placeholder="/healthz"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                    ></v-text-field>
                  </v-card>
                </v-col>

                <!-- 心跳监测副本数 (v-slider with ticks) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="d-flex justify-space-between align-center mb-1">
                      <div class="text-subtitle-2 font-weight-bold">系统单实例弹性计算副本数 (Replica)</div>
                      <span class="text-subtitle-2 font-weight-bold text-primary">{{ settings.replicaCount }} 节点</span>
                    </div>
                    <p class="text-caption text-medium-emphasis mb-3">高并发下动态弹性扩缩容的目标最小常驻容器数量。</p>
                    <v-slider
                      v-model="settings.replicaCount"
                      :min="1"
                      :max="12"
                      :step="1"
                      show-ticks="always"
                      tick-size="4"
                      color="primary"
                      thumb-label
                    ></v-slider>
                  </v-card>
                </v-col>

                <!-- 活跃微服务功能控制 (v-list with subcomponents) -->
                <v-col cols="12">
                  <v-card class="pa-4 rounded-xl border bg-light-soft" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-2">活跃子系统与边缘路由网关控制 (Hot Swapping)</div>
                    <p class="text-caption text-medium-emphasis mb-4">无需停机重启即可热插拔各核心与辅助微服务组件的路由接入状态：</p>
                    
                    <v-list class="bg-transparent pa-0">
                      <v-list-item class="px-0">
                        <template #prepend>
                          <v-icon color="primary" class="mr-3">mdi-router-wireless</v-icon>
                        </template>
                        <v-list-item-title class="font-weight-bold text-body-2">API 核心路由网关系统 (Gateway)</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">控制所有客户端 API 请求的分发和静态限流阻断</v-list-item-subtitle>
                        <template #append>
                          <settings-switch v-model="settings.servicesActive.gateway" color="primary"></settings-switch>
                        </template>
                      </v-list-item>
                      <v-divider class="my-2"></v-divider>
                      <v-list-item class="px-0">
                        <template #prepend>
                          <v-icon color="warning" class="mr-3">mdi-gavel</v-icon>
                        </template>
                        <v-list-item-title class="font-weight-bold text-body-2">拍卖交易与即时竞价服务 (Auction Pod)</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">处理游戏内高级拍卖行挂载及实时经济竞拍撮合逻辑</v-list-item-subtitle>
                        <template #append>
                          <settings-switch v-model="settings.servicesActive.auction" color="primary"></settings-switch>
                        </template>
                      </v-list-item>
                      <v-divider class="my-2"></v-divider>
                      <v-list-item class="px-0">
                        <template #prepend>
                          <v-icon color="success" class="mr-3">mdi-storefront</v-icon>
                        </template>
                        <v-list-item-title class="font-weight-bold text-body-2">玩家联运自营跳蚤市场 (C2C Market)</v-list-item-title>
                        <v-list-item-subtitle class="text-caption">处理第三方或玩家间直连订单、物流查询与虚拟物品收货</v-list-item-subtitle>
                        <template #append>
                          <settings-switch v-model="settings.servicesActive.c2c" color="primary"></settings-switch>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- ----------------------------------------------------- -->
            <!-- 分类 5: 性能参数调优 -->
            <!-- ----------------------------------------------------- -->
            <div v-else-if="activeTab[0] === 'tuning'">
              <div class="text-h5 font-weight-bold text-slate-800 mb-2">微内核性能参数调优</div>
              <p class="text-body-2 text-medium-emphasis mb-6">调配网络最大并发量、数据封包压缩比以及动态分配核心内存池大小。</p>

              <v-row>
                <!-- 最大连接数设置 (v-text-field with type number) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">并发套接字连接配额</div>
                    <v-text-field
                      v-model.number="settings.maxConnections"
                      type="number"
                      label="最大 TCP 连接数 (客户端)"
                      placeholder="10000"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      :rules="[
                        v => !!v || '连接数不能为空',
                        v => v >= 100 || '最小连接数不能低于100',
                        v => v <= 100000 || '最大并发连接数不能超过 100,000'
                      ]"
                    ></v-text-field>
                    <div class="text-caption text-medium-emphasis mt-2">
                      增大连接数将成比例增加主板 RAM 占用空间。
                    </div>
                  </v-card>
                </v-col>

                <!-- 日志输出等级 (v-btn-toggle with colors) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">标准控制台日志输出过滤器</div>
                    <v-btn-toggle
                      v-model="settings.logLevel"
                      mandatory
                      selected-class="bg-accent text-white"
                      class="rounded-lg border w-100"
                      density="comfortable"
                    >
                      <v-btn class="flex-grow-1 font-weight-bold" value="debug" color="info">DEBUG</v-btn>
                      <v-btn class="flex-grow-1 font-weight-bold" value="info" color="success">INFO</v-btn>
                      <v-btn class="flex-grow-1 font-weight-bold" value="warn" color="warning">WARN</v-btn>
                      <v-btn class="flex-grow-1 font-weight-bold" value="error" color="error">ERROR</v-btn>
                    </v-btn-toggle>
                    <p class="text-caption text-medium-emphasis mt-3">建议在生产环境设置为 INFO 或 WARN 等级。</p>
                  </v-card>
                </v-col>

                <!-- Brotli/Gzip 数据压缩范围选择 (v-range-slider) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="d-flex justify-space-between align-center mb-1">
                      <div class="text-subtitle-2 font-weight-bold">API 数据报文动态压缩阈值</div>
                      <span class="text-subtitle-2 font-weight-bold text-primary">
                        {{ settings.compressionRange[0] }}KB - {{ settings.compressionRange[1] }}KB
                      </span>
                    </div>
                    <p class="text-caption text-medium-emphasis mb-4">仅在此区间大小的 JSON 数据体才启用 Gzip/Brotli 算法压缩传输。</p>
                    <v-range-slider
                      v-model="settings.compressionRange"
                      :min="1"
                      :max="1024"
                      :step="5"
                      color="primary"
                      thumb-label="always"
                    ></v-range-slider>
                  </v-card>
                </v-col>

                <!-- 内存池大小设置，带动态色彩指示 (v-slider with dynamic colors) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="d-flex justify-space-between align-center mb-1">
                      <div class="text-subtitle-2 font-weight-bold">运行内存缓冲池配额 (RAM Pool)</div>
                      <span class="text-subtitle-2 font-weight-bold" :style="{ color: getRamColor(settings.ramPoolSize) }">
                        {{ settings.ramPoolSize }} MB
                      </span>
                    </div>
                    <p class="text-caption text-medium-emphasis mb-4">预先为主线程分配的内存缓冲区大小，过高会导致宿主机内存溢出。</p>
                    <v-slider
                      v-model="settings.ramPoolSize"
                      :min="128"
                      :max="8192"
                      :step="128"
                      :color="getRamColor(settings.ramPoolSize)"
                      thumb-label
                    ></v-slider>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- ----------------------------------------------------- -->
            <!-- 分类 6: 界面个性定制 -->
            <!-- ----------------------------------------------------- -->
            <div v-else-if="activeTab[0] === 'ui_custom'">
              <div class="text-h5 font-weight-bold text-slate-800 mb-2">控制台界面是个性化定制</div>
              <p class="text-body-2 text-medium-emphasis mb-6">调整管理后台前台主题样式、定制主页横幅标题并选择提示声效。</p>

              <v-row>
                <!-- 控制台主题选择 (v-select) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">全局控制台基底风格</div>
                    <v-select
                      v-model="settings.uiTheme"
                      :items="[
                        { title: '轻量乳白官方默认', value: 'light' },
                        { title: '深邃暗夜程序员黑', value: 'dark' },
                        { title: '紫罗兰传奇专属 (Blackguard)', value: 'blackguard' },
                        { title: '极地晚樱粉润定制 (Midnight Sakura)', value: 'midnightSakura' }
                      ]"
                      label="当前主基底主题"
                      variant="outlined"
                      density="comfortable"
                      class="mb-3"
                    ></v-select>

                    <v-text-field
                      v-model="settings.bannerTitle"
                      label="登录页公告大横幅标题"
                      variant="outlined"
                      density="comfortable"
                      counter="35"
                      maxlength="35"
                      hide-details="auto"
                    ></v-text-field>
                  </v-card>
                </v-col>

                <!-- 声音开关 (v-switch) -->
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-2">全局人机交互物理声效</div>
                    <p class="text-caption text-medium-emphasis mb-4">当商城发生订单交易、库存告警时，控制台将在后台播放短音效唤醒操作人员。</p>
                    <settings-switch
                      v-model="settings.soundEnabled"
                      label="启用事件发生后的动态声音提示"
                    ></settings-switch>
                  </v-card>
                </v-col>

                <!-- 主题色颜色选择器 (v-color-picker) -->
                <v-col cols="12">
                  <v-card class="pa-4 rounded-xl border bg-light-soft" variant="flat">
                    <div class="text-subtitle-2 font-weight-bold mb-3">系统前台交互高亮主色板 (Custom Color Picker)</div>
                    <p class="text-caption text-medium-emphasis mb-4">调整全局链接、表单边框及主要按钮的基底高亮配色方案。</p>
                    <v-row class="ma-0">
                      <v-col cols="12" md="7" class="pa-0 d-flex justify-center justify-md-start">
                        <v-color-picker
                          v-model="settings.accentColor"
                          hide-canvas
                          show-swatches
                          class="rounded-xl border border-dashed w-100"
                          width="100%"
                          elevation="0"
                        ></v-color-picker>
                      </v-col>
                      <v-col cols="12" md="5" class="d-flex flex-column justify-center align-center">
                        <div class="text-caption text-medium-emphasis mb-2">颜色预览</div>
                        <v-avatar :color="settings.accentColor" size="70" class="elevation-2 border mb-2"></v-avatar>
                        <span class="text-body-2 font-weight-bold text-slate-800">{{ settings.accentColor }}</span>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-col>
      </v-row>
    </v-card>

    <!-- 悬浮保存按钮 (FAB) -->
    <div v-if="mdAndUp || showDetail" class="fab-container">
      <v-btn
        color="primary"
        prepend-icon="mdi-content-save"
        size="large"
        class="hover-scale border rounded-pill font-weight-bold px-6"
        variant="elevated"
        elevation="4"
        :loading="saving"
        @click="saveAllSettings"
      >
        保存所有设定
      </v-btn>
    </div>

    <!-- 保存成功通知气泡 -->
    <v-snackbar v-model="snackbar" color="success" location="bottom right" :timeout="3000" class="rounded-lg">
      <div class="d-flex align-center">
        <v-icon start class="mr-2">mdi-check-circle</v-icon>
        <span class="font-weight-bold">高级微服务设定保存成功！部分底层参数更改需重启集群网关。</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useDisplay } from 'vuetify'

  const { mdAndUp } = useDisplay()
  const showDetail = ref(false)

  // 状态变量
  const formValid = ref(false)
  const settingsForm = ref<any>(null)
  const activeTab = ref(['storage'])
  const saving = ref(false)
  const snackbar = ref(false)
  const showJson = ref(false)

  // 微服务系统全部默认设定模型
  const defaultSettings = () => ({
    // storage tab
    dbEngine: 'redis',
    cachePrefix: 'wxs_core:',
    retention: '30d',
    diskPersistence: true,
    backupFrequency: 'daily',
    dbDelay: 85,

    // security tab
    mfaEnabled: true,
    encryptionAlgo: 'AES-GCM-256 (超高安全级)',
    otpToken: '',
    sslCertFile: [] as File[],
    corsOrigins: ['https://shop.webshopx.com', 'https://admin.webshopx.com'],
    securityRating: 3,
    sshPublicKey: '',

    // webhook tab
    webhookUrl: 'https://api.webshopx.com/v1/callbacks',
    webhookEvents: ['order_paid', 'stock_low'],
    webhookRetryPolicy: 'exponential',
    notifyPlatforms: ['wechat_bot', 'discord'],
    webhookTimeout: 10,

    // cluster tab
    discoveryMode: 'k8s',
    healthCheckPath: '/healthz',
    replicaCount: 3,
    servicesActive: {
      gateway: true,
      auction: false,
      c2c: true
    },

    // tuning tab
    maxConnections: 12000,
    logLevel: 'info',
    compressionRange: [32, 512] as [number, number],
    ramPoolSize: 2048,

    // ui_custom tab
    uiTheme: 'light',
    bannerTitle: '欢迎访问 WebShopX 管理控制台',
    soundEnabled: true,
    accentColor: '#1867c0'
  })

  const settings = ref(defaultSettings())

  // 获取移动端设置分类顶栏文字
  function getTabTitle(tabValue: string) {
    const titles: Record<string, string> = {
      storage: '存储与数据库引擎',
      security: '安全与密钥鉴权',
      webhook: 'Webhook 回调事件',
      cluster: '微服务集群控制',
      tuning: '性能参数调优',
      ui_custom: '界面个性定制'
    }
    return titles[tabValue] ?? '偏好设定'
  }

  // 安全星级标签翻译
  function getSecurityLevelName(stars: number) {
    if (stars <= 1) return '宽松'
    if (stars <= 2) return '常规'
    if (stars <= 3) return '增强安全'
    if (stars <= 4) return '严苛审计'
    return '绝对保密'
  }

  // 内存池滑块颜色变化驱动
  function getRamColor(size: number) {
    if (size < 1024) return 'success'
    if (size < 4096) return 'primary'
    if (size < 6144) return 'warning'
    return 'error'
  }

  // 保存所有设定
  async function saveAllSettings() {
    if (settingsForm.value) {
      const { valid } = await settingsForm.value.validate()
      if (!valid) {
        activeTab.value = ['webhook'] // 默认如果有 URL 错误，定位到 Webhook 页
        showDetail.value = true
        return
      }
    }

    saving.value = true
    setTimeout(() => {
      saving.value = false
      snackbar.value = true
      // 成功保存后收起移动端详情面
      if (!mdAndUp.value) {
        showDetail.value = false
      }
    }, 1500)
  }

  // 重置设定
  function resetAllSettings() {
    settings.value = defaultSettings()
    if (settingsForm.value) {
      settingsForm.value.resetValidation()
    }
  }
</script>

<style scoped>
  /* 磨砂玻璃卡片 */
  .glass-card {
    background: rgba(var(--v-theme-surface), 0.6) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
  }

  /* 基础列表背景 */
  .bg-light-soft {
    background-color: rgba(var(--v-theme-on-surface), 0.02) !important;
  }

  .text-slate-800 {
    color: #1e293b;
  }
  .v-theme--dark .text-slate-800,
  .v-theme--blackguard .text-slate-800,
  .v-theme--midnightSakura .text-slate-800 {
    color: #f1f5f9;
  }

  /* 代码块预览配色 */
  .bg-code-view {
    background-color: rgba(var(--v-theme-on-surface), 0.05) !important;
    color: rgb(var(--v-theme-primary)) !important;
    max-height: 280px;
    overflow-y: auto;
  }
  
  .json-code {
    font-family: 'Consolas', 'Monaco', monospace !important;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .height-auto {
    height: auto !important;
  }

  .border-r {
    border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  }

  .border-b {
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  }

  .border-t {
    border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  }

  /* 悬浮 FAB 容器及动画 */
  .fab-container {
    position: fixed !important;
    bottom: 24px !important;
    right: 24px !important;
    z-index: 99 !important;
  }

  .hover-scale {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .hover-scale:hover {
    transform: scale(1.1) !important;
  }
</style>
