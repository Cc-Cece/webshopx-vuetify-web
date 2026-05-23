<template>
  <v-container fluid class="pa-6">
    <!-- 顶部导航标题 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="text-h4 font-weight-bold text-slate-800">
          多样式对话框展示
        </div>
        <div class="text-subtitle-1 text-medium-emphasis mt-1">
          对话框是提升应用交互沉浸感的绝佳元素。在此探索 4 种符合官方高对比平底规范的对话框布局。
        </div>
      </v-col>
    </v-row>

    <!-- 主展示网格 -->
    <v-row>
      <!-- 卡片 1: 模态表单对话框 -->
      <v-col cols="12" md="6" lg="3">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height hover-lift text-center d-flex flex-column justify-space-between">
          <div>
            <v-avatar color="rgba(24, 103, 192, 0.1)" size="64" class="mb-4 rounded-xl">
              <v-icon color="primary" size="32">mdi-bullhorn-outline</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text-slate-800 mb-2">新建营销活动</div>
            <p class="text-caption text-medium-emphasis mb-6">
              标准的居中模态框。常用于新增记录、配置细节等表单提交场景，支持校验与遮罩。
            </p>
          </div>
          <primary-btn
            block
            class="py-2 height-auto font-weight-bold"
            @click="formDialog = true"
          >
            开启模态表单
          </primary-btn>
        </v-card>
      </v-col>

      <!-- 卡片 2: 安全二次确认对话框 -->
      <v-col cols="12" md="6" lg="3">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height hover-lift text-center d-flex flex-column justify-space-between">
          <div>
            <v-avatar color="rgba(229, 115, 115, 0.1)" size="64" class="mb-4 rounded-xl">
              <v-icon color="error" size="32">mdi-shield-alert-outline</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text-slate-800 mb-2">高危操作二次确认</div>
            <p class="text-caption text-medium-emphasis mb-6">
              带安全阻断的警告框。包含安全声明勾选及输入指定验证码，确保关键操作万无一失。
            </p>
          </div>
          <v-btn
            color="error"
            variant="outlined"
            border
            block
            class="rounded-lg font-weight-bold py-2 height-auto text-none"
            @click="confirmDialog = true"
          >
            高危二次确认
          </v-btn>
        </v-card>
      </v-col>

      <!-- 卡片 3: 滑出式底部动作面板 -->
      <v-col cols="12" md="6" lg="3">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height hover-lift text-center d-flex flex-column justify-space-between">
          <div>
            <v-avatar color="rgba(92, 187, 246, 0.1)" size="64" class="mb-4 rounded-xl">
              <v-icon color="secondary" size="32">mdi-share-variant-outline</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text-slate-800 mb-2">底部动作面板</div>
            <p class="text-caption text-medium-emphasis mb-6">
              抽屉型移动端友好弹窗。从屏幕底部滑起，适合分享操作、列表操作或快速功能直达。
            </p>
          </div>
          <v-btn
            color="secondary"
            variant="outlined"
            border
            block
            class="rounded-lg font-weight-bold py-2 height-auto text-none"
            @click="bottomSheetDialog = true"
          >
            呼出底部面板
          </v-btn>
        </v-card>
      </v-col>

      <!-- 卡片 4: 全屏沉浸式配置面板 -->
      <v-col cols="12" md="6" lg="3">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height hover-lift text-center d-flex flex-column justify-space-between">
          <div>
            <v-avatar color="rgba(0, 92, 175, 0.1)" size="64" class="mb-4 rounded-xl">
              <v-icon color="accent" size="32">mdi-cog-box</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold text-slate-800 mb-2">全屏沉浸式设置</div>
            <p class="text-caption text-medium-emphasis mb-6">
              无干扰的大型设置视口。支持内部分栏导航，适用于深度复杂的偏好设定或大表单。
            </p>
          </div>
          <v-btn
            color="accent"
            variant="outlined"
            border
            block
            class="rounded-lg font-weight-bold py-2 height-auto text-none"
            @click="fullscreenDialog = true"
          >
            开启沉浸式设置
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- ----------------------------------------------------- -->
    <!-- 模态框 1：新建营销活动对话框 -->
    <!-- ----------------------------------------------------- -->
    <v-dialog v-model="formDialog" max-width="600" class="dialog-rounded">
      <v-card class="pa-4 rounded-xl border" elevation="0">
        <v-card-title class="d-flex align-center font-weight-bold border-b pb-4">
          <v-icon color="primary" class="mr-2">mdi-bullhorn-outline</v-icon>
          创建新品营销活动
        </v-card-title>

        <v-card-text class="pt-6">
          <v-form ref="campaignForm" v-model="campaignValid">
            <!-- 标题 -->
            <v-text-field
              v-model="campaign.name"
              label="活动主题名称"
              placeholder="例如: 618年中狂欢大促销"
              :rules="[(v) => !!v || '活动名称不能为空']"
              variant="outlined"
              required
            ></v-text-field>

            <v-row>
              <!-- 渠道分类 -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="campaign.channel"
                  :items="['全网大推', '新品尝鲜', '会员专享', '爆品秒杀']"
                  label="推广主线"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
              <!-- 预算滑块 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="campaign.budget"
                  type="number"
                  label="初始推广预算 (元)"
                  prefix="¥"
                  :rules="[(v) => !!v || '请输入预算', (v) => v >= 1000 || '预算不能低于1000元']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <div class="text-caption font-weight-bold text-medium-emphasis mb-2">目标覆盖用户画像</div>
            <v-chip-group
              v-model="campaign.targets"
              column
              multiple
              selected-class="text-primary font-weight-bold"
            >
              <!-- 升级为定制别名 Chip -->
              <border-chip value="youth">青年一代 (18-28)</border-chip>
              <border-chip value="tech">数码发烧友</border-chip>
              <border-chip value="home">白领白金客</border-chip>
              <border-chip value="elder">银发网购族</border-chip>
            </v-chip-group>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="secondary" class="font-weight-bold" @click="formDialog = false">
            取消
          </v-btn>
          <primary-btn
            :disabled="!campaignValid"
            :loading="campaignLoading"
            class="px-6 font-weight-bold"
            @click="submitCampaign"
          >
            确认创建
          </primary-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ----------------------------------------------------- -->
    <!-- 模态框 2：高危二次确认警告框 -->
    <!-- ----------------------------------------------------- -->
    <v-dialog v-model="confirmDialog" max-width="460" persistent>
      <v-card class="rounded-xl border border-t-error" elevation="0">
        <v-card-text class="pa-6 text-center">
          <v-icon color="error" size="64" class="mb-4 animate-shake">mdi-alert-octagon-outline</v-icon>
          <h3 class="text-h5 font-weight-bold text-error mb-2">停用系统全局分销通道？</h3>
          <p class="text-body-2 text-medium-emphasis mb-6">
            此操作属于<strong>高危系统指令</strong>。停用后，当前处于联运阶段的第三方平台API将自动断开，预估造成 ￥12,500/小时 的交易额损耗。
          </p>

          <!-- 勾选确认 -->
          <v-checkbox
            v-model="confirmChecked"
            color="error"
            label="我已充分阅读并知晓带来的业务损耗"
            class="text-left font-weight-bold text-caption"
            hide-details
          ></v-checkbox>

          <!-- 验证码确认 -->
          <v-text-field
            v-model="confirmTextInput"
            label="请输入 'CONFIRM' 验证解锁"
            placeholder="CONFIRM"
            variant="outlined"
            density="comfortable"
            class="mt-4"
            hide-details
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-light-soft justify-space-between">
          <v-btn variant="text" color="secondary" class="font-weight-bold" @click="cancelConfirm">
            安全退出
          </v-btn>
          <v-btn
            :disabled="!canConfirmSubmit"
            color="error"
            variant="flat"
            class="rounded-lg px-6 font-weight-bold"
            @click="submitConfirmAction"
          >
            强制下线分销
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ----------------------------------------------------- -->
    <!-- 模态框 3：滑出式底部动作面板 -->
    <!-- ----------------------------------------------------- -->
    <v-dialog
      v-model="bottomSheetDialog"
      location="bottom"
      transition="dialog-bottom-transition"
      class="bottom-sheet-dialog"
    >
      <v-card class="rounded-t-xl pa-4 w-100 mx-auto border-t" elevation="0" max-width="640">
        <div class="bottom-sheet-bar mx-auto mb-4"></div>
        <div class="text-h6 font-weight-bold text-center mb-6 text-slate-800">
          将此大屏报表一键分享至
        </div>

        <v-row justify="center" class="mb-4">
          <v-col v-for="(social, i) in socials" :key="i" cols="3" class="text-center">
            <v-avatar :color="social.color" size="52" class="cursor-pointer hover-scale mb-2 text-white">
              <v-icon size="26">{{ social.icon }}</v-icon>
            </v-avatar>
            <div class="text-caption font-weight-bold text-slate-800">{{ social.name }}</div>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>
        <v-btn variant="outlined" border color="secondary" block class="rounded-lg font-weight-bold py-2 height-auto text-none" @click="bottomSheetDialog = false">
          取消分享
        </v-btn>
      </v-card>
    </v-dialog>

    <!-- ----------------------------------------------------- -->
    <!-- 模态框 4：全屏沉浸式配置面板 -->
    <!-- ----------------------------------------------------- -->
    <v-dialog v-model="fullscreenDialog" fullscreen transition="dialog-bottom-transition">
      <v-card class="d-flex flex-column h-100 elevation-0">
        <!-- 头部工具栏 -->
        <v-toolbar color="primary" flat dark class="px-4 border-b">
          <!-- 移动端处于详情态时显示“左箭头”返回列表，否则显示“关闭”按钮 -->
          <v-btn icon color="white" @click="(xs && showDetail) ? showDetail = false : fullscreenDialog = false">
            <v-icon>{{ (xs && showDetail) ? 'mdi-arrow-left' : 'mdi-close' }}</v-icon>
          </v-btn>
          <v-toolbar-title class="font-weight-bold text-white">
            {{ (xs && showDetail) ? getTabTitle(settingsTab[0]) : '全系统微服务高阶偏好设定' }}
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <!-- 移动端且在详情态下，或者非移动端时显示保存按钮 -->
          <primary-btn v-slot:default v-if="!xs || showDetail" color="white" class="font-weight-bold px-6" @click="saveFullscreenSettings">
            保存全部设置
          </primary-btn>
        </v-toolbar>

        <!-- 主内容区：分栏 -->
        <v-row class="ma-0 flex-grow-1 overflow-hidden" :class="xs ? '' : 'flex-nowrap'">
          <!-- 左侧选项列表：非移动端，或者在移动端但处于列表态展示 -->
          <v-col v-if="!xs || !showDetail" cols="12" md="3" class="border-r pa-0 bg-light-soft overflow-y-auto h-100">
            <v-list v-model:selected="settingsTab" mandatory color="primary" class="bg-transparent py-4">
              <v-list-item
                value="basic"
                prepend-icon="mdi-database-outline"
                title="存储与数据库引擎"
                class="py-3 font-weight-bold"
                @click="showDetail = true"
              ></v-list-item>
              <v-list-item
                value="security"
                prepend-icon="mdi-shield-key-outline"
                title="高阶API鉴权与限流"
                class="py-3 font-weight-bold"
                @click="showDetail = true"
              ></v-list-item>
              <v-list-item
                value="webhook"
                prepend-icon="mdi-webhook"
                title="Webhook 全局回调事件"
                class="py-3 font-weight-bold"
                @click="showDetail = true"
              ></v-list-item>
            </v-list>
          </v-col>

          <!-- 右侧配置窗口：非移动端，或者在移动端且处于详情态展示 -->
          <v-col v-if="!xs || showDetail" cols="12" md="9" class="pa-8 overflow-y-auto bg-white h-100">
            <div v-if="settingsTab[0] === 'basic'">
              <div class="text-h5 font-weight-bold text-slate-800 mb-2">存储与数据库引擎</div>
              <p class="text-body-2 text-medium-emphasis mb-6">配置底层缓存驱动、高负载冷热读写分离引擎的相关性能指数。</p>
              
              <v-row>
                <v-col cols="12" sm="6">
                  <v-radio-group v-model="settings.dbEngine" label="默认高性能缓存后端">
                    <v-radio label="Redis 极速内存集群" value="redis" color="primary"></v-radio>
                    <v-radio label="Memcached 轻量级缓存" value="memcached" color="primary"></v-radio>
                    <v-radio label="PostgreSQL 内存冷态分表" value="postgres" color="primary"></v-radio>
                  </v-radio-group>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="text-caption font-weight-bold text-medium-emphasis mb-2">读写延迟自适应阈值 (毫秒)</div>
                  <v-slider v-model="settings.dbDelay" :min="10" :max="200" step="5" thumb-label color="primary"></v-slider>
                  <div class="text-body-2 font-weight-bold text-primary">设定值: {{ settings.dbDelay }} ms</div>
                </v-col>
              </v-row>
            </div>

            <div v-else-if="settingsTab[0] === 'security'">
              <div class="text-h5 font-weight-bold text-slate-800 mb-2">高阶API鉴权与限流</div>
              <p class="text-body-2 text-medium-emphasis mb-6">设定防爬虫暴力扫描阈值与加密算法级别。</p>

              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="settings.encryption"
                    :items="['HMAC-SHA256 (安全级)', 'AES-GCM-256 (超强安全级)', 'RSA-OAEP-4096 (极致国防级)']"
                    label="传输加密对称套件"
                    variant="outlined"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <!-- 使用定制别名开关 SettingsSwitch -->
                  <settings-switch v-model="settings.ipBan" label="开启防刷单 IP 自封锁" color="error"></settings-switch>
                  <settings-switch v-model="settings.mfa" label="强控制面板登录双因子 MFA 验证"></settings-switch>
                </v-col>
              </v-row>
            </div>

            <div v-else-if="settingsTab[0] === 'webhook'">
              <div class="text-h5 font-weight-bold text-slate-800 mb-2">Webhook 全局回调事件</div>
              <p class="text-body-2 text-medium-emphasis mb-6">当商城发生支付、退款或商品下架事件时，自动推送 JSON 报文到指定 API 地址。</p>

              <v-text-field
                v-model="settings.webhookUrl"
                label="Webhook 终结点 URL"
                placeholder="https://api.yourdomain.com/callbacks"
                variant="outlined"
                prepend-inner-icon="mdi-link-variant"
              ></v-text-field>

              <div class="text-caption font-weight-bold text-medium-emphasis mb-2">触发监听动作事件</div>
              <v-row class="ma-0">
                <v-checkbox v-model="settings.webhookEvents" label="order.created (创建订单)" value="order_created" density="compact" hide-details class="mr-4"></v-checkbox>
                <v-checkbox v-model="settings.webhookEvents" label="order.paid (支付订单)" value="order_paid" density="compact" hide-details class="mr-4"></v-checkbox>
                <v-checkbox v-model="settings.webhookEvents" label="product.stock_out (库存告警)" value="stock_out" density="compact" hide-details></v-checkbox>
              </v-row>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>

    <!-- 通知提示 -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" location="bottom right" :timeout="3000">
      <div class="d-flex align-center">
        <v-icon start class="mr-2">{{ snackbarIcon }}</v-icon>
        <span class="font-weight-bold">{{ snackbarText }}</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { useDisplay } from 'vuetify'

  const { xs } = useDisplay()
  const showDetail = ref(false)

  // 全局气泡提示
  const snackbar = ref(false)
  const snackbarColor = ref('success')
  const snackbarIcon = ref('mdi-check-circle')
  const snackbarText = ref('')

  function showMessage(text: string, color = 'success', icon = 'mdi-check-circle') {
    snackbarText.value = text
    snackbarColor.value = color
    snackbarIcon.value = icon
    snackbar.value = true
  }

  // -----------------------------------------------------
  // 1: 模态表单对话框状态与模型
  // -----------------------------------------------------
  const formDialog = ref(false)
  const campaignValid = ref(false)
  const campaignLoading = ref(false)
  const campaign = ref({
    name: '',
    channel: '全网大推',
    budget: 5000,
    targets: ['youth', 'tech'],
  })

  function submitCampaign() {
    campaignLoading.value = true
    setTimeout(() => {
      campaignLoading.value = false
      formDialog.value = false
      showMessage(`营销活动 '${campaign.value.name}' 创建成功！预算：¥${campaign.value.budget}`)
      // 重置
      campaign.value = { name: '', channel: '全网大推', budget: 5000, targets: ['youth', 'tech'] }
    }, 1500)
  }

  // -----------------------------------------------------
  // 2: 高危确认状态与模型
  // -----------------------------------------------------
  const confirmDialog = ref(false)
  const confirmChecked = ref(false)
  const confirmTextInput = ref('')

  const canConfirmSubmit = computed(() => {
    return confirmChecked.value && confirmTextInput.value === 'CONFIRM'
  })

  function cancelConfirm() {
    confirmDialog.value = false
    confirmChecked.value = false
    confirmTextInput.value = ''
  }

  function submitConfirmAction() {
    confirmDialog.value = false
    confirmChecked.value = false
    confirmTextInput.value = ''
    showMessage('高危动作已授权！全局分销通道已彻底停用！', 'error', 'mdi-alert-decagram')
  }

  // -----------------------------------------------------
  // 3: 底部动作面板状态与模型
  // -----------------------------------------------------
  const bottomSheetDialog = ref(false)
  const socials = [
    { name: '微信好友', icon: 'mdi-wechat', color: '#07C160' },
    { name: '新浪微博', icon: 'mdi-sina-weibo', color: '#F52C2C' },
    { name: '企业微信', icon: 'mdi-cellphone-link', color: '#1B72EC' },
    { name: '邮件发送', icon: 'mdi-email-outline', color: '#E04B26' },
  ]

  // -----------------------------------------------------
  // 4: 全屏设置状态与模型
  // -----------------------------------------------------
  const fullscreenDialog = ref(false)
  const settingsTab = ref(['basic'])
  const settings = ref({
    dbEngine: 'redis',
    dbDelay: 50,
    encryption: 'AES-GCM-256 (超强安全级)',
    ipBan: true,
    mfa: false,
    webhookUrl: '',
    webhookEvents: ['order_paid', 'stock_out'],
  })

  // 当弹窗开启时，移动端默认复位到只展示左侧列表
  watch(fullscreenDialog, (newVal) => {
    if (newVal) {
      showDetail.value = false
    }
  })

  // 获取配置菜单项对应的移动端顶栏标题
  function getTabTitle(tabValue: string) {
    if (tabValue === 'basic') return '存储与数据库引擎'
    if (tabValue === 'security') return '高阶API鉴权与限流'
    if (tabValue === 'webhook') return 'Webhook 全局回调事件'
    return ''
  }

  function saveFullscreenSettings() {
    fullscreenDialog.value = false
    showMessage('底层微服务高级设定保存成功！部分指令需要重启微内核。')
  }
