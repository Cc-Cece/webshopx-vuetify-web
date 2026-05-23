<template>
  <v-container fluid class="pa-6" style="max-width: 1400px; min-height: 100vh;">
    <!-- 顶部标题与动作控制栏 (高奢 Glassmorphism) -->
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="12" md="8" class="d-flex align-center">
        <v-avatar color="primary" class="mr-3 hover-scale text-white" size="48">
          <v-icon size="26">mdi-bell-outline</v-icon>
        </v-avatar>
        <div class="text-h4 font-weight-black bg-gradient-text leading-tight">
          {{ $t('app.uiText.page.notificationsTitle') }}
        </div>
      </v-col>
      <v-col cols="12" md="4" class="text-md-right d-flex flex-wrap align-center justify-md-end gap-2">
        <!-- 一键标记已读 -->
        <v-btn
          v-if="isLoggedIn && unreadCount > 0"
          prepend-icon="mdi-check-all"
          variant="tonal"
          color="primary"
          class="rounded-lg text-caption font-weight-bold px-4 h-40"
          @click="markAllRead"
        >
          {{ $t('app.uiText.page.notificationsMarkAllBtn') }}
        </v-btn>

        <!-- 刷新消息 -->
        <v-btn
          prepend-icon="mdi-refresh"
          variant="outlined"
          color="primary"
          border
          class="rounded-lg text-caption font-weight-bold px-4 h-40"
          :loading="isLoading"
          @click="fetchNotificationsData"
        >
          {{ $t('app.uiText.page.notificationsRefreshBtn') }}
        </v-btn>

        <!-- 返回首页个人中心 -->
        <v-btn
          prepend-icon="mdi-account-circle-outline"
          variant="flat"
          color="success"
          class="rounded-lg text-caption font-weight-bold px-4 h-40"
          to="/account"
        >
          {{ $t('help.uiText.page.homeBtn') || '返回账户' }}
        </v-btn>
      </v-col>
    </v-row>

    <!-- 过滤器与搜索卡片 -->
    <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 mb-6 glass-card shadow-sm">
      <v-row align="center">
        <!-- 模糊搜索 -->
        <v-col cols="12" md="4" class="py-2">
          <v-text-field
            v-model="searchQuery"
            :placeholder="t('help.uiText.page.searchPlaceholder') || '检索消息标题或正文...'"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            variant="outlined"
            density="comfortable"
            class="rounded-lg"
            color="primary"
          ></v-text-field>
        </v-col>

        <!-- 已读状态快速芯片 -->
        <v-col cols="12" md="3" class="py-2">
          <div class="d-flex align-center">
            <span class="text-caption font-weight-black text-medium-emphasis mr-3 text-uppercase">状态:</span>
            <v-chip-group
              v-model="filterStatus"
              mandatory
              selected-class="text-primary font-weight-bold bg-primary-lighten-5"
            >
              <v-chip value="ALL" filter variant="tonal" size="small" class="px-3">全部</v-chip>
              <v-chip value="UNREAD" filter variant="tonal" size="small" class="px-3" color="error">未读</v-chip>
              <v-chip value="READ" filter variant="tonal" size="small" class="px-3" color="success">已读</v-chip>
            </v-chip-group>
          </div>
        </v-col>

        <!-- 消息类型多芯片选择 -->
        <v-col cols="12" md="5" class="py-2">
          <div class="d-flex align-center flex-wrap">
            <span class="text-caption font-weight-black text-medium-emphasis mr-3 text-uppercase">分类:</span>
            <v-chip-group
              v-model="filterType"
              mandatory
              selected-class="bg-primary text-white"
            >
              <v-chip
                v-for="cat in filterCategories"
                :key="cat.value"
                :value="cat.value"
                filter
                variant="tonal"
                size="small"
                class="px-3 font-weight-bold"
              >
                {{ cat.label }}
              </v-chip>
            </v-chip-group>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- 消息管理大表格卡片 -->
    <v-card elevation="0" variant="outlined" class="rounded-xl glass-card overflow-hidden">
      <!-- 未登录状态拦截 -->
      <div v-if="!isLoggedIn" class="text-center py-16 px-4">
        <v-icon size="64" color="medium-emphasis" class="mb-4">mdi-lock-outline</v-icon>
        <h3 class="text-h6 font-weight-bold text-slate-800 mb-2">请先登录后再查看通知</h3>
        <p class="text-body-2 text-medium-emphasis mb-6">您必须登录 Minecraft 绑定账号，才能跟踪市场订单与系统消息。</p>
        <v-btn color="primary" rounded="lg" size="large" class="font-weight-bold" prepend-icon="mdi-login" to="/account">
          立即前往登录
        </v-btn>
      </div>

      <!-- 空状态 -->
      <v-empty-state
        v-else-if="filteredNotifications.length === 0"
        icon="mdi-bell-off-outline"
        :title="$t('app.uiText.initMeta.notificationsView')"
        :text="searchQuery ? '未找到符合模糊搜索与芯片筛选的消息条目，请更换关键词重试。' : $t('app.uiText.page.notificationsDesc')"
        class="py-16"
      ></v-empty-state>

      <!-- 数据表格 -->
      <v-table v-else class="bg-transparent text-slate-800">
        <thead>
          <tr class="bg-table-header">
            <th class="width-50"></th> <!-- 展开行控制 -->
            <th class="font-weight-bold text-subtitle-2 width-100">状态</th>
            <th class="font-weight-bold text-subtitle-2 width-150">消息类别</th>
            <th class="font-weight-bold text-subtitle-2">消息标题</th>
            <th class="font-weight-bold text-subtitle-2 width-180">接收时间</th>
            <th class="font-weight-bold text-subtitle-2 text-center width-120">操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="notif in filteredNotifications" :key="notif.id">
            <!-- 数据展示行 -->
            <tr
              class="hover-bg-row align-center"
              :class="{ 'row-active': isRowExpanded(notif.id) }"
            >
              <td>
                <v-btn
                  variant="text"
                  icon
                  density="comfortable"
                  :color="isRowExpanded(notif.id) ? 'primary' : 'secondary'"
                  @click="handleToggleRow(notif)"
                >
                  <v-icon>{{ isRowExpanded(notif.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                </v-btn>
              </td>
              <td>
                <v-chip
                  v-if="!(notif.isRead || notif.read)"
                  color="error"
                  size="x-small"
                  variant="flat"
                  class="font-weight-black animate-pulse"
                >
                  NEW
                </v-chip>
                <v-chip
                  v-else
                  color="default"
                  size="x-small"
                  variant="tonal"
                  class="font-weight-medium opacity-60"
                >
                  已读
                </v-chip>
              </td>
              <td>
                <v-chip
                  :color="getNotifMeta(notif.type).color"
                  size="small"
                  variant="tonal"
                  class="font-weight-bold px-3"
                >
                  <v-icon start size="14" class="mr-1">{{ getNotifMeta(notif.type).icon }}</v-icon>
                  {{ getNotifTypeLabel(notif.type) }}
                </v-chip>
              </td>
              <td>
                <span
                  class="text-body-2 text-truncate d-block"
                  style="max-width: 500px;"
                  :class="(notif.isRead || notif.read) ? 'text-medium-emphasis font-weight-regular' : 'font-weight-bold text-slate-900'"
                >
                  {{ notif.title }}
                </span>
              </td>
              <td class="text-caption text-medium-emphasis">
                {{ notif.time ?? notif.createdAt ?? '' }}
              </td>
              <td class="text-center">
                <!-- 标记已读动作 -->
                <v-tooltip
                  v-if="!(notif.isRead || notif.read)"
                  :text="t('app.uiText.templates.operationFailed', { message: '标记为已读' }) || '标记已读'"
                  location="top"
                >
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="text"
                      icon="mdi-check"
                      color="success"
                      density="comfortable"
                      class="mr-1"
                      @click="markSingleRead(notif.id)"
                    ></v-btn>
                  </template>
                </v-tooltip>
                <v-btn
                  v-else
                  disabled
                  variant="text"
                  icon="mdi-check"
                  density="comfortable"
                  class="mr-1 opacity-20"
                ></v-btn>

                <!-- 删除消息动作 -->
                <v-btn
                  variant="text"
                  icon="mdi-trash-can-outline"
                  color="error"
                  density="comfortable"
                  @click="openDeleteConfirm(notif)"
                ></v-btn>
              </td>
            </tr>

            <!-- 展开行详情内容 (Wow Effect) -->
            <tr v-if="isRowExpanded(notif.id)" class="expanded-row-bg">
              <td colspan="6" class="pa-5">
                <v-card variant="flat" class="bg-white-pure rounded-xl pa-5 border shadow-sm">
                  <v-row>
                    <!-- 左侧/上半部分：消息正文详情 (支持 Markdown 编译) -->
                    <v-col cols="12" :md="['ORDER', 'DELIVER'].includes(notif.type) ? 7 : 12" class="border-r-md">
                      <div class="text-subtitle-2 font-weight-black mb-3 d-flex align-center text-primary">
                        <v-icon color="primary" class="mr-1" size="18">mdi-text-box-outline</v-icon>
                        消息通知内容体
                      </div>
                      
                      <div class="px-2">
                        <!-- 若是 SYSTEM 类型，支持富文本 markdown -->
                        <div
                          v-if="notif.type === 'SYSTEM' || notif.content?.includes('#') || notif.content?.includes('*')"
                          class="help-markdown-viewer text-body-2 text-slate-800 leading-relaxed overflow-x-auto"
                          v-html="compileMarkdown(notif.content || notif.title)"
                        ></div>
                        <!-- 普通格式消息 -->
                        <p v-else class="text-body-2 text-slate-800 leading-relaxed font-weight-medium" style="white-space: pre-wrap;">
                          {{ notif.content || notif.title }}
                        </p>
                      </div>
                      
                      <!-- 底部快捷动作 -->
                      <div class="mt-6 d-flex align-center gap-2">
                        <v-btn
                          size="small"
                          variant="tonal"
                          color="secondary"
                          class="font-weight-bold text-none rounded-lg"
                          prepend-icon="mdi-content-copy"
                          @click="copyNotifContent(notif)"
                        >
                          复制正文
                        </v-btn>
                        <v-btn
                          v-if="!(notif.isRead || notif.read)"
                          size="small"
                          variant="flat"
                          color="success"
                          class="font-weight-bold text-none rounded-lg"
                          prepend-icon="mdi-check-circle-outline"
                          @click="markSingleRead(notif.id)"
                        >
                          标为已读
                        </v-btn>
                      </div>
                    </v-col>

                    <!-- 右侧/下半部分：物流步骤与交易阶段渲染 (对于交易/收发货物类通知) -->
                    <v-col
                      v-if="['ORDER', 'DELIVER'].includes(notif.type)"
                      cols="12"
                      md="5"
                      class="pl-md-6"
                    >
                      <div class="text-subtitle-2 font-weight-black mb-4 d-flex align-center text-success">
                        <v-icon color="success" class="mr-1" size="18">mdi-timeline-text-outline</v-icon>
                        订单派发与接收追踪
                      </div>

                      <!-- 订单基本信息 -->
                      <div class="mb-3 text-caption">
                        <span class="font-weight-bold text-medium-emphasis">系统发货渠道：</span>
                        <v-chip size="x-small" color="success" class="font-weight-bold">WebShopX B2C Dispatcher</v-chip>
                      </div>
                      <div class="mb-3 text-caption">
                        <span class="font-weight-bold text-medium-emphasis">目标领入角色：</span>
                        <span class="text-slate-800 font-weight-bold">{{ currentUser?.username }}</span>
                      </div>
                      <div class="mb-4 text-caption d-flex align-center">
                        <span class="font-weight-bold text-medium-emphasis">游戏同步单号：</span>
                        <v-chip size="x-small" variant="outlined" color="primary" class="font-mono font-weight-bold">
                          WSX-ID-{{ notif.id }}{{ Math.floor(Math.random() * 9000 + 1000) }}
                        </v-chip>
                      </div>

                      <!-- 精致派送步骤示意图 -->
                      <div class="pa-4 bg-light-soft rounded-xl border border-dashed border-success-lighten-2 position-relative overflow-hidden">
                        <h5 class="text-caption font-weight-bold text-success mb-3 d-flex align-center">
                          <v-icon size="14" class="mr-1">mdi-truck-check</v-icon>
                          发货流转阶段监控 (模拟数据)
                        </h5>
                        
                        <v-timeline density="compact" side="end" class="custom-timeline">
                          <v-timeline-item dot-color="success" size="small" fill-dot>
                            <template #opposite></template>
                            <div>
                              <div class="text-caption font-weight-bold text-slate-800">网页商城支付已确认</div>
                              <span class="text-caption text-muted">扣除网页钱包余额并生成同步项</span>
                            </div>
                          </v-timeline-item>
                          
                          <v-timeline-item dot-color="success" size="small" fill-dot>
                            <div>
                              <div class="text-caption font-weight-bold text-slate-800">游戏内同步队列入账</div>
                              <span class="text-caption text-muted">Vault/Command 任务准备就绪</span>
                            </div>
                          </v-timeline-item>
                          
                          <v-timeline-item :dot-color="notif.type === 'DELIVER' ? 'warning' : 'success'" size="small" fill-dot>
                            <div>
                              <div class="text-caption font-weight-bold text-slate-800">
                                {{ notif.type === 'DELIVER' ? '游戏内待领取 (信箱暂挂)' : '控制台命令指令已自动下发' }}
                              </div>
                              <span class="text-caption text-muted">
                                {{ notif.type === 'DELIVER' ? '玩家需进入游戏并执行 /ws claim 领取' : '服务器后台核心已自动处理并分发' }}
                              </span>
                            </div>
                          </v-timeline-item>
                        </v-timeline>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>

      <!-- 简易分页栏 -->
      <v-divider></v-divider>
      <div class="pa-4 d-flex align-center justify-space-between flex-wrap bg-surface-variant-opacity-5">
        <span class="text-caption text-medium-emphasis">
          当前显示 1-{{ filteredNotifications.length }} 条记录，共 {{ isLoggedIn ? notificationsList.length : 0 }} 条通知数据
        </span>
        <div class="d-flex align-center">
          <v-btn disabled variant="text" icon="mdi-chevron-left" density="comfortable" class="mr-2"></v-btn>
          <v-btn color="primary" variant="flat" size="small" class="rounded font-weight-bold min-width-32 mr-2">1</v-btn>
          <v-btn disabled variant="text" icon="mdi-chevron-right" density="comfortable"></v-btn>
        </div>
      </div>
    </v-card>

    <!-- ----------------------------------------------------- -->
    <!-- 模态框：单条消息删除警示框 -->
    <!-- ----------------------------------------------------- -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="rounded-xl border" elevation="0">
        <v-card-text class="pa-6 text-center">
          <v-avatar color="error-lighten-5" class="mb-4" size="64">
            <v-icon color="error" size="32">mdi-alert-octagon-outline</v-icon>
          </v-avatar>
          <h3 class="text-h6 font-weight-black mb-2 text-slate-800">永久物理删除此通知</h3>
          <p class="text-caption text-medium-emphasis">
            您确认要在前端快照中 <strong>永久移除</strong> 该通知吗？此操作属于本地模拟删除，删除后将隐藏该通知。
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-light-soft justify-space-between">
          <v-btn variant="text" color="secondary" class="font-weight-bold text-none rounded-lg" @click="deleteDialog = false">
            安全取消
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            border
            class="rounded-lg px-6 font-weight-bold text-none"
            @click="handleDelete"
          >
            确定物理删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SnackBar 通知气泡 -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      rounded="lg"
      elevation="4"
    >
      <div class="d-flex align-center font-weight-bold">
        <v-icon class="mr-2" size="20">
          {{ snackbarColor === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline' }}
        </v-icon>
        <span>{{ snackbarText }}</span>
      </div>
      <template #actions>
        <v-btn variant="text" icon="mdi-close" @click="snackbar = false"></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import {
  isLoggedIn,
  currentUser,
  unreadCount,
  notificationsList,
  refreshNotifications,
  markNotificationsRead,
  refreshUnreadCount
} from '@/api/authStore'

const { t } = useI18n()

// Page state
const isLoading = ref(false)
const searchQuery = ref('')
const filterStatus = ref<'ALL' | 'UNREAD' | 'READ'>('ALL')
const filterType = ref('ALL')

// Expanded rows
const expandedRows = ref<number[]>([])

// Modals
const deleteDialog = ref(false)
const notifToDelete = ref<any>(null)

// Toast snackbar
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const showSnackbar = (msg: string, color = 'success') => {
  snackbarText.value = msg
  snackbarColor.value = color
  snackbar.value = true
}

// Fetch notifications data
const fetchNotificationsData = async () => {
  if (!isLoggedIn.value) return
  isLoading.value = true
  try {
    await refreshNotifications()
    await refreshUnreadCount()
  } catch (err: any) {
    showSnackbar(t('app.uiText.templates.notificationsLoadFailed', { message: err.message || 'error' }), 'error')
  } finally {
    isLoading.value = false
  }
}

// Render dynamic type chips
const filterCategories = computed(() => [
  { value: 'ALL', label: t('autoPhrase.k0019') || '全部' },
  { value: 'SYSTEM', label: t('app.uiText.notificationTypeLabels.SYSTEM_ANNOUNCEMENT') || '系统公告' },
  { value: 'MARKET', label: t('app.uiText.notificationTypeLabels.MARKET_TRADE') || '市场交易' },
  { value: 'AUCTION', label: t('app.uiText.notificationTypeLabels.AUCTION_SETTLEMENT') || '拍卖结算' },
  { value: 'DELIVER', label: t('app.uiText.notificationTypeLabels.DELIVERY_WAIT_CLAIM') || '发货提醒' }
])

// Get style mappings
const getNotifMeta = (type?: string) => {
  const map: Record<string, { icon: string; color: string }> = {
    ORDER:   { icon: 'mdi-cart-check',           color: 'success' },
    MARKET:  { icon: 'mdi-storefront-outline',   color: 'primary' },
    AUCTION: { icon: 'mdi-gavel',                color: 'deep-purple' },
    SYSTEM:  { icon: 'mdi-bell-ring-outline',    color: 'warning' },
    ADMIN:   { icon: 'mdi-shield-account-outline', color: 'error' },
    DELIVER: { icon: 'mdi-package-variant-closed', color: 'teal' }
  }
  return map[type ?? ''] ?? { icon: 'mdi-bell-outline', color: 'info' }
}

const getNotifTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    SYSTEM: t('app.uiText.notificationTypeLabels.SYSTEM_ANNOUNCEMENT') || '系统公告',
    ORDER: t('app.uiText.notificationTypeLabels.GENERAL') || '订单消息',
    MARKET: t('app.uiText.notificationTypeLabels.MARKET_TRADE') || '市场交易',
    AUCTION: t('app.uiText.notificationTypeLabels.AUCTION_SETTLEMENT') || '拍卖交易',
    DELIVER: t('app.uiText.notificationTypeLabels.DELIVERY_WAIT_CLAIM') || '待发货'
  }
  return map[type ?? ''] ?? t('app.uiText.notificationTypeLabels.GENERAL') ?? '通知'
}

// Global Actions
const markAllRead = async () => {
  try {
    isLoading.value = true
    await markNotificationsRead()
    showSnackbar(t('autoPhrase.p0279') || '已成功全部标记为已读！', 'success')
  } catch (err: any) {
    showSnackbar(t('app.uiText.templates.markAllReadFailed', { message: err.message || 'error' }), 'error')
  } finally {
    isLoading.value = false
  }
}

const markSingleRead = async (id: number) => {
  try {
    await markNotificationsRead([id])
    showSnackbar('标记成功！', 'success')
  } catch (err: any) {
    showSnackbar(t('app.uiText.templates.markReadFailed', { message: err.message || 'error' }), 'error')
  }
}

// Row management
const isRowExpanded = (id: number) => expandedRows.value.includes(id)

const handleToggleRow = async (notif: any) => {
  const id = notif.id
  if (expandedRows.value.includes(id)) {
    expandedRows.value = expandedRows.value.filter(x => x !== id)
  } else {
    expandedRows.value.push(id)
    // Mark as read automatically when expanding an unread message
    if (!(notif.isRead || notif.read)) {
      await markSingleRead(id)
    }
  }
}

// Simulated delete
const openDeleteConfirm = (notif: any) => {
  notifToDelete.value = notif
  deleteDialog.value = true
}

const handleDelete = () => {
  if (notifToDelete.value) {
    const id = notifToDelete.value.id
    // Simulated local filtering
    notificationsList.value = notificationsList.value.filter(n => n.id !== id)
    showSnackbar('通知删除成功！', 'success')
    deleteDialog.value = false
    expandedRows.value = expandedRows.value.filter(x => x !== id)
    notifToDelete.value = null
  }
}

// Copy content
const copyNotifContent = (notif: any) => {
  const text = notif.content || notif.title
  if (text) {
    navigator.clipboard.writeText(text)
    showSnackbar('复制成功！', 'success')
  } else {
    showSnackbar(t('autoPhrase.p0286') || '无内容可复制', 'error')
  }
}

// Filtered Computed
const filteredNotifications = computed(() => {
  if (!isLoggedIn.value) return []
  return notificationsList.value.filter(notif => {
    // 1. Search Query
    const token = searchQuery.value?.toLowerCase().trim() || ''
    const matchSearch = !token ||
      notif.title?.toLowerCase().includes(token) ||
      notif.content?.toLowerCase().includes(token)

    // 2. Read Status Filter
    let matchStatus = true
    if (filterStatus.value === 'UNREAD') {
      matchStatus = !(notif.isRead || notif.read)
    } else if (filterStatus.value === 'READ') {
      matchStatus = !!(notif.isRead || notif.read)
    }

    // 3. Category Type Filter
    let matchType = true
    if (filterType.value !== 'ALL') {
      matchType = notif.type === filterType.value
    }

    return matchSearch && matchStatus && matchType
  })
})

// Markdown Compiler
const compileMarkdown = (mdText: string): string => {
  const blockMath: string[] = []
  const inlineMath: string[] = []

  let text = mdText
    .replace(/\\\[([\s\S]+?)\\\]/g, '$$$$$1$$$$')
    .replace(/\\\(([\s\S]+?)\\\)/g, '$$$1$')

  text = text.replace(/\$\$(\s*[\s\S]+?\s*)\$\$/g, (_, expression) => {
    blockMath.push(expression)
    return `__BLOCK_MATH_PLACEHOLDER_${blockMath.length - 1}__`
  })

  text = text.replace(/\$([^\$\n]+?)\$/g, (_, expression) => {
    inlineMath.push(expression)
    return `__INLINE_MATH_PLACEHOLDER_${inlineMath.length - 1}__`
  })

  let html = marked.parse(text) as string

  html = html.replace(/__BLOCK_MATH_PLACEHOLDER_(\d+)__/g, (_, indexStr) => {
    const idx = parseInt(indexStr, 10)
    const expr = blockMath[idx]
    try {
      return `<div class="math-block pa-4 my-4 d-flex justify-center align-center overflow-auto rounded-lg" style="background: rgba(var(--v-theme-primary), 0.05); border: 1px solid rgba(var(--v-theme-primary), 0.1);">${katex.renderToString(expr, { displayMode: true, throwOnError: false })}</div>`
    } catch (e) {
      return `<div class="math-error text-error pa-2 border rounded-lg">${expr}</div>`
    }
  })

  html = html.replace(/__INLINE_MATH_PLACEHOLDER_(\d+)__/g, (_, indexStr) => {
    const idx = parseInt(indexStr, 10)
    const expr = inlineMath[idx]
    try {
      return `<span class="math-inline px-2 py-0.5 rounded text-primary mx-1" style="background: rgba(var(--v-theme-primary), 0.08); font-size: 0.95em;">${katex.renderToString(expr, { displayMode: false, throwOnError: false })}</span>`
    } catch (e) {
      return `<span class="math-error text-error">${expr}</span>`
    }
  })

  html = html.replace(/<table>([\s\S]*?)<\/table>/g, '<div class="table-responsive"><table>$1</table></div>')

  return html
}

// Fetch data on mounted
onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchNotificationsData()
  }
})

