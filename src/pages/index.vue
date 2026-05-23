<template>
  <v-container fluid class="pa-6">
    <!-- 顶部欢迎区 -->
    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <div class="text-h4 font-weight-bold text-slate-800">
          你好，林小夕 👋
        </div>
        <div class="text-subtitle-1 text-medium-emphasis mt-1">
          这是您今天的商城数据简报，一切运转良好！
        </div>
      </v-col>
      <v-col cols="12" md="4" class="text-md-right d-flex align-center justify-md-end">
        <primary-btn
          prepend-icon="mdi-export-variant"
          class="mr-2 font-weight-bold"
        >
          导出报告
        </primary-btn>
        <primary-btn
          prepend-icon="mdi-plus"
          class="font-weight-bold"
          to="/components-demo"
        >
          创建新品
        </primary-btn>
      </v-col>
    </v-row>

    <!-- 指标卡片行：全面呈现官方扁平薄描边设计 (Outlined Card Styles) -->
    <v-row class="mb-6">
      <!-- 1. Outlined Card -->
      <v-col cols="12" sm="6" lg="3" v-for="(card, index) in statCards" :key="index">
        <v-card
          elevation="0"
          variant="outlined"
          class="rounded-xl overflow-hidden glass-card position-relative hover-lift"
        >
          <div class="decor-blob" :style="{ backgroundColor: card.color }"></div>
          <v-card-text class="pa-5">
            <div class="d-flex justify-space-between align-center mb-4">
              <v-avatar :color="card.lightColor" class="rounded-lg" size="48">
                <v-icon :color="card.color" size="24">{{ card.icon }}</v-icon>
              </v-avatar>
              
              <!-- 使用别名组件：NewInChip / PageFeatureChip / BorderChip -->
              <new-in-chip v-if="index === 0" color="success">
                {{ card.trendText }} {{ card.trendPct }}
              </new-in-chip>
              <page-feature-chip v-else-if="index === 1">
                {{ card.trendText }} {{ card.trendPct }}
              </page-feature-chip>
              <border-chip v-else>
                {{ card.trendText }} {{ card.trendPct }}
              </border-chip>
            </div>

            <div class="d-flex align-center justify-space-between">
              <div class="text-overline text-medium-emphasis">{{ card.title }}</div>
              <v-chip size="x-small" color="primary" variant="tonal" class="rounded-pill px-2">Outlined</v-chip>
            </div>
            <div class="text-h4 font-weight-bold my-1 text-slate-800">{{ card.value }}</div>
            <div class="text-caption text-medium-emphasis mt-2 d-flex align-center">
              <span class="mr-1">环比上月</span>
              <span :class="`font-weight-bold`" :style="{ color: card.color }">{{ card.trendPct }}</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 图表与时间轴区域 -->
    <v-row class="mb-6">
      <!-- 销售走势图 (SVG 绘制，极简薄描边风格) -->
      <v-col cols="12" lg="8">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height">
          <v-card-item>
            <template #title>
              <div class="text-h6 font-weight-bold">年度销售额走势</div>
            </template>
            <template #subtitle>
              显示本年度最近 6 个月的月度销售增长与走势
            </template>
            <template #append>
              <v-btn-toggle
                v-model="chartPeriod"
                mandatory
                selected-class="bg-primary text-white"
                density="compact"
                class="rounded-lg border"
              >
                <v-btn size="small" value="month">按月</v-btn>
                <v-btn size="small" value="week">按周</v-btn>
              </v-btn-toggle>
            </template>
          </v-card-item>

          <v-card-text class="mt-4">
            <!-- 极简酷炫的 SVG 折线图 -->
            <div class="chart-container">
              <svg viewBox="0 0 700 240" class="responsive-svg">
                <defs>
                  <!-- 渐变填充 -->
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="rgb(var(--v-theme-primary))" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="rgb(var(--v-theme-primary))" stop-opacity="0.0"/>
                  </linearGradient>
                  <!-- 折线阴影 -->
                  <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
                    <feDropShadow dx="0" dy="8" stdDeviation="4" flood-color="rgb(var(--v-theme-primary))" flood-opacity="0.15" />
                  </filter>
                </defs>

                <!-- 网格横线 -->
                <line x1="50" y1="30" x2="680" y2="30" stroke="rgba(148, 163, 184, 0.15)" stroke-dasharray="4,4" />
                <line x1="50" y1="90" x2="680" y2="90" stroke="rgba(148, 163, 184, 0.15)" stroke-dasharray="4,4" />
                <line x1="50" y1="150" x2="680" y2="150" stroke="rgba(148, 163, 184, 0.15)" stroke-dasharray="4,4" />
                <line x1="50" y1="210" x2="680" y2="210" stroke="rgba(148, 163, 184, 0.15)" />

                <!-- 渐变背景区域 -->
                <path d="M 50 210 Q 150 120 250 140 T 450 70 T 650 40 L 650 210 Z" fill="url(#chartGradient)" />

                <!-- 主折线 -->
                <path
                  d="M 50 210 Q 150 120 250 140 T 450 70 T 650 40"
                  fill="none"
                  stroke="rgb(var(--v-theme-primary))"
                  stroke-width="4"
                  stroke-linecap="round"
                  filter="url(#shadow)"
                />

                <!-- 关键数据节点 -->
                <circle cx="50" cy="210" r="5" fill="#FFFFFF" stroke="rgb(var(--v-theme-primary))" stroke-width="3" class="hover-dot" />
                <circle cx="170" cy="130" r="5" fill="#FFFFFF" stroke="rgb(var(--v-theme-primary))" stroke-width="3" class="hover-dot" />
                <circle cx="290" cy="135" r="5" fill="#FFFFFF" stroke="rgb(var(--v-theme-primary))" stroke-width="3" class="hover-dot" />
                <circle cx="410" cy="85" r="5" fill="#FFFFFF" stroke="rgb(var(--v-theme-primary))" stroke-width="3" class="hover-dot" />
                <circle cx="530" cy="60" r="5" fill="#FFFFFF" stroke="rgb(var(--v-theme-primary))" stroke-width="3" class="hover-dot" />
                <circle cx="650" cy="40" r="5" fill="#FFFFFF" stroke="rgb(var(--v-theme-primary))" stroke-width="3" class="hover-dot" />

                <!-- X轴刻度文字 -->
                <text x="50" y="232" fill="#94A3B8" font-size="11" text-anchor="middle">12月</text>
                <text x="170" y="232" fill="#94A3B8" font-size="11" text-anchor="middle">1月</text>
                <text x="290" y="232" fill="#94A3B8" font-size="11" text-anchor="middle">2月</text>
                <text x="410" y="232" fill="#94A3B8" font-size="11" text-anchor="middle">3月</text>
                <text x="530" y="232" fill="#94A3B8" font-size="11" text-anchor="middle">4月</text>
                <text x="650" y="232" fill="#94A3B8" font-size="11" text-anchor="middle">5月</text>

                <!-- Y轴文字 -->
                <text x="40" y="34" fill="#94A3B8" font-size="10" text-anchor="end">200k</text>
                <text x="40" y="94" fill="#94A3B8" font-size="10" text-anchor="end">100k</text>
                <text x="40" y="154" fill="#94A3B8" font-size="10" text-anchor="end">50k</text>
                <text x="40" y="214" fill="#94A3B8" font-size="10" text-anchor="end">0</text>
              </svg>
            </div>
            <div class="d-flex justify-center mt-3">
              <span class="d-flex align-center mr-4 text-caption text-medium-emphasis">
                <v-icon color="primary" class="mr-1" size="14">mdi-circle</v-icon> 本月销售预测
              </span>
              <span class="d-flex align-center text-caption text-medium-emphasis">
                <v-icon color="secondary" class="mr-1" size="14">mdi-circle</v-icon> 去年同期水平
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 时间轴（最新动态） -->
      <v-col cols="12" lg="4">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height">
          <v-card-item>
            <template #title>
              <div class="text-h6 font-weight-bold">实时业务动态</div>
            </template>
            <template #subtitle>
              查看最近发生的系统与商城运营状态
            </template>
          </v-card-item>

          <v-card-text class="mt-2">
            <v-timeline density="compact" align="start" class="dense-timeline">
              <v-timeline-item
                v-for="(event, idx) in events"
                :key="idx"
                :dot-color="event.color"
                :icon="event.icon"
                size="small"
                fill-dot
              >
                <div class="d-flex flex-column">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="font-weight-bold text-body-2 text-slate-800">{{ event.title }}</span>
                    <span class="text-caption text-medium-emphasis">{{ event.time }}</span>
                  </div>
                  <p class="text-caption text-medium-emphasis">{{ event.desc }}</p>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 任务清单与热销商品 -->
    <v-row>
      <!-- 任务清单（支持动态计算进度） -->
      <v-col cols="12" md="6" lg="5">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height">
          <v-card-item>
            <template #title>
              <div class="text-h6 font-weight-bold">待办运营任务</div>
            </template>
            <template #subtitle>
              勾选已完成的任务，自动更新进度
            </template>
          </v-card-item>

          <v-card-text class="mt-2">
            <!-- 进度显示 -->
            <div class="mb-4">
              <div class="d-flex justify-space-between text-body-2 font-weight-bold mb-1">
                <span>运营团队任务进度</span>
                <span class="text-primary">{{ progressPercentage }}%</span>
              </div>
              <v-progress-linear
                :model-value="progressPercentage"
                color="primary"
                height="8"
                rounded
                striped
                class="rounded-pill"
              ></v-progress-linear>
            </div>

            <!-- 列表 -->
            <v-list class="bg-transparent pa-0">
              <v-list-item
                v-for="task in tasks"
                :key="task.id"
                class="px-0 py-1"
              >
                <template #prepend>
                  <v-checkbox-btn
                    v-model="task.completed"
                    color="primary"
                  ></v-checkbox-btn>
                </template>
                <v-list-item-title :class="{ 'text-decoration-line-through text-muted': task.completed }">
                  <span class="font-weight-medium text-body-2 text-slate-800">{{ task.title }}</span>
                </v-list-item-title>
                <template #append>
                  <!-- 使用别名组件：BorderChip 展示标签 -->
                  <border-chip :color="task.tagColor">
                    {{ task.tag }}
                  </border-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- 热销商品排行 -->
      <v-col cols="12" md="6" lg="7">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height">
          <v-card-item>
            <template #title>
              <div class="text-h6 font-weight-bold">热销榜单TOP 4</div>
            </template>
            <template #subtitle>
              本周销量最佳的商城商品和评分情况
            </template>
          </v-card-item>

          <v-card-text class="mt-2 pa-0">
            <v-table class="bg-transparent text-slate-800">
              <thead>
                <tr>
                  <th class="text-left font-weight-bold">商品名称</th>
                  <th class="text-left font-weight-bold">类别</th>
                  <th class="text-left font-weight-bold">价格</th>
                  <th class="text-left font-weight-bold">本周销量</th>
                  <th class="text-left font-weight-bold">评分</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in topProducts" :key="idx" class="hover-bg-row">
                  <td class="d-flex align-center py-3">
                    <v-avatar size="36" rounded class="mr-3">
                      <v-img :src="item.image"></v-img>
                    </v-avatar>
                    <span class="font-weight-medium text-body-2">{{ item.name }}</span>
                  </td>
                  <td>{{ item.category }}</td>
                  <td class="font-weight-bold text-primary">{{ item.price }}</td>
                  <td>
                    <span class="font-weight-bold">{{ item.sales }}</span> 件
                  </td>
                  <td>
                    <div class="d-flex align-center">
                      <v-icon color="warning" size="14" class="mr-1">mdi-star</v-icon>
                      <span class="text-caption font-weight-bold">{{ item.rating }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 移植自官方风格的 FAB 薄描边悬浮按钮 -->
    <primary-btn
      class="m3-fab font-weight-bold hover-scale"
      prepend-icon="mdi-plus"
      @click="fabDialog = true"
    >
      新建订单
    </primary-btn>

    <!-- 官方高对比平底风格对话框 -->
    <v-dialog v-model="fabDialog" max-width="500">
      <v-card class="pa-6 rounded-xl border" elevation="0">
        <v-card-title class="d-flex align-center font-weight-bold pb-2 text-h5 text-slate-800">
          <v-icon color="primary" class="mr-2" size="28">mdi-plus-circle-outline</v-icon>
          新建销售订单
        </v-card-title>
        <v-card-text class="px-0 pt-4">
          <v-form ref="fabForm" v-model="fabValid">
            <v-text-field
              v-model="newOrder.customer"
              label="客户姓名"
              variant="outlined"
              placeholder="请输入客户姓名"
              :rules="[(v) => !!v || '客户姓名不能为空']"
              required
            ></v-text-field>
            <v-text-field
              v-model="newOrder.productName"
              label="订购商品"
              variant="outlined"
              placeholder="请输入商品名称"
              :rules="[(v) => !!v || '商品名称不能为空']"
              required
            ></v-text-field>
            <v-text-field
              v-model.number="newOrder.amount"
              label="订单金额"
              variant="outlined"
              prefix="¥"
              type="number"
              :rules="[(v) => !!v || '金额不能为空', (v) => v > 0 || '金额必须大于0']"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-0 pt-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="secondary" class="font-weight-bold" @click="fabDialog = false">
            取消
          </v-btn>
          <primary-btn
            :disabled="!fabValid"
            class="px-6 font-weight-bold"
            @click="submitFabOrder"
          >
            确认创建
          </primary-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 全局提示气泡 -->
    <v-snackbar
      v-model="snackbar"
      color="success"
      location="top right"
      :timeout="3000"
      class="rounded-lg"
    >
      <div class="d-flex align-center">
        <v-icon start class="mr-2">mdi-check-circle</v-icon>
        <span class="font-weight-bold">{{ snackbarText }}</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  const chartPeriod = ref('month')

  // M3 Dialog & FAB states
  const fabDialog = ref(false)
  const fabValid = ref(false)
  const fabForm = ref<any>(null)
  const newOrder = ref({
    customer: '',
    productName: '',
    amount: null as number | null,
  })

  const snackbar = ref(false)
  const snackbarText = ref('')

  function submitFabOrder() {
    if (!newOrder.value.customer || !newOrder.value.productName || !newOrder.value.amount) return
    
    // Add to events
    events.unshift({
      title: '新订单已创建',
      desc: `用户 ${newOrder.value.customer} 刚刚下单购买了【${newOrder.value.productName}】 ￥${newOrder.value.amount}`,
      time: '刚刚',
      color: 'success',
      icon: 'mdi-cart-plus',
    })

    snackbarText.value = `订单创建成功：${newOrder.value.productName} (￥${newOrder.value.amount})`
    snackbar.value = true
    
    // Reset
    newOrder.value = {
      customer: '',
      productName: '',
      amount: null,
    }
    fabDialog.value = false
  }

  // 指标卡片数据
  const statCards = [
    {
      title: '总销售额',
      value: '￥124,560',
      icon: 'mdi-currency-cny',
      color: '#1867c0', // Primary light official
      lightColor: 'rgba(24, 103, 192, 0.1)',
      trendText: '提升',
      trendPct: '+12.5%',
      trendColor: 'success',
      trendIcon: 'mdi-trending-up',
    },
    {
      title: '今日订单量',
      value: '382 单',
      icon: 'mdi-cart-outline',
      color: '#5CBBF6', // Secondary light official
      lightColor: 'rgba(92, 187, 246, 0.1)',
      trendText: '提升',
      trendPct: '+8.3%',
      trendColor: 'success',
      trendIcon: 'mdi-trending-up',
    },
    {
      title: '新增激活用户',
      value: '12,450 人',
      icon: 'mdi-account-multiple-outline',
      color: '#E57373', // Tertiary light official
      lightColor: 'rgba(229, 115, 115, 0.1)',
      trendText: '小幅提升',
      trendPct: '+15.2%',
      trendColor: 'success',
      trendIcon: 'mdi-trending-up',
    },
    {
      title: '服务器健康度',
      value: '99.8%',
      icon: 'mdi-server',
      color: '#84b38a', // Success blackguard
      lightColor: 'rgba(132, 179, 138, 0.1)',
      trendText: '平稳',
      trendPct: '+0.05%',
      trendColor: 'success',
      trendIcon: 'mdi-check-circle-outline',
    },
  ]

  // 时间轴事件
  const events = [
    {
      title: '新订单生成',
      desc: '用户 林明华 刚刚下单支付了 ¥1,288 的【降噪无线耳机】',
      time: '2 分钟前',
      color: 'success',
      icon: 'mdi-cart-plus',
    },
    {
      title: '系统备份成功',
      desc: '阿里云数据库备份自动挂载并成功同步到香港节点',
      time: '15 分钟前',
      color: 'info',
      icon: 'mdi-server-security',
    },
    {
      title: '库存告警通知',
      desc: '【全自磨咖啡机】当前余量不足 5 台，需尽快补货',
      time: '1 小时前',
      color: 'warning',
      icon: 'mdi-alert-circle',
    },
    {
      title: '版本上线成功',
      desc: '商城移动端优惠券核销模块升级至 v2.4 线上版',
      time: '3 小时前',
      color: 'secondary',
      icon: 'mdi-rocket',
    },
  ]

  // 待办任务
  const tasks = ref([
    { id: 1, title: '审核并激活新商家的优惠券申请', completed: true, tag: '审核', tagColor: 'indigo' },
    { id: 2, title: '处理下午 3 点的服务器 CPU 飙升排查', completed: false, tag: '运维', tagColor: 'error' },
    { id: 3, title: '设计 618 狂欢节商城首页 Banner 图', completed: false, tag: '设计', tagColor: 'pink' },
    { id: 4, title: '核对昨天的对账报表及退款订单', completed: true, tag: '财务', tagColor: 'success' },
    { id: 5, title: '更新隐私政策并弹窗通知注册用户', completed: false, tag: '法务', tagColor: 'warning' },
  ])

  // 动态进度计算
  const progressPercentage = computed(() => {
    const completedTasks = tasks.value.filter(task => task.completed).length
    return Math.round((completedTasks / tasks.value.length) * 100)
  })

  // 热销排行
  const topProducts = [
    {
      name: '智能触控降噪耳机 Pro',
      category: '数码影音',
      price: '￥1,299',
      sales: 420,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=128&auto=format&fit=crop',
    },
    {
      name: '极简北欧风皮艺沙发',
      category: '家居百货',
      price: '￥4,599',
      sales: 185,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=128&auto=format&fit=crop',
    },
    {
      name: '专业级单轴手持云台',
      category: '摄影配件',
      price: '￥899',
      sales: 310,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=128&auto=format&fit=crop',
    },
    {
      name: '多功能全自动家用磨豆咖啡机',
      category: '厨房电器',
      price: '￥1,899',
      sales: 142,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?q=80&w=128&auto=format&fit=crop',
    },
  ]
</script>

<style scoped>
  /* 官方移植风格的 FAB Position */
  .m3-fab {
    position: fixed !important;
    bottom: 24px !important;
    right: 24px !important;
    z-index: 99 !important;
    height: 40px !important;
    padding: 0 16px !important;
    border-radius: 8px !important;
    text-transform: none !important;
    letter-spacing: 0.5px !important;
    font-size: 13px !important;
  }

  /* 现代卡片设计，官方薄描边微背景 */
  .glass-card {
    background: rgba(255, 255, 255, 0.6) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .v-theme--dark .glass-card,
  .v-theme--blackguard .glass-card {
    background: rgba(30, 30, 30, 0.4) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
  }

  /* 卡片悬停微浮 */
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.08) !important;
  }

  .v-theme--dark .hover-lift:hover,
  .v-theme--blackguard .hover-lift:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3) !important;
  }

  /* 酷炫圆形渐变背景球 */
  .decor-blob {
    position: absolute;
    top: -30px;
    right: -30px;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    opacity: 0.04;
    pointer-events: none;
    transition: transform 0.3s ease;
  }
  .hover-lift:hover .decor-blob {
    transform: scale(1.3);
  }

  /* 折线图网格自适应 */
  .chart-container {
    width: 100%;
    overflow: hidden;
  }
  .responsive-svg {
    width: 100%;
    height: auto;
  }

  /* SVG点悬停放大动画 */
  .hover-dot {
    transition: all 0.25s ease;
    cursor: pointer;
  }
  .hover-dot:hover {
    r: 8px;
    stroke-width: 4px;
  }

  /* 时间轴细节调整 */
  .dense-timeline {
    height: 380px;
    overflow-y: auto;
    scrollbar-width: thin;
  }

  /* 表格行悬停加亮 */
  .hover-bg-row {
    transition: background-color 0.2s ease;
  }
  .hover-bg-row:hover {
    background-color: rgba(var(--v-theme-primary), 0.04) !important;
  }

  .text-slate-800 {
    color: #1e293b;
  }
  .v-theme--dark .text-slate-800,
  .v-theme--blackguard .text-slate-800 {
    color: #f1f5f9;
  }
</style>
