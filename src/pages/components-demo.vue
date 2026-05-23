<template>
  <v-container fluid class="pa-6">
    <!-- 顶部导航标题 -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="text-h4 font-weight-bold text-slate-800">
          表单与 UI 组件沙箱
        </div>
        <div class="text-subtitle-1 text-medium-emphasis mt-1">
          在此可探索 1:1 适配 Vuetify 官方文档的高级别名组件、各种状态指示器以及交互式 UI 元素的综合实例。
        </div>
      </v-col>
    </v-row>

    <!-- 标签选项卡分区 -->
    <v-card elevation="0" variant="outlined" class="rounded-xl overflow-hidden glass-card">
      <v-tabs
        v-model="tab"
        color="primary"
        align-tabs="start"
        class="border-b"
      >
        <v-tab value="form" prepend-icon="mdi-form-select" class="text-subtitle-2 font-weight-bold px-6 py-4 height-auto">
          高级表单与校验
        </v-tab>
        <v-tab value="sandbox" prepend-icon="mdi-palette-swatch-outline" class="text-subtitle-2 font-weight-bold px-6 py-4 height-auto">
          官方别名与色彩沙箱
        </v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <!-- 标签 1：表单与校验 -->
        <v-window-item value="form" class="pa-6">
          <v-form ref="productForm" v-model="formValid" lazy-validation>
            <v-row>
              <!-- 左侧：基础信息 -->
              <v-col cols="12" md="8">
                <v-row>
                  <!-- 商品名称 -->
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="product.name"
                      label="商品名称"
                      placeholder="例如: 智能降噪无线耳机"
                      prepend-inner-icon="mdi-shopping-outline"
                      :rules="rules.name"
                      required
                      variant="outlined"
                      density="comfortable"
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <!-- 唯一SKU编码 -->
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="product.sku"
                      label="SKU 编码"
                      placeholder="例如: WH-1000XM4"
                      prepend-inner-icon="mdi-barcode"
                      :rules="rules.sku"
                      required
                      variant="outlined"
                      density="comfortable"
                      class="rounded-lg"
                    ></v-text-field>
                  </v-col>

                  <!-- 商品分类 -->
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="product.category"
                      :items="categories"
                      label="商品分类"
                      prepend-inner-icon="mdi-shape-outline"
                      :rules="rules.category"
                      required
                      variant="outlined"
                      density="comfortable"
                    ></v-select>
                  </v-col>

                  <!-- 商品原价 -->
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="product.price"
                      type="number"
                      label="商品单价 (元)"
                      prepend-inner-icon="mdi-currency-cny"
                      prefix="¥"
                      :rules="rules.price"
                      required
                      variant="outlined"
                      density="comfortable"
                    ></v-text-field>
                  </v-col>

                  <!-- 促销折扣滑动条 -->
                  <v-col cols="12" class="py-0">
                    <div class="text-caption text-medium-emphasis mb-2 d-flex justify-space-between">
                      <span>促销折扣比例</span>
                      <span class="font-weight-bold text-primary">{{ product.discount }}折 (省 {{ savedAmount }}元)</span>
                    </div>
                    <v-slider
                      v-model="product.discount"
                      :min="1"
                      :max="10"
                      :step="0.5"
                      color="primary"
                      track-color="rgba(24, 103, 192, 0.15)"
                      thumb-label
                    >
                      <template #prepend>
                        <span class="text-caption">1折</span>
                      </template>
                      <template #append>
                        <span class="text-caption">无折扣</span>
                      </template>
                    </v-slider>
                  </v-col>

                  <!-- 商品描述 -->
                  <v-col cols="12">
                    <v-textarea
                      v-model="product.desc"
                      label="商品描述"
                      placeholder="请输入详细的商品卖点、保修范围或配送说明等..."
                      prepend-inner-icon="mdi-text-box-edit-outline"
                      variant="outlined"
                      rows="4"
                      :rules="rules.desc"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </v-col>

              <!-- 右侧：属性设定与图片 -->
              <v-col cols="12" md="4">
                <v-card class="pa-4 rounded-xl border bg-light-soft mb-4" variant="flat">
                  <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                    <v-icon color="secondary" class="mr-1">mdi-image-plus</v-icon> 商品封面图
                  </div>
                  <!-- 文件上传 -->
                  <v-file-input
                    v-model="product.imageFile"
                    accept="image/*"
                    label="选择商品封面图片"
                    prepend-icon=""
                    prepend-inner-icon="mdi-camera-outline"
                    variant="outlined"
                    density="comfortable"
                    show-size
                    :rules="rules.image"
                    @change="handleImageChange"
                  ></v-file-input>

                  <!-- 实时图片预览 -->
                  <div class="image-preview-container rounded-lg overflow-hidden border mt-2 d-flex justify-center align-center">
                    <v-img
                      v-if="imagePreviewUrl"
                      :src="imagePreviewUrl"
                      cover
                      height="150"
                    ></v-img>
                    <div v-else class="text-center text-muted pa-8 d-flex flex-column align-center">
                      <v-icon size="40" class="mb-2 text-medium-emphasis">mdi-image-outline</v-icon>
                      <span class="text-caption">暂无图片预览</span>
                    </div>
                  </div>
                </v-card>

                <!-- 上架设定 -->
                <v-card class="pa-4 rounded-xl border bg-light-soft" variant="flat">
                  <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                    <v-icon color="primary" class="mr-1">mdi-cog-outline</v-icon> 发布策略
                  </div>

                  <!-- 使用别名组件：SettingsSwitch 控制上架 -->
                  <settings-switch
                    v-model="product.publishNow"
                    label="审核通过后立即上架销售"
                  ></settings-switch>

                  <!-- 配送渠道复选 -->
                  <div class="text-caption font-weight-bold text-medium-emphasis mt-3 mb-1">分销与配送渠道</div>
                  <v-checkbox
                    v-model="product.channels"
                    label="自营物流配送"
                    value="self"
                    density="compact"
                    hide-details
                  ></v-checkbox>
                  <v-checkbox
                    v-model="product.channels"
                    label="第三方快递 (顺丰/邮政)"
                    value="third-party"
                    density="compact"
                    hide-details
                  ></v-checkbox>
                  <v-checkbox
                    v-model="product.channels"
                    label="跨境海外直邮"
                    value="overseas"
                    density="compact"
                    hide-details
                  ></v-checkbox>

                  <!-- 推荐星级 -->
                  <div class="text-caption font-weight-bold text-medium-emphasis mt-4 mb-1">主打推荐度</div>
                  <div class="d-flex align-center">
                    <v-rating
                      v-model="product.rating"
                      color="warning"
                      active-color="warning"
                      density="comfortable"
                      half-increments
                      hover
                    ></v-rating>
                    <span class="text-body-2 font-weight-bold ml-2 text-warning">{{ product.rating }} 分</span>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- 操作按钮 -->
            <v-divider class="my-6"></v-divider>
            <v-row class="justify-end px-3">
              <v-btn
                variant="text"
                color="secondary"
                class="mr-3 px-6 rounded-lg font-weight-bold"
                @click="resetForm"
              >
                重置表单
              </v-btn>
              <!-- 升级为官方组件别名 -->
              <primary-btn
                :disabled="!formValid"
                :loading="formSubmitting"
                class="px-8 font-weight-bold"
                @click="submitForm"
              >
                提交商品数据
              </primary-btn>
            </v-row>
          </v-form>
        </v-window-item>

        <!-- 标签 2：状态与展示沙箱 -->
        <v-window-item value="sandbox" class="pa-6">
          <!-- 官方组件别名展示区 (Official Component Aliases Showcase) -->
          <v-card class="pa-6 rounded-xl border bg-light-soft mb-6" variant="flat">
            <div class="text-h6 font-weight-bold mb-2 text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-palette-swatch-outline</v-icon>官方定制组件别名与预设展示 (Official Component Aliases Showcase)
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              这些定制别名组件直接注册于 `vuetify.ts`，内置了 Vuetify 官方文档全站特有的视觉外观属性（包括细描边 border、扁平化 flat、紧凑 compact 排版及预置状态图标）。您可以直接以标签形式在代码中声明使用：
            </p>
            <v-row>
              <!-- PrimaryBtn -->
              <v-col cols="12" sm="6" md="4">
                <v-card class="pa-4 rounded-xl border bg-surface fill-height" variant="outlined">
                  <div class="text-subtitle-2 font-weight-bold mb-2">PrimaryBtn (按钮别名)</div>
                  <div class="d-flex align-center flex-wrap py-2" style="gap: 8px;">
                    <primary-btn>标准官方按钮</primary-btn>
                    <primary-btn prepend-icon="mdi-rocket">带图标</primary-btn>
                  </div>
                  <div class="text-caption text-medium-emphasis mt-2">
                    <code>&lt;primary-btn&gt;</code>：默认具有薄描边、无阴影、极简紧凑感。
                  </div>
                </v-card>
              </v-col>

              <!-- SettingsSwitch -->
              <v-col cols="12" sm="6" md="4">
                <v-card class="pa-4 rounded-xl border bg-surface fill-height" variant="outlined">
                  <div class="text-subtitle-2 font-weight-bold mb-2">SettingsSwitch (设置开关)</div>
                  <div class="d-flex align-center py-2">
                    <settings-switch label="开启全局缓存加速" model-value="true" hide-details></settings-switch>
                  </div>
                  <div class="text-caption text-medium-emphasis mt-2">
                    <code>&lt;settings-switch&gt;</code>：具有 compactness 紧凑度和开关打勾图标。
                  </div>
                </v-card>
              </v-col>

              <!-- Chips Aliases -->
              <v-col cols="12" md="4">
                <v-card class="pa-4 rounded-xl border bg-surface fill-height" variant="outlined">
                  <div class="text-subtitle-2 font-weight-bold mb-2">特制 Chips 别名组</div>
                  <div class="d-flex align-center flex-wrap py-2" style="gap: 8px;">
                    <new-in-chip>New v3.6</new-in-chip>
                    <codemod-chip>Codemod</codemod-chip>
                    <page-feature-chip>API Docs</page-feature-chip>
                    <border-chip prepend-icon="mdi-star">Border</border-chip>
                  </div>
                  <div class="text-caption text-medium-emphasis mt-2">
                    各自预设了文档独有的边框、扁平度与特色状态色。
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card>

          <!-- M3 & Official Themes 动态色彩与对比度展示盒 -->
          <v-card class="pa-6 rounded-xl border bg-light-soft mb-6" variant="flat">
            <div class="text-h6 font-weight-bold mb-2 text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-palette-swatch</v-icon>官方色彩体系与自定义主题配色 (Theme Colors)
            </div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              当前项目已无缝集成 Vuetify Docs 官方三套高级主题色彩。以下是各色彩主题的核心主角色表现：
            </p>
            <v-row>
              <!-- Primary Pair -->
              <v-col cols="12" sm="6" md="3">
                <v-card class="rounded-xl overflow-hidden" border elevation="0">
                  <div class="pa-4 text-center bg-primary text-white font-weight-bold text-body-2">
                    Primary 主色
                  </div>
                  <div class="pa-4 text-center bg-surface-bright text-theme-on-surface font-weight-bold text-body-2">
                    Surface Bright
                  </div>
                </v-card>
              </v-col>
              <!-- Secondary Pair -->
              <v-col cols="12" sm="6" md="3">
                <v-card class="rounded-xl overflow-hidden" border elevation="0">
                  <div class="pa-4 text-center bg-secondary text-white font-weight-bold text-body-2">
                    Secondary 次色
                  </div>
                  <div class="pa-4 text-center bg-surface-variant-alt text-theme-on-surface font-weight-bold text-body-2">
                    Surface Variant Alt
                  </div>
                </v-card>
              </v-col>
              <!-- Tertiary Pair -->
              <v-col cols="12" sm="6" md="3">
                <v-card class="rounded-xl overflow-hidden" border elevation="0">
                  <div class="pa-4 text-center bg-tertiary text-white font-weight-bold text-body-2">
                    Tertiary 三级色
                  </div>
                  <div class="pa-4 text-center bg-accent text-white font-weight-bold text-body-2">
                    Accent 高亮色
                  </div>
                </v-card>
              </v-col>
              <!-- Blackguard Highlight -->
              <v-col cols="12" sm="6" md="3">
                <v-card class="rounded-xl overflow-hidden" border elevation="0">
                  <div class="pa-4 text-center bg-success text-white font-weight-bold text-body-2">
                    Success (Blackguard)
                  </div>
                  <div class="pa-4 text-center bg-background text-theme-on-background font-weight-bold text-body-2">
                    Background (Blackguard)
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card>

          <v-row>
            <!-- 骨架屏与异步加载展示 -->
            <v-col cols="12" md="6">
              <v-card class="pa-4 rounded-xl border bg-light-soft fill-height" variant="flat">
                <div class="d-flex align-center justify-space-between mb-4">
                  <div class="text-h6 font-weight-bold">
                    <v-icon color="secondary" class="mr-2">mdi-reload-alert</v-icon>骨架屏与加载效果
                  </div>
                  <!-- 别名开关 -->
                  <settings-switch
                    v-model="skeletonLoading"
                    label="启用骨架屏遮罩"
                    hide-details
                  ></settings-switch>
                </div>

                <p class="text-body-2 text-medium-emphasis mb-4">
                  在异步请求数据时，可以使用骨架屏（Skeleton Loader）避免页面突兀跳动，提升用户等待界面的愉悦度。
                </p>

                <!-- 真实卡片 vs 骨架屏 -->
                <v-skeleton-loader
                  :loading="skeletonLoading"
                  type="article, actions"
                  class="rounded-xl border fill-width elevation-0 py-2 bg-surface"
                >
                  <v-card class="elevation-0 border rounded-xl overflow-hidden bg-surface fill-width">
                    <v-img
                      src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640&auto=format&fit=crop"
                      height="160"
                      cover
                    ></v-img>
                    <v-card-item class="pb-0">
                      <page-feature-chip>热门资讯</page-feature-chip>
                      <div class="text-h6 font-weight-bold mt-2 text-slate-800">
                        WebShopX 全球分销系统升级说明
                      </div>
                    </v-card-item>
                    <v-card-text class="pt-2 text-body-2 text-medium-emphasis">
                      此次 2.0 升级针对全球多币种汇率自动结算系统进行了重构，支持亚非拉等地区 42 个新兴货币的一键实时同步...
                    </v-card-text>
                    <v-card-actions class="px-4 pb-4">
                      <primary-btn>阅读全文</primary-btn>
                      <v-btn color="secondary" variant="text" size="small" class="font-weight-bold ml-auto">
                        <v-icon start size="14">mdi-share-variant</v-icon> 分享
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-skeleton-loader>
              </v-card>
            </v-col>

            <!-- 警报系统与微芯片组 -->
            <v-col cols="12" md="6">
              <v-row>
                <!-- 警报系统 -->
                <v-col cols="12">
                  <v-card class="pa-4 rounded-xl border bg-light-soft" variant="flat">
                    <div class="text-h6 font-weight-bold mb-4">
                      <v-icon color="warning" class="mr-2">mdi-alert-box-outline</v-icon>多状态提示警报 (Alerts)
                    </div>

                    <v-alert
                      type="success"
                      title="操作成功"
                      text="商品基本资料及分类配置已成功同步至 CDN 云加速服务器。"
                      variant="tonal"
                      closable
                      class="mb-3 rounded-lg"
                    ></v-alert>

                    <v-alert
                      type="info"
                      title="系统更新"
                      text="系统将在本周日凌晨 02:00 进行例行微内核热升级，预计耗时 10 分钟。"
                      variant="tonal"
                      closable
                      class="mb-3 rounded-lg"
                    ></v-alert>

                    <v-alert
                      type="warning"
                      title="库存紧张"
                      text="检测到您名下的 '无线触控耳机 Pro' 实时库存少于 5 台，请尽快申请配额。"
                      variant="tonal"
                      closable
                      class="rounded-lg"
                    ></v-alert>
                  </v-card>
                </v-col>

                <!-- 芯片组演示 -->
                <v-col cols="12">
                  <v-card class="pa-4 rounded-xl border bg-light-soft" variant="flat">
                    <div class="text-h6 font-weight-bold mb-2">
                      <v-icon color="accent" class="mr-2">mdi-tag-multiple-outline</v-icon>微芯片标签组 (Chips)
                    </div>
                    <p class="text-body-2 text-medium-emphasis mb-3">
                      用于分类筛选或属性选定的微芯片，支持单选/多选及动态关闭。
                    </p>

                    <!-- 多选芯片组 -->
                    <div class="text-caption font-weight-bold text-medium-emphasis mb-1">标签筛选 (多选)</div>
                    <v-chip-group
                      v-model="selectedTags"
                      column
                      multiple
                      selected-class="text-primary font-weight-bold"
                    >
                      <!-- 使用定制别名芯片 BorderChip 进行多选展示 -->
                      <border-chip
                        v-for="tag in availableTags"
                        :key="tag"
                        :value="tag"
                        filter
                        class="px-4"
                      >
                        {{ tag }}
                      </border-chip>
                    </v-chip-group>

                    <div class="text-caption text-medium-emphasis mt-2">
                      当前已选标签: 
                      <span v-if="selectedTags.length" class="font-weight-bold text-primary">
                        {{ selectedTags.join(', ') }}
                      </span>
                      <span v-else class="text-muted">无</span>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- 底部环形进度指示 -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-card class="pa-5 rounded-xl border bg-light-soft text-center" variant="flat">
                <div class="text-h6 font-weight-bold text-left mb-4">
                  <v-icon color="primary" class="mr-2">mdi-loading</v-icon>环形加载进度条 (Progress Circular)
                </div>

                <v-row justify="center" align="center" class="py-4">
                  <v-col cols="6" sm="3" class="d-flex flex-column align-center">
                    <v-progress-circular
                      v-model="circularProgress"
                      color="primary"
                      size="70"
                      width="7"
                    >
                      {{ circularProgress }}%
                    </v-progress-circular>
                    <span class="text-caption mt-2 font-weight-bold">自定义进度</span>
                  </v-col>

                  <v-col cols="6" sm="3" class="d-flex flex-column align-center">
                    <v-progress-circular
                      indeterminate
                      color="secondary"
                      size="60"
                      width="6"
                    ></v-progress-circular>
                    <span class="text-caption mt-2 font-weight-bold">无阶加载中</span>
                  </v-col>

                  <v-col cols="6" sm="3" class="d-flex flex-column align-center">
                    <v-progress-circular
                      indeterminate
                      color="accent"
                      size="50"
                    ></v-progress-circular>
                    <span class="text-caption mt-2 font-weight-bold">小尺寸环形</span>
                  </v-col>

                  <v-col cols="6" sm="3" class="d-flex flex-column align-center">
                    <primary-btn
                      prepend-icon="mdi-autorenew"
                      @click="simulateCircularProgress"
                    >
                      触发随机进度
                    </primary-btn>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- 提交成功气泡 -->
    <v-snackbar
      v-model="snackbar"
      color="success"
      location="top right"
      :timeout="3000"
      class="rounded-lg"
    >
      <div class="d-flex align-center">
        <v-icon start class="mr-2">mdi-check-circle</v-icon>
        <span class="font-weight-bold">商品资料发布成功！已提交运营审核。</span>
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  // Tabs 控制
  const tab = ref('form')

  // 表单状态控制
  const productForm = ref<any>(null)
  const formValid = ref(false)
  const formSubmitting = ref(false)
  const snackbar = ref(false)
  const imagePreviewUrl = ref('')

  // 商品数据模型
  const product = ref({
    name: '',
    sku: '',
    category: null,
    price: null,
    discount: 10,
    desc: '',
    imageFile: [] as File[],
    publishNow: true,
    channels: ['self', 'third-party'],
    rating: 4.5,
  })

  // 分类下拉项
  const categories = [
    '数码影音',
    '家居百货',
    '摄影配件',
    '厨房电器',
    '美妆个护',
    '服饰箱包',
  ]

  // 节省计算
  const savedAmount = computed(() => {
    if (!product.value.price) return 0
    const originalPrice = Number(product.value.price)
    const discountRate = Number(product.value.discount) / 10
    return Math.round(originalPrice * (1 - discountRate))
  })

  // 校验规则
  const rules = {
    name: [
      (v: string) => !!v || '商品名称不能为空',
      (v: string) => (v && v.length >= 3) || '名称必须大于等于 3 个字符',
    ],
    sku: [
      (v: string) => !!v || 'SKU 编码不能为空',
      (v: string) => /^[A-Z0-9-]+$/.test(v) || 'SKU 只能包含大写字母、数字及中划线',
    ],
    category: [
      (v: string) => !!v || '请选择商品分类',
    ],
    price: [
      (v: number) => !!v || '请输入商品原价',
      (v: number) => v > 0 || '原价必须大于 0',
    ],
    desc: [
      (v: string) => !!v || '请输入商品描述',
      (v: string) => (v && v.length >= 10) || '描述不能少于 10 个字',
    ],
    image: [
      (v: any) => !v || !v.length || v[0].size < 2000000 || '图片文件不能超过 2MB',
    ],
  }

  // 预览图片逻辑
  function handleImageChange(event: any) {
    const files = event.target.files
    if (files && files[0]) {
      const reader = new FileReader()
      reader.onload = (e: any) => {
        imagePreviewUrl.value = e.target.result
      }
      reader.readAsDataURL(files[0])
    } else {
      imagePreviewUrl.value = ''
    }
  }

  // 提交表单
  async function submitForm() {
    const { valid } = await productForm.value.validate()
    if (!valid) return

    formSubmitting.value = true
    
    // 模拟接口请求
    setTimeout(() => {
      formSubmitting.value = false
      snackbar.value = true
      resetForm()
    }, 1500)
  }

  // 重置表单
  function resetForm() {
    if (productForm.value) {
      productForm.value.reset()
    }
    product.value.discount = 10
    product.value.rating = 4.5
    product.value.channels = ['self', 'third-party']
    imagePreviewUrl.value = ''
  }

  // 沙箱：骨架屏与芯片
  const skeletonLoading = ref(false)
  const selectedTags = ref(['数码', '特惠'])
  const availableTags = ['数码', '智能家电', '热销爆款', '特惠', '618抢先版', '海外购', '包邮']

  // 环形进度条控制
  const circularProgress = ref(60)
  function simulateCircularProgress() {
    circularProgress.value = Math.floor(Math.random() * 100)
  }
</script>

<style scoped>
  /* 磨砂玻璃卡片 */
  .glass-card {
    background: rgba(var(--v-theme-surface), 0.64) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.1) !important;
  }

  /* 表单浅背景区 */
  .bg-light-soft {
    background-color: rgba(var(--v-theme-on-surface), 0.03) !important;
  }

  /* 图片预览区域 */
  .image-preview-container {
    height: 150px;
    background-color: rgba(var(--v-theme-on-surface), 0.04);
    border: 2px dashed rgba(var(--v-theme-on-surface), 0.18);
  }

  .text-slate-800 {
    color: #1e293b;
  }
  .v-theme--dark .text-slate-800,
  .v-theme--blackguard .text-slate-800,
  .v-theme--midnightSakura .text-slate-800 {
    color: #f1f5f9;
  }

  .text-theme-on-surface {
    color: rgb(var(--v-theme-on-surface)) !important;
  }

  .text-theme-on-background {
    color: rgb(var(--v-theme-on-background)) !important;
  }

  .height-auto {
    height: auto !important;
  }
</style>