// Trigger reload when login status changes
watch(isLoggedIn, async (val) => {
  if (val) {
    await fetchNotificationsData()
  }
})
</script>

<style scoped>
  /* 磨砂玻璃卡片 */
  .glass-card {
    background: rgba(var(--v-theme-surface), 0.7) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(var(--v-theme-primary), 0.08) !important;
  }

  /* 渐变标题文本 */
  .bg-gradient-text {
    background: linear-gradient(135deg, #1867c0 0%, #5cbbf6 50%, #e57373 100%);
    -webkit-background-clip: text;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 900 !important;
    letter-spacing: -0.5px;
  }

  .v-theme--dark .bg-gradient-text,
  .v-theme--blackguard .bg-gradient-text {
    background: linear-gradient(135deg, #2196f3 0%, #ff4081 50%, #e7810d 100%);
    -webkit-background-clip: text;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .v-theme--midnightSakura .bg-gradient-text {
    background: linear-gradient(135deg, #ff79c6 0%, #bd93f9 50%, #8be9fd 100%);
    -webkit-background-clip: text;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* 表头微透背景 */
  .bg-table-header {
    background-color: rgba(var(--v-theme-primary), 0.04) !important;
  }

  /* 行悬浮与聚焦 */
  .hover-bg-row {
    transition: all 0.2s ease;
  }
  .hover-bg-row:hover {
    background-color: rgba(var(--v-theme-primary), 0.03) !important;
  }

  .row-active {
    background-color: rgba(var(--v-theme-primary), 0.05) !important;
  }

  /* 展开详情卡片 */
  .expanded-row-bg {
    background-color: rgba(var(--v-theme-surface-variant), 0.05) !important;
  }

  .bg-white-pure {
    background-color: rgb(var(--v-theme-surface)) !important;
  }

  .border-r-md {
    border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  }
  @media (max-width: 960px) {
    .border-r-md {
      border-right: none;
      border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
  }

  .bg-light-soft {
    background-color: rgba(var(--v-theme-surface-variant), 0.12) !important;
  }

  .font-mono {
    font-family: monospace;
  }

  .width-50 {
    width: 50px;
  }
  .width-100 {
    width: 100px;
  }
  .width-150 {
    width: 150px;
  }
  .width-180 {
    width: 180px;
  }
  .width-120 {
    width: 120px;
  }
  .min-width-32 {
    min-width: 32px !important;
  }

  .h-40 {
    height: 40px !important;
  }

  .gap-2 {
    gap: 8px;
  }

  /* 呼吸闪烁特效 */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* 自定义 timeline 紧凑样式 */
  .custom-timeline {
    padding-top: 4px;
  }
  :deep(.v-timeline-item__body) {
    padding-block-start: 2px !important;
    padding-block-end: 8px !important;
  }
</style>
