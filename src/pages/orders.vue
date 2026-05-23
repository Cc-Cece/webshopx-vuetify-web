<template>
  <v-container fluid class="pa-6" style="max-width: 1400px; min-height: 100vh;">
    <!-- Main Order View Block -->
    <v-card v-if="!isLoggedIn" elevation="0" variant="outlined" class="rounded-xl pa-8 text-center glass-card">
      <v-avatar color="warning-lighten-5" class="mb-4" size="72">
        <v-icon color="warning" size="40">mdi-lock-outline</v-icon>
      </v-avatar>
      <h3 class="text-h6 font-weight-bold mb-2">{{ $t('app.uiText.templates.p0299') }}</h3>
      <p class="text-body-2 text-medium-emphasis mb-6">您需要先登录您的 Minecraft 账户才能查看和管理您的订单记录。</p>
      <v-btn color="primary" prepend-icon="mdi-account" class="font-weight-bold text-none" rounded="lg" size="large" href="/account">
        立即去登录
      </v-btn>
    </v-card>

    <div v-else>
      <!-- 过滤器与搜索栏卡片 -->
      <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 mb-6 glass-card">
        <v-row align="center" dense>
          <!-- 模糊搜索 -->
          <v-col cols="12" md="4" class="mb-3 mb-md-0">
            <v-text-field
              v-model="orderSearchQuery"
              label="搜索订单号或商品名称..."
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="primary"
            ></v-text-field>
          </v-col>

          <!-- 订单状态过滤芯片 -->
          <v-col cols="12" md="6" class="mb-3 mb-md-0">
            <div class="d-flex align-center flex-wrap">
              <span class="text-subtitle-2 font-weight-bold text-slate-800 mr-3">订单状态:</span>
              <v-chip-group
                v-model="orderSelectedStatuses"
                multiple
                selected-class="text-primary font-weight-bold"
              >
                <border-chip
                  v-for="status in orderStatuses"
                  :key="status.value"
                  :value="status.value"
                  filter
                  class="px-3 rounded-lg"
                >
                  {{ status.label }}
                </border-chip>
              </v-chip-group>
            </div>
          </v-col>

          <!-- 刷新按钮 -->
          <v-col cols="12" md="2" class="d-flex justify-md-end justify-start">
            <v-btn
              color="primary"
              variant="outlined"
              rounded="lg"
              class="font-weight-bold text-none"
              prepend-icon="mdi-refresh"
              :loading="ordersLoading"
              @click="handleLoadOrders"
            >
              {{ $t('app.uiText.page.ordersRefreshBtn') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <!-- Loading skeleton list -->
      <v-row v-if="ordersLoading">
        <v-col cols="12" v-for="n in 5" :key="n">
          <v-card variant="outlined" class="rounded-xl pa-4 glass-card">
            <v-skeleton-loader type="list-item-avatar-two-line, actions" class="bg-transparent"></v-skeleton-loader>
          </v-card>
        </v-col>
      </v-row>

      <!-- Empty Order State -->
      <div v-else-if="orders.length === 0" class="py-12 text-center">
        <v-empty-state
          icon="mdi-text-box-remove-outline"
          title="暂无购买订单"
          text="在官方货架上挑选心仪的服务器道具后即可生成您的首笔订单记录。"
          class="glass-card rounded-xl border pa-8 max-width-600 mx-auto"
        >
          <template #actions>
            <v-btn color="primary" variant="flat" rounded="lg" class="font-weight-bold" href="/shop">
              去商城逛逛
            </v-btn>
          </template>
        </v-empty-state>
      </div>

      <!-- Empty Filter State -->
      <div v-else-if="filteredOrders.length === 0" class="py-12 text-center">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-10 text-center glass-card max-width-600 mx-auto">
          <v-icon size="56" color="medium-emphasis" class="mb-4">mdi-database-minus</v-icon>
          <h3 class="text-h6 font-weight-bold text-slate-800 mb-2">暂无符合过滤条件的订单数据</h3>
          <p class="text-caption text-medium-emphasis">
            可以尝试更改搜索关键词或重置筛选状态。
          </p>
        </v-card>
      </div>

      <!-- Orders Data Table Card -->
      <v-card v-else elevation="0" variant="outlined" class="rounded-xl glass-card overflow-hidden">
        <v-table class="bg-transparent text-slate-800">
          <thead>
            <tr class="bg-table-header">
              <th class="width-50"></th> <!-- 展开把手 -->
              <th class="font-weight-bold text-subtitle-2">订单号</th>
              <th class="font-weight-bold text-subtitle-2">商品名称</th>
              <th class="font-weight-bold text-subtitle-2 text-right">交易金额</th>
              <th class="font-weight-bold text-subtitle-2 text-center">订单状态</th>
              <th class="font-weight-bold text-subtitle-2">下单时间</th>
              <th class="font-weight-bold text-subtitle-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="ord in filteredOrders" :key="ord.orderNo">
              <!-- 数据行 -->
              <tr class="hover-bg-row align-center text-body-2" :class="{ 'row-active': isRowExpanded(ord.orderNo) }">
                <td>
                  <v-btn
                    variant="text"
                    icon
                    density="comfortable"
                    :color="isRowExpanded(ord.orderNo) ? 'primary' : 'secondary'"
                    @click="toggleRow(ord.orderNo)"
                  >
                    <v-icon>{{ isRowExpanded(ord.orderNo) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                  </v-btn>
                </td>
                <td>
                  <div class="d-flex align-center font-mono font-weight-bold text-primary">
                    #{{ ord.orderNo }}
                    <v-btn
                      icon="mdi-content-copy"
                      size="x-small"
                      variant="text"
                      color="primary"
                      class="ml-1"
                      density="comfortable"
                      @click="copyText(ord.orderNo)"
                    ></v-btn>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-center py-2">
                    <!-- Product Icon -->
                    <div class="mc-icon-shell mc-icon-shell-sm mr-3">
                      <McIcon
                        :material="resolveOrderIconMaterial(ord)"
                        :icon-url="resolveDisplayIconUrl(ord)"
                        :size="32"
                        color="primary"
                      />
                    </div>
                    <div>
                      <div class="font-weight-bold text-slate-800 d-flex align-center">
                        {{ resolveOrderName(ord) }}
                        <v-chip size="x-small" color="primary" variant="flat" class="ml-2 font-weight-bold">
                          x{{ ord.qty }}
                        </v-chip>
                      </div>
                      <div class="text-caption text-medium-emphasis mt-0.5">
                        <v-chip
                          size="x-small"
                          :color="getProductTypeColor(ord.productType || ord.type)"
                          variant="tonal"
                          class="font-weight-bold"
                        >
                          {{ getProductTypeLabel(ord.productType || ord.type) }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-right">
                  <div class="d-flex align-center justify-end font-weight-black">
                    <v-icon
                      size="16"
                      :color="ord.currency === 'SHOP_COIN' ? 'primary' : 'success'"
                      class="mr-1"
                    >
                      {{ ord.currency === 'SHOP_COIN' ? 'mdi-database-outline' : 'mdi-sword' }}
                    </v-icon>
                    <span :class="ord.currency === 'SHOP_COIN' ? 'text-primary' : 'text-success'">
                      {{ ord.totalAmount }}
                    </span>
                  </div>
                </td>
                <td class="text-center">
                  <border-chip
                    :color="getOrderStatusColor(ord.orderStatus || ord.state)"
                    variant="tonal"
                    class="font-weight-bold px-3"
                  >
                    {{ getOrderStatusLabel(ord.orderStatus || ord.state) }}
                  </border-chip>
                </td>
                <td class="text-caption text-medium-emphasis">
                  {{ formatTimestamp(ord.createdAt || ord.time) }}
                </td>
                <td class="text-center">
                  <v-btn
                    v-if="isRefundAllowed(ord)"
                    color="error"
                    variant="outlined"
                    size="small"
                    rounded="lg"
                    prepend-icon="mdi-restore"
                    class="font-weight-bold text-none"
                    @click="triggerRefund(ord)"
                  >
                    {{ $t('app.uiText.templates.p0161') }}
                  </v-btn>
                  <span v-else class="text-caption text-medium-emphasis">—</span>
                </td>
              </tr>

              <!-- 展开行详情 -->
              <tr v-if="isRowExpanded(ord.orderNo)" class="expanded-row-bg">
                <td colspan="7" class="pa-5">
                  <v-card variant="flat" class="bg-white-pure rounded-xl pa-4 border">
                    <v-row>
                      <!-- 商品与交易详情 -->
                      <v-col cols="12" md="6" class="border-r-md">
                        <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center text-slate-800">
                          <v-icon color="primary" class="mr-1" size="18">mdi-format-list-bulleted</v-icon>
                          交易与商品明细
                        </div>
                        
                        <div class="d-flex align-center mb-4">
                          <div class="mc-icon-shell mc-icon-shell-lg mr-4 border rounded-lg bg-grey-lighten-4 pa-2">
                            <McIcon
                              :material="resolveOrderIconMaterial(ord)"
                              :icon-url="resolveDisplayIconUrl(ord)"
                              :size="48"
                              color="primary"
                            />
                          </div>
                          <div>
                            <h4 class="text-subtitle-1 font-weight-black text-slate-800">
                              {{ resolveOrderName(ord) }}
                            </h4>
                            <div class="text-caption text-medium-emphasis mt-1">
                              订单唯一编号：<span class="font-mono">{{ ord.orderNo }}</span>
                            </div>
                            <div class="text-caption text-medium-emphasis">
                              商品领取类型：{{ getProductTypeLabel(ord.productType || ord.type) }}
                            </div>
                          </div>
                        </div>

                        <v-divider class="my-3 border-dashed"></v-divider>

                        <div class="d-flex justify-space-between text-body-2 py-1 text-slate-800">
                          <span class="text-medium-emphasis">商品单价:</span>
                          <span class="font-weight-bold">
                            {{ ord.totalAmount / ord.qty }} {{ ord.currency === 'SHOP_COIN' ? shopCoinName : gameCoinName }}
                          </span>
                        </div>
                        <div class="d-flex justify-space-between text-body-2 py-1 text-slate-800">
                          <span class="text-medium-emphasis">购买数量:</span>
                          <span class="font-weight-bold">x{{ ord.qty }}</span>
                        </div>
                        <div class="d-flex justify-space-between text-body-1 py-1 font-weight-black text-primary">
                          <span>实付总额:</span>
                          <div class="d-flex align-center">
                            <v-icon size="18" :color="ord.currency === 'SHOP_COIN' ? 'primary' : 'success'" class="mr-1">
                              {{ ord.currency === 'SHOP_COIN' ? 'mdi-database-outline' : 'mdi-sword' }}
                            </v-icon>
                            <span>{{ ord.totalAmount }}</span>
                          </div>
                        </div>
                      </v-col>

                      <!-- 指令下发与领取状态 -->
                      <v-col cols="12" md="6" class="pl-md-6">
                        <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center text-slate-800">
                          <v-icon color="secondary" class="mr-1" size="18">mdi-truck-delivery-outline</v-icon>
                          服务器发货状态
                        </div>

                        <div class="mb-4 text-caption text-slate-800">
                          <div class="mb-2">
                            <span class="font-weight-bold text-medium-emphasis">收货角色名：</span>
                            <span>{{ username || '当前登录账户' }}</span>
                          </div>
                          <div>
                            <span class="font-weight-bold text-medium-emphasis">订单归属权：</span>
                            <span class="text-success font-weight-bold">验证通过 (本账户拥有)</span>
                          </div>
                        </div>

                        <!-- 简易服务器发货流程示意 -->
                        <div class="pa-3 bg-light-soft rounded-lg d-flex align-center justify-space-between mb-4 border">
                          <span class="text-caption font-weight-bold d-flex align-center text-success">
                            <v-icon color="success" size="14" class="mr-1">mdi-checkbox-marked-circle</v-icon>
                            订单支付成功
                          </span>

                          <v-icon size="12" color="medium-emphasis">mdi-arrow-right</v-icon>

                          <span class="text-caption font-weight-bold d-flex align-center text-success">
                            <v-icon color="success" size="14" class="mr-1">mdi-checkbox-marked-circle</v-icon>
                            系统结算完成
                          </span>

                          <v-icon size="12" color="medium-emphasis">mdi-arrow-right</v-icon>

                          <span
                            class="text-caption font-weight-bold d-flex align-center"
                            :class="(ord.orderStatus || ord.state || '').toUpperCase() === 'COMPLETED' ? 'text-success' : ((ord.orderStatus || ord.state || '').toUpperCase() === 'REFUNDED' ? 'text-grey' : 'text-orange-darken-2')"
                          >
                            <v-icon
                              :color="(ord.orderStatus || ord.state || '').toUpperCase() === 'COMPLETED' ? 'success' : ((ord.orderStatus || ord.state || '').toUpperCase() === 'REFUNDED' ? 'grey' : 'orange')"
                              size="14"
                              class="mr-1"
                            >
                              {{ (ord.orderStatus || ord.state || '').toUpperCase() === 'COMPLETED' ? 'mdi-checkbox-marked-circle' : ((ord.orderStatus || ord.state || '').toUpperCase() === 'REFUNDED' ? 'mdi-close-circle' : 'mdi-clock-outline') }}
                            </v-icon>
                            {{ getOrderStatusLabel(ord.orderStatus || ord.state) }}
                          </span>
                        </div>

                        <!-- 下发温馨提示 -->
                        <v-alert
                          v-if="(ord.orderStatus || ord.state || '').toUpperCase() === 'PENDING' || (ord.orderStatus || ord.state || '').toUpperCase() === 'WAITING' || (ord.orderStatus || ord.state || '').toUpperCase() === '待领取'"
                          type="warning"
                          variant="tonal"
                          density="compact"
                          icon="mdi-information-outline"
                          class="text-caption rounded-lg"
                        >
                          订单当前处于<strong>“待领取”</strong>状态。请您在确保<strong>已登录游戏服务器</strong>的情况下，在聊天框内输入对应指令或前往主城NPC处自动领取道具包裹。
                        </v-alert>

                        <v-alert
                          v-else-if="(ord.orderStatus || ord.state || '').toUpperCase() === 'REFUNDED' || (ord.orderStatus || ord.state || '').toUpperCase() === '已退款'"
                          type="error"
                          variant="tonal"
                          density="compact"
                          icon="mdi-close-circle-outline"
                          class="text-caption rounded-lg"
                        >
                          订单已退款。支付金额已归还您的钱包账户，相应的发放项目也已自动作废。
                        </v-alert>

                        <v-alert
                          v-else
                          type="success"
                          variant="tonal"
                          density="compact"
                          icon="mdi-checkbox-marked-circle-outline"
                          class="text-caption rounded-lg"
                        >
                          恭喜，道具指令已成功在服务器终端下发完毕！请在游戏内查收您的背包或效果状态。
                        </v-alert>
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
        <div class="pa-4 d-flex align-center justify-space-between flex-wrap">
          <span class="text-caption text-medium-emphasis">
            当前显示 1-{{ filteredOrders.length }} 条记录，共 {{ orders.length }} 条订单数据
          </span>
          <div class="d-flex align-center">
            <v-btn disabled variant="text" icon="mdi-chevron-left" density="comfortable" class="mr-2"></v-btn>
            <primary-btn class="rounded font-weight-bold min-width-32 mr-2">1</primary-btn>
            <v-btn disabled variant="text" icon="mdi-chevron-right" density="comfortable"></v-btn>
          </div>
        </div>
      </v-card>
    </div>

    <!-- 退款确认框 -->
    <v-dialog v-model="refundConfirmDialog" max-width="450">
      <v-card class="rounded-xl border pa-4" elevation="0">
        <v-card-title class="d-flex align-center font-weight-bold border-b pb-4">
          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          申请交易退款确认
        </v-card-title>
        <v-card-text class="pt-6 text-body-2 text-medium-emphasis leading-relaxed">
          您当前正在为您购买的 <strong>“{{ resolveOrderName(selectedRefundOrder) }}”</strong> 发起全额金币退款申请。
          <br /><br />
          确认提交后，该笔未领取的订单包裹将 <strong>自动被作废</strong>，且支付的全部代币金额将即刻原路退回您的钱包账户中。是否确认退款？
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="secondary" class="font-weight-bold text-none" @click="refundConfirmDialog = false">
            取消
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="px-6 font-weight-bold text-none rounded-lg"
            :loading="refundSubmitting"
            @click="handleRefundOrder"
          >
            确认全额退款
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Toast Notification -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">
      <div class="d-flex align-center">
        <v-icon start class="mr-2">
          {{ snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
        </v-icon>
        <span class="font-weight-bold">{{ snackbarText }}</span>
      </div>
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">关闭</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import McIcon from '@/components/McIcon.vue'
import {
  isLoggedIn,
  refreshWallet,
  username,
  shopCoinName,
  gameCoinName
} from '@/api/authStore'
import { shopApi } from '@/api/shop'
import {
  resolveOrderDisplayVisual
} from '@/utils/displayVisual'

const { t } = useI18n()

const orders = ref<any[]>([])
const ordersPolicy = ref<any>(null)
const ordersLoading = ref(false)

// Orders search, filter and expand states
const orderSearchQuery = ref('')
const orderSelectedStatuses = ref<string[]>([])
const orderExpandedRows = ref<string[]>([])

const orderStatuses = [
  { label: '待领取', value: 'PENDING' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已退款', value: 'REFUNDED' }
]

// Snackbars
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const showSnackbar = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

const copyText = (text: string) => {
  navigator.clipboard.writeText(text)
  showSnackbar('订单号复制成功', 'success')
}

// Refund confirmation states
const refundConfirmDialog = ref(false)
const selectedRefundOrder = ref<any>(null)
const refundSubmitting = ref(false)

onMounted(async () => {
  if (isLoggedIn.value) {
    await handleLoadOrders()
    await handleLoadOrdersPolicy()
  }
})

// Methods
const handleLoadOrders = async () => {
  ordersLoading.value = true
  try {
    const res = await shopApi.getOrdersPageList()
    orders.value = res.data?.orders || res.data || []
  } catch (err: any) {
    console.error(err)
    const errMsg = err.response?.data?.message || err.message || 'load orders failed'
    showSnackbar(t('app.uiText.templates.ordersLoadFailed', { message: errMsg }), 'error')
  } finally {
    ordersLoading.value = false
  }
}

const handleLoadOrdersPolicy = async () => {
  try {
    const res = await shopApi.getOrdersPolicy()
    ordersPolicy.value = res.data || null
  } catch (err) {
    console.error('Failed to load orders policy:', err)
  }
}

const isRowExpanded = (id: string) => {
  return orderExpandedRows.value.includes(id)
}

const toggleRow = (id: string) => {
  if (orderExpandedRows.value.includes(id)) {
    orderExpandedRows.value = orderExpandedRows.value.filter(rowId => rowId !== id)
  } else {
    orderExpandedRows.value.push(id)
  }
}

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const q = orderSearchQuery.value.trim().toLowerCase()
    const resolvedName = resolveOrderName(order).toLowerCase()
    const matchSearch = !q ||
      order.orderNo.toLowerCase().includes(q) ||
      resolvedName.includes(q) ||
      (order.productTitle && order.productTitle.toLowerCase().includes(q)) ||
      (order.productName && order.productName.toLowerCase().includes(q))
    
    const s = (order.orderStatus || order.state || '').toUpperCase()
    let mappedStatus = 'COMPLETED'
    if (s === 'PENDING' || s === 'WAITING' || s === '待领取') {
      mappedStatus = 'PENDING'
    } else if (s === 'REFUNDED' || s === '已退款') {
      mappedStatus = 'REFUNDED'
    }
    
    const matchStatus =
      orderSelectedStatuses.value.length === 0 ||
      orderSelectedStatuses.value.includes(mappedStatus)
    
    return matchSearch && matchStatus
  })
})

const isRefundAllowed = (order: any) => {
  if (!ordersPolicy.value || !ordersPolicy.value.allowRefund) {
    return false
  }
  const stateVal = (order.orderStatus || order.state || '').toUpperCase()
  return stateVal === 'PENDING' || stateVal === 'WAITING' || stateVal === '待领取'
}

const triggerRefund = (order: any) => {
  selectedRefundOrder.value = order
  refundConfirmDialog.value = true
}

const handleRefundOrder = async () => {
  if (!selectedRefundOrder.value) return
  refundSubmitting.value = true
  try {
    const orderNo = selectedRefundOrder.value.orderNo
    await shopApi.refundOrder({ orderNo })
    await refreshWallet()
    await handleLoadOrders()
    refundConfirmDialog.value = false
    showSnackbar(t('app.uiText.templates.p0247'), 'success')
  } catch (err: any) {
    console.error(err)
    const errMsg = err.response?.data?.message || err.message || 'Refund failed'
    showSnackbar(t('app.uiText.templates.refundFailed', { message: errMsg }), 'error')
  } finally {
    refundSubmitting.value = false
  }
}

const getProductTypeLabel = (type: string) => {
  switch (type) {
    case 'COMMAND':
      return t('app.uiText.page.productTypeCommand')
    case 'GIVE_ITEM':
      return t('app.uiText.page.productTypeGiveItem')
    case 'GIVE_CUSTOM':
      return t('app.uiText.page.productTypeGiveCustom')
    case 'POTION_EFFECT':
      return t('app.uiText.page.productTypePotionEffect')
    case 'RECYCLE_ITEM':
      return t('app.uiText.page.productTypeRecycleItem')
    case 'RECYCLE_COMMAND':
      return t('app.uiText.page.productTypeRecycleCommand')
    case 'RECYCLE_CUSTOM':
      return t('app.uiText.page.productTypeRecycleCustom')
    case 'GROUP_BUY_VOUCHER':
      return t('app.uiText.page.productTypeGroupBuyVoucher')
    default:
      return t('app.uiText.page.unknownTypeLabel')
  }
}

const getProductTypeColor = (type: string) => {
  if (type && type.startsWith('RECYCLE')) {
    return 'warning'
  }
  if (type === 'GROUP_BUY_VOUCHER') {
    return 'purple'
  }
  if (type === 'POTION_EFFECT') {
    return 'pink'
  }
  return 'primary'
}

const getOrderStatusLabel = (status: string) => {
  const s = (status || '').toUpperCase()
  if (s === 'PENDING' || s === 'WAITING' || s === '待领取') {
    return t('app.uiText.autoPhrase.p0231')
  }
  if (s === 'REFUNDED' || s === '已退款') {
    return t('app.uiText.autoPhrase.p0230')
  }
  return t('app.uiText.autoPhrase.p0229') 
}

const getOrderStatusColor = (status: string) => {
  const s = (status || '').toUpperCase()
  if (s === 'PENDING' || s === 'WAITING' || s === '待领取') {
    return 'orange'
  }
  if (s === 'REFUNDED' || s === '已退款') {
    return 'grey'
  }
  return 'success'
}

const formatTimestamp = (timestamp: any) => {
  if (!timestamp) return '—'
  const d = new Date(timestamp)
  if (isNaN(d.getTime())) return timestamp
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const resolveOrderName = (order: any): string => {
  if (!order) return ''
  const visual = resolveOrderDisplayVisual(order)
  return visual.title
}

const resolveOrderIconMaterial = (order: any): string => {
  const visual = resolveOrderDisplayVisual(order)
  return visual.material
}

const resolveDisplayIconUrl = (order: any): string => {
  const visual = resolveOrderDisplayVisual(order)
  return visual.forceIconPath
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.v-theme--dark .glass-card,
.v-theme--blackguard .glass-card,
.v-theme--midnightSakura .glass-card {
  background: rgba(30, 30, 30, 0.4) !important;
  backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.border-thin {
  border-width: 1px !important;
}

.max-width-600 {
  max-width: 600px;
}

.mc-icon-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  overflow: visible;
  background: transparent;
  border: 0;
}

.mc-icon-shell-sm {
  width: 56px;
  height: 56px;
}

.mc-icon-shell-lg {
  width: 96px;
  height: 96px;
}

/* Table layout styling imported from table-demo.vue */
.bg-table-header {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.hover-bg-row {
  transition: all 0.2s ease;
}
.hover-bg-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.03) !important;
}

.row-active {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.expanded-row-bg {
  background-color: rgba(var(--v-theme-background), 0.4) !important;
}

.bg-white-pure {
  background-color: #ffffff !important;
}
.v-theme--dark .bg-white-pure,
.v-theme--blackguard .bg-white-pure,
.v-theme--midnightSakura .bg-white-pure {
  background-color: rgba(30, 30, 30, 0.8) !important;
}

.border-r-md {
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}
@media (max-width: 960px) {
  .border-r-md {
    border-right: none;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
}
.v-theme--dark .border-r-md,
.v-theme--blackguard .border-r-md,
.v-theme--midnightSakura .border-r-md {
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}
@media (max-width: 960px) {
  .v-theme--dark .border-r-md,
  .v-theme--blackguard .border-r-md,
  .v-theme--midnightSakura .border-r-md {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.bg-light-soft {
  background-color: rgba(var(--v-theme-background), 0.5) !important;
}

.font-mono {
  font-family: monospace;
}

.width-50 {
  width: 50px;
}
.min-width-32 {
  min-width: 32px !important;
}

.text-slate-800 {
  color: #1e293b;
}
.v-theme--dark .text-slate-800,
.v-theme--blackguard .text-slate-800,
.v-theme--midnightSakura .text-slate-800 {
  color: #f1f5f9;
}
</style>
