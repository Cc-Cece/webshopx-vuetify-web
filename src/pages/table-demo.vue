<template>
  <v-container fluid class="pa-6">
    <!-- 顶部标题与简报 -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <div class="text-h4 font-weight-bold text-slate-800">
          高级数据管理中心
        </div>
        <div class="text-subtitle-1 text-medium-emphasis mt-1">
          基于可扩展表格的高频后台业务场景。包含多条件过滤、行内展开详情、数据增删改等高级联动。
        </div>
      </v-col>
      <v-col cols="12" md="4" class="text-md-right d-flex align-center justify-md-end">
        <v-btn
          prepend-icon="mdi-download"
          variant="outlined"
          border
          class="mr-2 rounded-lg text-none font-weight-bold"
          @click="simulateExport"
        >
          导出 Excel
        </v-btn>
        <primary-btn
          prepend-icon="mdi-plus"
          class="rounded-lg font-weight-bold"
          @click="openAddDialog"
        >
          新建订单
        </primary-btn>
      </v-col>
    </v-row>

    <!-- 过滤器与搜索栏卡片 -->
    <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 mb-6 glass-card">
      <v-row align="center">
        <!-- 模糊搜索 -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="searchQuery"
            label="搜索订单号或客户姓名..."
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            variant="outlined"
            density="comfortable"
            class="rounded-lg"
          ></v-text-field>
        </v-col>

        <!-- 订单状态过滤芯片 -->
        <v-col cols="12" md="8">
          <div class="d-flex align-center flex-wrap">
            <span class="text-subtitle-2 font-weight-bold text-slate-800 mr-3">订单状态:</span>
            <v-chip-group
              v-model="selectedStatuses"
              multiple
              selected-class="text-primary font-weight-bold"
            >
              <border-chip
                v-for="status in allStatuses"
                :key="status.value"
                :value="status.value"
                filter
                class="px-3"
              >
                {{ status.label }}
              </border-chip>
            </v-chip-group>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- 主数据表格卡片 -->
    <v-card elevation="0" variant="outlined" class="rounded-xl glass-card overflow-hidden">
      <v-table class="bg-transparent text-slate-800">
        <thead>
          <tr class="bg-table-header">
            <th class="width-50"></th> <!-- 展开把手 -->
            <th class="font-weight-bold text-subtitle-2">订单号</th>
            <th class="font-weight-bold text-subtitle-2">客户姓名</th>
            <th class="font-weight-bold text-subtitle-2">下单日期</th>
            <th class="font-weight-bold text-subtitle-2 text-right">交易金额</th>
            <th class="font-weight-bold text-subtitle-2 text-center">状态</th>
            <th class="font-weight-bold text-subtitle-2 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="order in filteredOrders" :key="order.id">
            <!-- 数据行 -->
            <tr class="hover-bg-row align-center" :class="{ 'row-active': isRowExpanded(order.id) }">
              <td>
                <v-btn
                  variant="text"
                  icon
                  density="comfortable"
                  :color="isRowExpanded(order.id) ? 'primary' : 'secondary'"
                  @click="toggleRow(order.id)"
                >
                  <v-icon>{{ isRowExpanded(order.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                </v-btn>
              </td>
              <td>
                <border-chip size="x-small" class="font-mono font-weight-bold text-primary px-2">
                  #{{ order.id }}
                </border-chip>
              </td>
              <td>
                <div class="d-flex align-center py-2">
                  <v-avatar size="32" class="mr-3 border-avatar">
                    <v-img :src="order.avatar"></v-img>
                  </v-avatar>
                  <div>
                    <div class="font-weight-bold text-body-2">{{ order.customer }}</div>
                    <div class="text-caption text-medium-emphasis">{{ order.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ order.date }}</td>
              <td class="text-right font-weight-bold text-primary">{{ formatPrice(order.amount) }}</td>
              <td class="text-center">
                <border-chip
                  :color="getStatusColor(order.status)"
                  variant="tonal"
                  class="font-weight-bold px-3"
                >
                  {{ getStatusLabel(order.status) }}
                </border-chip>
              </td>
              <td class="text-center">
                <v-btn
                  variant="text"
                  icon="mdi-pencil-outline"
                  color="primary"
                  density="comfortable"
                  class="mr-1"
                  @click="openEditDialog(order)"
                ></v-btn>
                <v-btn
                  variant="text"
                  icon="mdi-trash-can-outline"
                  color="error"
                  density="comfortable"
                  @click="confirmDeleteOrder(order)"
                ></v-btn>
              </td>
            </tr>

            <!-- 展开行详情 -->
            <tr v-if="isRowExpanded(order.id)" class="expanded-row-bg">
              <td colspan="7" class="pa-5">
                <v-card variant="flat" class="bg-white-pure rounded-xl pa-4 border">
                  <v-row>
                    <!-- 商品明细 -->
                    <v-col cols="12" md="6" class="border-r-md">
                      <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                        <v-icon color="primary" class="mr-1" size="18">mdi-format-list-bulleted</v-icon>
                        订单商品明细
                      </div>
                      <v-list class="bg-transparent pa-0">
                        <v-list-item
                          v-for="(item, idx) in order.items"
                          :key="idx"
                          class="px-0 py-2 border-b-light"
                        >
                          <template #prepend>
                            <v-avatar size="40" rounded class="mr-3">
                              <v-img :src="item.image"></v-img>
                            </v-avatar>
                          </template>
                          <v-list-item-title class="text-body-2 font-weight-bold text-slate-800">
                            {{ item.name }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption">
                            数量: {{ item.qty }} 件
                          </v-list-item-subtitle>
                          <template #append>
                            <span class="text-body-2 font-weight-bold text-slate-800">{{ formatPrice(item.price * item.qty) }}</span>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-col>

                    <!-- 配送与物流 -->
                    <v-col cols="12" md="6" class="pl-md-6">
                      <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                        <v-icon color="secondary" class="mr-1" size="18">mdi-truck-delivery-outline</v-icon>
                        收货与配送追踪
                      </div>
                      
                      <div class="mb-2 text-caption">
                        <span class="font-weight-bold text-medium-emphasis">收货人：</span>
                        <span class="text-slate-800">{{ order.customer }} ({{ order.phone }})</span>
                      </div>
                      <div class="mb-2 text-caption">
                        <span class="font-weight-bold text-medium-emphasis">配送地址：</span>
                        <span class="text-slate-800">{{ order.address }}</span>
                      </div>
                      <div class="mb-2 text-caption d-flex align-center">
                        <span class="font-weight-bold text-medium-emphasis">物流追踪单号：</span>
                        <border-chip size="x-small" color="secondary" variant="tonal" class="font-mono">
                          {{ order.tracking }}
                        </border-chip>
                        <v-btn icon="mdi-content-copy" variant="text" size="x-small" class="ml-1" color="secondary" @click="copyTracking(order.tracking)"></v-btn>
                      </div>
                      
                      <!-- 简易快递流程示意 -->
                      <div class="mt-4 pa-3 bg-light-soft rounded-lg d-flex align-center justify-space-between">
                        <span class="text-caption font-weight-bold d-flex align-center">
                          <v-icon color="success" size="14" class="mr-1">mdi-checkbox-marked-circle</v-icon>
                          仓库配货完毕
                        </span>
                        <v-icon size="12" color="medium-emphasis">mdi-arrow-right</v-icon>
                        <span class="text-caption font-weight-bold d-flex align-center">
                          <v-icon color="success" size="14" class="mr-1">mdi-checkbox-marked-circle</v-icon>
                          顺丰速运承运
                        </span>
                        <v-icon size="12" color="medium-emphasis">mdi-arrow-right</v-icon>
                        <span class="text-caption font-weight-bold d-flex align-center" :class="{ 'text-muted': order.status !== 'shipped' }">
                          <v-icon :color="order.status === 'shipped' ? 'success' : 'medium-emphasis'" size="14" class="mr-1">
                            {{ order.status === 'shipped' ? 'mdi-checkbox-marked-circle' : 'mdi-circle-outline' }}
                          </v-icon>
                          包裹派送中
                        </span>
                      </div>
                    </v-col>
                  </v-row>
                </v-card>
              </td>
            </tr>
          </template>

          <tr v-if="filteredOrders.length === 0">
            <td colspan="7" class="text-center py-10">
              <v-icon size="48" class="text-medium-emphasis mb-2">mdi-database-minus</v-icon>
              <div class="text-subtitle-1 font-weight-bold text-medium-emphasis">暂无符合过滤条件的订单数据</div>
            </td>
          </tr>
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

    <!-- ----------------------------------------------------- -->
    <!-- 模态框 1：新建 / 编辑订单 -->
    <!-- ----------------------------------------------------- -->
    <v-dialog v-model="editorDialog" max-width="500">
      <v-card class="rounded-xl border pa-4" elevation="0">
        <v-card-title class="d-flex align-center font-weight-bold border-b pb-4">
          <v-icon color="primary" class="mr-2">{{ isEditMode ? 'mdi-pencil-outline' : 'mdi-plus' }}</v-icon>
          {{ isEditMode ? '修改订单资料' : '创建新订单数据' }}
        </v-card-title>

        <v-card-text class="pt-6">
          <v-form ref="editorForm" v-model="editorValid">
            <!-- 客户姓名 -->
            <v-text-field
              v-model="editedOrder.customer"
              label="客户姓名"
              placeholder="请输入真实姓名"
              :rules="[(v) => !!v || '姓名不能为空']"
              variant="outlined"
              required
            ></v-text-field>

            <!-- 邮箱 -->
            <v-text-field
              v-model="editedOrder.email"
              label="电子邮箱"
              placeholder="example@mail.com"
              :rules="[(v) => !!v || '邮箱不能为空', (v) => /.+@.+\..+/.test(v) || '邮箱格式不正确']"
              variant="outlined"
              required
            ></v-text-field>

            <v-row>
              <!-- 交易金额 -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="editedOrder.amount"
                  type="number"
                  label="订单总金额 (元)"
                  prefix="¥"
                  :rules="[(v) => !!v || '金额不能为空', (v) => v > 0 || '金额必须大于0']"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <!-- 订单状态 -->
              <v-col cols="12" sm="6">
                <v-select
                  v-model="editedOrder.status"
                  :items="[
                    { title: '等待付款', value: 'unpaid' },
                    { title: '已付款', value: 'paid' },
                    { title: '已配送', value: 'shipped' },
                    { title: '已退款', value: 'refunded' }
                  ]"
                  label="订单状态"
                  variant="outlined"
                  required
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="secondary" class="font-weight-bold text-none" @click="editorDialog = false">
            取消
          </v-btn>
          <primary-btn
            :disabled="!editorValid"
            class="px-6 font-weight-bold"
            @click="saveOrder"
          >
            保存提交
          </primary-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ----------------------------------------------------- -->
    <!-- 模态框 2：删除订单警告框 -->
    <!-- ----------------------------------------------------- -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="rounded-xl border" elevation="0">
        <v-card-text class="pa-6 text-center">
          <v-icon color="error" size="56" class="mb-4">mdi-delete-alert-outline</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2 text-slate-800">确认删除此订单数据吗？</h3>
          <p class="text-caption text-medium-emphasis">
            删除后，系统数据库内的这一笔交易快照及物流配送单 <strong>将无法被恢复</strong>。请再次确认。
          </p>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4 bg-light-soft justify-space-between">
          <v-btn variant="text" color="secondary" class="font-weight-bold text-none" @click="deleteDialog = false">
            安全取消
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            border
            class="rounded-lg px-6 font-weight-bold text-none"
            @click="deleteOrder"
          >
            确定永久删除
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 气泡提示 -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" location="bottom right" :timeout="3000">
      <div class="d-flex align-center">
        <v-icon start class="mr-2">mdi-check-circle</v-icon>
        <span class="font-weight-bold">{{ snackbarText }}</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  // 全局提示气泡
  const snackbar = ref(false)
  const snackbarText = ref('')
  const snackbarColor = ref('success')

  function showMessage(text: string, color = 'success') {
    snackbarText.value = text
    snackbarColor.value = color
    snackbar.value = true
  }

  // -----------------------------------------------------
  // 模拟基础订单数据集
  // -----------------------------------------------------
  const orders = ref([
    {
      id: '1024',
      customer: '林明华',
      email: 'lin.minghua@example.com',
      phone: '138****9281',
      date: '2026-05-22',
      amount: 1299,
      status: 'paid',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&auto=format&fit=crop',
      address: '上海市 浦东新区 张江高科技园区祖冲之路888号',
      tracking: 'SF-16982736154',
      items: [
        { name: '智能触控降噪耳机 Pro (曜石黑)', price: 1299, qty: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=128&auto=format&fit=crop' }
      ]
    },
    {
      id: '1025',
      customer: '王丽莎',
      email: 'lisa.wang@example.com',
      phone: '159****2311',
      date: '2026-05-21',
      amount: 4599,
      status: 'shipped',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&auto=format&fit=crop',
      address: '北京市 朝阳区 建国门外大街1号国贸三期35层',
      tracking: 'SF-92817265144',
      items: [
        { name: '极简北欧风皮艺沙发 (米白色)', price: 4599, qty: 1, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=128&auto=format&fit=crop' }
      ]
    },
    {
      id: '1026',
      customer: '张建国',
      email: 'jianguo.zhang@example.com',
      phone: '133****6647',
      date: '2026-05-20',
      amount: 1798,
      status: 'unpaid',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=128&auto=format&fit=crop',
      address: '广东省 深圳市 南山区 科兴科学园A栋12层',
      tracking: 'SF-81273928174',
      items: [
        { name: '专业级单轴手持云台', price: 899, qty: 2, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=128&auto=format&fit=crop' }
      ]
    },
    {
      id: '1027',
      customer: '周美华',
      email: 'meihua.zhou@example.com',
      phone: '186****3281',
      date: '2026-05-20',
      amount: 1899,
      status: 'refunded',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=128&auto=format&fit=crop',
      address: '浙江省 杭州市 余杭区 阿里巴巴西溪园区B区',
      tracking: 'SF-52192873111',
      items: [
        { name: '多功能全自动家用磨豆咖啡机', price: 1899, qty: 1, image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?q=80&w=128&auto=format&fit=crop' }
      ]
    }
  ])

  // -----------------------------------------------------
  // 展开行控制逻辑
  // -----------------------------------------------------
  const expandedRows = ref<string[]>([])
  function isRowExpanded(id: string) {
    return expandedRows.value.includes(id)
  }
  function toggleRow(id: string) {
    if (expandedRows.value.includes(id)) {
      expandedRows.value = expandedRows.value.filter(rowId => rowId !== id)
    } else {
      expandedRows.value.push(id)
    }
  }

  // -----------------------------------------------------
  // 筛选与模糊搜索逻辑
  // -----------------------------------------------------
  const searchQuery = ref('')
  const selectedStatuses = ref<string[]>([])
  
  const allStatuses = [
    { label: '等待付款', value: 'unpaid' },
    { label: '已付款', value: 'paid' },
    { label: '已配送', value: 'shipped' },
    { label: '已退款', value: 'refunded' }
  ]

  const filteredOrders = computed(() => {
    return orders.value.filter(order => {
      // 模糊搜索
      const matchSearch =
        order.customer.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        order.id.includes(searchQuery.value)
      
      // 状态筛选
      const matchStatus =
        selectedStatuses.value.length === 0 ||
        selectedStatuses.value.includes(order.status)
      
      return matchSearch && matchStatus
    })
  })

  // -----------------------------------------------------
  // 样式与文案映射函数
  // -----------------------------------------------------
  function getStatusColor(status: string) {
    switch (status) {
      case 'unpaid': return 'warning'
      case 'paid': return 'success'
      case 'shipped': return 'secondary'
      case 'refunded': return 'error'
      default: return 'info'
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'unpaid': return '等待付款'
      case 'paid': return '已付款'
      case 'shipped': return '已配送'
      case 'refunded': return '已退款'
      default: return '未知'
    }
  }

  function formatPrice(value: number) {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(value)
  }

  function copyTracking(code: string) {
    navigator.clipboard.writeText(code)
    showMessage(`快递单号 '${code}' 已成功复制到剪贴板！`)
  }

  function simulateExport() {
    showMessage('成功为您触发 Excel 数据流导出！请注意浏览器下载。')
  }

  // -----------------------------------------------------
  // 3: 订单新增与修改逻辑 (对话框联动)
  // -----------------------------------------------------
  const editorDialog = ref(false)
  const editorValid = ref(false)
  const isEditMode = ref(false)
  const editedOrder = ref<any>({
    id: '',
    customer: '',
    email: '',
    amount: null,
    status: 'paid'
  })

  function openAddDialog() {
    isEditMode.value = false
    editedOrder.value = {
      id: '',
      customer: '',
      email: '',
      amount: null,
      status: 'paid'
    }
    editorDialog.value = true
  }

  function openEditDialog(order: any) {
    isEditMode.value = true
    editedOrder.value = { ...order }
    editorDialog.value = true
  }

  function saveOrder() {
    if (isEditMode.value) {
      // 修改
      const idx = orders.value.findIndex(o => o.id === editedOrder.value.id)
      if (idx !== -1) {
        orders.value[idx] = { ...orders.value[idx], ...editedOrder.value }
        showMessage(`订单 #${editedOrder.value.id} 修改成功！`)
      }
    } else {
      // 新建
      const nextId = String(Math.max(...orders.value.map(o => Number(o.id))) + 1)
      const newOrder = {
        id: nextId,
        customer: editedOrder.value.customer,
        email: editedOrder.value.email,
        phone: '136****0000',
        date: new Date().toISOString().substring(0, 10),
        amount: editedOrder.value.amount,
        status: editedOrder.value.status,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=128&auto=format&fit=crop',
        address: '北京市 中关村高科技软件园8号大楼',
        tracking: `SF-TX${Math.floor(10000000 + Math.random() * 90000000)}`,
        items: [
          { name: '自定义新增交易包裹项目', price: editedOrder.value.amount, qty: 1, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=128&auto=format&fit=crop' }
        ]
      }
      orders.value.unshift(newOrder)
      showMessage(`新订单 #${nextId} 成功生成！`)
    }
    editorDialog.value = false
  }

  // -----------------------------------------------------
  // 4: 订单删除逻辑
  // -----------------------------------------------------
  const deleteDialog = ref(false)
  const orderToDelete = ref<any>(null)

  function confirmDeleteOrder(order: any) {
    orderToDelete.value = order
    deleteDialog.value = true
  }

  function deleteOrder() {
    if (orderToDelete.value) {
      orders.value = orders.value.filter(o => o.id !== orderToDelete.value.id)
      showMessage(`订单 #${orderToDelete.value.id} 已永久从系统中物理删除。`, 'error')
      deleteDialog.value = false
      orderToDelete.value = null
    }
  }
</script>

<style scoped>
  /* 磨砂玻璃卡片 */
  .glass-card {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
  }

  .v-theme--dark .glass-card,
  .v-theme--blackguard .glass-card {
    background: rgba(30, 41, 59, 0.5) !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
  }

  /* 表头微透背景 */
  .bg-table-header {
    background-color: rgba(124, 58, 237, 0.04) !important;
  }
  .v-theme--dark .bg-table-header,
  .v-theme--blackguard .bg-table-header {
    background-color: rgba(139, 92, 246, 0.1) !important;
  }

  /* 行悬浮与聚焦 */
  .hover-bg-row {
    transition: all 0.2s ease;
  }
  .hover-bg-row:hover {
    background-color: rgba(124, 58, 237, 0.03) !important;
  }
  .v-theme--dark .hover-bg-row:hover,
  .v-theme--blackguard .hover-bg-row:hover {
    background-color: rgba(139, 92, 246, 0.05) !important;
  }

  .row-active {
    background-color: rgba(124, 58, 237, 0.05) !important;
  }
  .v-theme--dark .row-active,
  .v-theme--blackguard .row-active {
    background-color: rgba(139, 92, 246, 0.08) !important;
  }

  /* 展开详情卡片 */
  .expanded-row-bg {
    background-color: rgba(248, 250, 252, 0.4) !important;
  }
  .v-theme--dark .expanded-row-bg,
  .v-theme--blackguard .expanded-row-bg {
    background-color: rgba(15, 23, 42, 0.2) !important;
  }

  .bg-white-pure {
    background-color: #ffffff !important;
  }
  .v-theme--dark .bg-white-pure,
  .v-theme--blackguard .bg-white-pure {
    background-color: rgba(30, 41, 59, 0.8) !important;
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
  .v-theme--blackguard .border-r-md {
    border-right: 1px solid rgba(255, 255, 255, 0.05);
  }
  @media (max-width: 960px) {
    .v-theme--dark .border-r-md,
    .v-theme--blackguard .border-r-md {
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
  }

  .border-b-light {
    border-bottom: 1px dashed rgba(0, 0, 0, 0.05) !important;
  }
  .v-theme--dark .border-b-light,
  .v-theme--blackguard .border-b-light {
    border-bottom: 1px dashed rgba(255, 255, 255, 0.05) !important;
  }

  .bg-light-soft {
    background-color: rgba(244, 247, 252, 0.5) !important;
  }
  .v-theme--dark .bg-light-soft,
  .v-theme--blackguard .bg-light-soft {
    background-color: rgba(15, 23, 42, 0.3) !important;
  }

  .border-avatar {
    border: 1px solid #7c3aed;
  }
  .v-theme--dark .border-avatar,
  .v-theme--blackguard .border-avatar {
    border: 1px solid #a78bfa;
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
  .v-theme--blackguard .text-slate-800 {
    color: #f1f5f9;
  }
</style>