</script>

<style scoped>
  /* 磨砂玻璃卡片 */
  .glass-card {
    background: rgba(255, 255, 255, 0.6) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
  }

  .v-theme--dark .glass-card,
  .v-theme--blackguard .glass-card {
    background: rgba(30, 30, 30, 0.4) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
  }

  .border-t-error {
    border-top: 4px solid #ef4444 !important;
  }

  /* 底部面板把手样式 */
  .bottom-sheet-bar {
    width: 40px;
    height: 4px;
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 2px;
  }
  .v-theme--dark .bottom-sheet-bar,
  .v-theme--blackguard .bottom-sheet-bar {
    background-color: rgba(255, 255, 255, 0.15);
  }

  /* 二次确认抖动动画 */
  .animate-shake {
    animation: shake 1.5s infinite;
  }

  @keyframes shake {
    0%, 100% { transform: rotate(0deg); }
    10%, 30%, 50%, 70%, 90% { transform: rotate(-5deg); }
    20%, 40%, 60%, 80% { transform: rotate(5deg); }
  }

  .bg-light-soft {
    background-color: rgba(0, 0, 0, 0.02) !important;
  }
  .v-theme--dark .bg-light-soft,
  .v-theme--blackguard .bg-light-soft {
    background-color: rgba(255, 255, 255, 0.02) !important;
  }

  .text-slate-800 {
    color: #1e293b;
  }
  .v-theme--dark .text-slate-800,
  .v-theme--blackguard .text-slate-800 {
    color: #f1f5f9;
  }

  .height-auto {
    height: auto !important;
  }

  .bottom-sheet-dialog :deep(.v-overlay__content) {
    align-self: flex-end;
    margin: 0;
    width: 100%;
  }
</style>
