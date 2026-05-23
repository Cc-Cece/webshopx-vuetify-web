<template>
  <v-container fluid class="pa-4 pa-md-6" style="max-width: 1400px; min-height: 100vh;">
    <!-- Filter / Search Bar -->
    <v-card variant="outlined" class="mb-4 mb-md-6">
      <v-card-text class="pa-3 pa-sm-4">
        <v-row align="center" dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="searchQuery"
              label="搜索商品"
              placeholder="商品名称或关键词"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
            ></v-text-field>
          </v-col>

          <v-col cols="6" md="3">
            <v-select
              v-model="selectedSort"
              :items="sortOptions"
              item-title="title"
              item-value="value"
              label="排序"
              prepend-inner-icon="mdi-sort"
              variant="outlined"
              density="comfortable"
              hide-details
            ></v-select>
          </v-col>

          <v-col cols="6" md="3" class="d-flex justify-md-end">
            <v-btn-toggle
              v-model="viewMode"
              mandatory
              variant="outlined"
              density="comfortable"
              divided
              class="product-view-toggle"
            >
              <v-btn
                v-for="option in viewModeOptions"
                :key="option.value"
                :value="option.value"
                icon
                :title="option.title"
                :aria-label="option.title"
              >
                <v-icon :icon="option.icon"></v-icon>
                <v-tooltip activator="parent" location="bottom">
                  {{ option.title }}
                </v-tooltip>
              </v-btn>
            </v-btn-toggle>
          </v-col>

          <v-col cols="6" md="1" class="d-flex justify-md-end">
            <v-btn
              prepend-icon="mdi-refresh"
              variant="tonal"
              color="primary"
              class="product-refresh-button"
              :loading="loading"
              @click="loadProducts"
            >
              刷新
            </v-btn>
          </v-col>
        </v-row>

        <v-expansion-panels v-model="advancedFilterPanel" variant="accordion" class="mt-4">
          <v-expansion-panel value="advanced">
            <v-expansion-panel-title>高级筛选</v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row dense>
                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="selectedCurrency"
                    :items="currencyOptions"
                    item-title="title"
                    item-value="value"
                    label="币种"
                    prepend-inner-icon="mdi-cash"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="selectedCategory"
                    :items="categoryOptions"
                    item-title="title"
                    item-value="value"
                    label="分类"
                    prepend-inner-icon="mdi-shape-outline"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  ></v-select>
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <div class="mt-4">
          <v-chip-group v-model="selectedTags" column multiple selected-class="text-primary font-weight-bold">
            <v-chip
              v-for="tag in availableTags"
              :key="tag"
              :value="tag"
              filter
              variant="outlined"
              class="px-4"
            >{{ tag }}</v-chip>
          </v-chip-group>
        </div>
      </v-card-text>
    </v-card>

    <!-- Skeleton loader -->
    <v-row v-if="loading && products.length === 0">
      <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
    </v-row>

    <template v-else-if="filteredProducts.length > 0">
    <!-- Grid view -->
      <v-row v-if="viewMode === 'grid'">
        <v-col
          v-for="product in filteredProducts"
          :key="product.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            variant="outlined"
            class="h-100 d-flex flex-column"
            :disabled="!product.purchasable"
            @click="openDetail(product)"
          >
            <v-sheet class="product-icon-surface product-card-media d-flex align-center justify-center pa-4" min-height="136">
              <McIcon
                :material="product.resolvedMaterial"
                :icon-url="product.resolvedIconPath"
                :size="88"
                color="primary"
              />
            </v-sheet>

            <v-card-item>
              <template #title>
                <div class="text-subtitle-1 font-weight-bold text-truncate">{{ product.title }}</div>
              </template>
              <template #append>
                <v-chip :color="availabilityMeta(product).color" size="small" variant="tonal">
                  {{ availabilityMeta(product).label }}
                </v-chip>
              </template>
            </v-card-item>

            <v-card-text class="pt-0 flex-grow-1">
              <div class="text-body-2 text-medium-emphasis line-clamp-2 mb-3">{{ product.description }}</div>
              <div class="d-flex flex-wrap ga-2">
                <v-chip v-for="tag in product.tags" :key="tag" size="x-small" variant="tonal">{{ tag }}</v-chip>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="px-4 py-3">
              <div>
                <div class="product-price-label text-medium-emphasis">单价</div>
                <div class="product-price-value">
                  <v-icon :color="currencyMeta(product.currency).color" size="18" class="mr-1">
                    {{ currencyMeta(product.currency).icon }}
                  </v-icon>
                  <span :class="`text-${currencyMeta(product.currency).color}`">
                    {{ product.price.toLocaleString() }}
                  </span>
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-btn variant="text" color="primary" @click.stop="openDetail(product)">详情</v-btn>
              <v-btn variant="flat" color="primary" :disabled="!product.purchasable || product.stock <= 0" @click.stop="openPurchase(product)">
                购买
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- List view -->
      <v-card v-else-if="viewMode === 'list'" variant="outlined">
        <v-list lines="two" class="py-0">
          <template v-for="(product, index) in filteredProducts" :key="product.id">
            <v-list-item class="py-4" @click="openDetail(product)">
              <template #prepend>
                <v-sheet class="product-icon-surface product-list-media d-flex align-center justify-center rounded-lg mr-3 mr-sm-4" width="64" height="64">
                  <McIcon :material="product.resolvedMaterial" :icon-url="product.resolvedIconPath" :size="44" color="primary" />
                </v-sheet>
              </template>

              <div class="d-flex flex-column flex-md-row align-md-center ga-3 w-100">
                <div class="flex-grow-1 min-width-0">
                  <div class="d-flex align-center flex-wrap ga-2 mb-1">
                    <div class="text-subtitle-1 font-weight-bold text-truncate">{{ product.title }}</div>
                    <v-chip :color="availabilityMeta(product).color" size="small" variant="tonal">
                      {{ availabilityMeta(product).label }}
                    </v-chip>
                  </div>
                  <div class="text-body-2 text-medium-emphasis line-clamp-2 mb-2">{{ product.description }}</div>
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip v-for="tag in product.tags" :key="tag" size="x-small" variant="tonal">{{ tag }}</v-chip>
                  </div>
                </div>

                <div class="d-flex align-center justify-space-between justify-md-end ga-2 flex-wrap product-list-actions">
                  <div class="text-md-right mr-md-2">
                    <div class="product-price-label text-medium-emphasis">单价</div>
                    <div class="product-price-value text-no-wrap">
                      <v-icon :color="currencyMeta(product.currency).color" size="18" class="mr-1">
                        {{ currencyMeta(product.currency).icon }}
                      </v-icon>
                      <span :class="`text-${currencyMeta(product.currency).color}`">
                        {{ product.price.toLocaleString() }}
                      </span>
                    </div>
                  </div>
                  <div class="product-list-cta">
                    <v-btn variant="text" color="primary" @click.stop="openDetail(product)">详情</v-btn>
                    <v-btn variant="flat" color="primary" :disabled="!product.purchasable || product.stock <= 0" @click.stop="openPurchase(product)">
                      购买
                    </v-btn>
                  </div>
                </div>
              </div>
            </v-list-item>
            <v-divider v-if="index < filteredProducts.length - 1"></v-divider>
          </template>
        </v-list>
      </v-card>
    </template>

    <v-empty-state
      v-else
      icon="mdi-store-outline"
      title="暂无商品"
      text="官方商城暂时没有上架商品，请稍后再来。"
      class="border rounded-lg"
    ></v-empty-state>

    <!-- Detail dialog -->
    <v-dialog v-model="detailDialog" max-width="760">
      <v-card v-if="selectedProduct" class="dialog-card">
        <v-card-title class="d-flex align-center flex-shrink-0">
          <v-icon color="primary" class="mr-2">mdi-store-outline</v-icon>
          <span class="text-truncate">{{ selectedProduct.title }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="dialog-card__content">
          <v-row>
            <v-col cols="12" md="5">
              <v-sheet class="product-icon-surface product-detail-media d-flex align-center justify-center pa-3 pa-sm-4 pa-md-5 rounded-lg">
                <McIcon :material="selectedProduct.resolvedMaterial" :icon-url="selectedProduct.resolvedIconPath" :size="120" color="primary" />
              </v-sheet>
            </v-col>

            <v-col cols="12" md="7">
              <div class="d-flex flex-wrap ga-2 mb-4">
                <v-chip :color="availabilityMeta(selectedProduct).color" variant="tonal">
                  {{ availabilityMeta(selectedProduct).label }}
                </v-chip>
                <v-chip color="primary" variant="tonal">{{ selectedProduct.type }}</v-chip>
                <v-chip variant="tonal">{{ currencyMeta(selectedProduct.currency).label }}</v-chip>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-4">{{ selectedProduct.detail }}</p>

              <v-list density="compact" lines="one" class="border rounded-lg">
                <v-list-item title="上架时间" :subtitle="formatRelativeTime(selectedProduct.listedAt)">
                  <template #prepend><v-icon>mdi-clock-outline</v-icon></template>
                </v-list-item>
                <v-list-item title="库存" :subtitle="stockLabel(selectedProduct)">
                  <template #prepend><v-icon>mdi-archive-outline</v-icon></template>
                </v-list-item>
                <v-list-item v-if="selectedProduct.purchaseLimit" title="限购" :subtitle="`${selectedProduct.purchaseLimit} 件`">
                  <template #prepend><v-icon>mdi-counter</v-icon></template>
                </v-list-item>
                <v-list-item title="交付方式" :subtitle="selectedProduct.delivery">
                  <template #prepend><v-icon>mdi-truck-delivery-outline</v-icon></template>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-6 py-4 flex-shrink-0">
          <v-btn variant="text" @click="detailDialog = false">关闭</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-cart-outline"
            :disabled="!selectedProduct.purchasable || selectedProduct.stock <= 0"
            @click="openPurchase(selectedProduct)"
          >
            购买
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Purchase dialog -->
    <v-dialog v-model="purchaseDialog" max-width="520">
      <v-card v-if="selectedProduct" class="dialog-card">
        <v-card-title class="d-flex align-center flex-shrink-0">
          <v-icon color="primary" class="mr-2">mdi-cart-check</v-icon>
          确认购买
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="purchaseDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="dialog-card__content">
          <v-list density="compact" class="mb-4 border rounded-lg">
            <v-list-item :title="selectedProduct.title">
              <template #prepend>
                <v-avatar rounded="lg" size="48" class="product-icon-surface">
                  <McIcon :material="selectedProduct.resolvedMaterial" :icon-url="selectedProduct.resolvedIconPath" :size="40" color="primary" />
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>

          <v-row align="center" dense class="mb-4">
            <v-col cols="12" sm="8">
              <v-slider
                v-model="quantity"
                label="购买数量"
                min="1"
                :max="maxQuantity"
                step="1"
                thumb-label
                color="primary"
                track-color="surface-variant"
                prepend-icon="mdi-counter"
                hide-details
                @end="normalizeQuantity"
              ></v-slider>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="quantity"
                label="数量"
                type="number"
                min="1"
                :max="maxQuantity"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @blur="normalizeQuantity"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-select
            v-model="claimMethod"
            :items="claimMethodOptions"
            item-title="title"
            item-value="value"
            label="领取方式"
            prepend-inner-icon="mdi-truck-delivery-outline"
            variant="outlined"
            density="comfortable"
            hide-details
            class="mb-2"
          ></v-select>

          <v-table density="comfortable" class="border rounded-lg mb-4">
            <tbody>
              <tr>
                <td>单价</td>
                <td class="text-right">{{ formatMoney(selectedProduct.price, selectedProduct.currency) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">总价</td>
                <td class="text-right font-weight-bold">{{ formatMoney(totalPrice, selectedProduct.currency) }}</td>
              </tr>
              <tr>
                <td>税额</td>
                <td class="text-right">{{ formatMoney(taxAmount, selectedProduct.currency) }}</td>
              </tr>
              <tr>
                <td>当前余额</td>
                <td class="text-right">{{ formatMoney(currentBalance, selectedProduct.currency) }}</td>
              </tr>
              <tr>
                <td>结算后余额</td>
                <td class="text-right font-weight-bold" :class="afterBalance < 0 ? 'text-error' : 'text-success'">
                  {{ formatMoney(afterBalance, selectedProduct.currency) }}
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-alert v-if="afterBalance < 0" type="error" variant="tonal" density="comfortable" text="钱包余额不足，无法完成本次购买。"></v-alert>
          <v-alert v-else type="success" variant="tonal" density="comfortable" text="余额充足，确认后将创建订单并扣除对应金额。"></v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-6 py-4 flex-shrink-0">
          <v-btn variant="text" @click="purchaseDialog = false">取消</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-check"
            :loading="submitting"
            :disabled="!canConfirmPurchase"
            @click="confirmPurchase"
          >
            确认购买
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="bottom right">
      {{ snackbarText }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">关闭</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { shopApi } from '@/api/shop'
import { shopCoin, gameCoin, shopCoinName, shopCoinShort, gameCoinName, gameCoinShort } from '@/api/authStore'
import McIcon from '@/components/McIcon.vue'
import { resolveProductDisplayVisual } from '@/utils/displayVisual'

type CurrencyCode = 'SHOP_COIN' | 'GAME_COIN'
type ClaimMethod = 'INSTANT' | 'MANUAL'
type ProductViewMode = 'grid' | 'list'

type ShopProduct = {
  id: string
  title: string
  sku: string
  description: string
  detail: string
  imageUrl: string
  price: number
  currency: CurrencyCode
  stock: number
  purchaseLimit: number
  tags: string[]
  type: string
  delivery: string
  purchasable: boolean
  listedAt: string
  resolvedMaterial: string
  resolvedIconPath: string
}

const products = ref<ShopProduct[]>([])
const loading = ref(false)
const submitting = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const searchQuery = ref('')
const selectedCurrency = ref<CurrencyCode | 'ALL'>('ALL')
const selectedSort = ref<'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'STOCK_ASC'>('POPULAR')
const viewMode = ref<ProductViewMode>('grid')
const advancedFilterPanel = ref<string | null>(null)
const selectedTags = ref<string[]>([])
const selectedCategory = ref<string | 'ALL'>('ALL')
const selectedProduct = ref<ShopProduct | null>(null)
const detailDialog = ref(false)
const purchaseDialog = ref(false)
const quantity = ref(1)
const claimMethod = ref<ClaimMethod>('INSTANT')

const sortOptions = [
  { title: '默认推荐', value: 'POPULAR' },
  { title: '价格低到高', value: 'PRICE_ASC' },
  { title: '价格高到低', value: 'PRICE_DESC' },
  { title: '库存少到多', value: 'STOCK_ASC' },
]

const viewModeOptions = [
  { title: '卡片视图', value: 'grid', icon: 'mdi-view-grid-outline' },
  { title: '列表视图', value: 'list', icon: 'mdi-view-list-outline' },
]

const currencyOptions = computed(() => [
  { title: '全部币种', value: 'ALL' },
  { title: `${shopCoinName.value} ${shopCoinShort.value}`, value: 'SHOP_COIN' },
  { title: `${gameCoinName.value} ${gameCoinShort.value}`, value: 'GAME_COIN' },
])

const claimMethodOptions = [
  { title: '即时到账', value: 'INSTANT' },
  { title: '手动领取', value: 'MANUAL' },
]

const availableTags = computed(() => {
  const tags = new Set<string>()
  products.value.forEach((p) => p.tags.forEach((t) => tags.add(t)))
  return Array.from(tags)
})

const categoryOptions = computed(() => {
  const cats = new Set<string>()
  products.value.forEach((p) => { if (p.type) cats.add(p.type) })
  return [{ title: '全部分类', value: 'ALL' }, ...Array.from(cats).map((c) => ({ title: c, value: c }))]
})

const filteredProducts = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const list = products.value.filter((p) => {
    const currMatch = selectedCurrency.value === 'ALL' || p.currency === selectedCurrency.value
    const qMatch = !q || p.title.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
    const tagMatch = selectedTags.value.length === 0 || selectedTags.value.some((t) => p.tags.includes(t))
    const catMatch = selectedCategory.value === 'ALL' || p.type === selectedCategory.value
    return currMatch && qMatch && tagMatch && catMatch
  })
  return [...list].sort((a, b) => {
    if (selectedSort.value === 'PRICE_ASC') return a.price - b.price
    if (selectedSort.value === 'PRICE_DESC') return b.price - a.price
    if (selectedSort.value === 'STOCK_ASC') return a.stock - b.stock
    return Number(b.purchasable) - Number(a.purchasable)
  })
})

const maxQuantity = computed(() => {
  if (!selectedProduct.value) return 1
  return Math.max(1, Math.min(selectedProduct.value.stock, selectedProduct.value.purchaseLimit || 99))
})

const normalizedQuantity = computed(() => {
  const v = Number(quantity.value)
  if (!Number.isFinite(v)) return 1
  return Math.min(Math.max(Math.floor(v), 1), maxQuantity.value)
})

const currentBalance = computed(() => {
  if (!selectedProduct.value) return 0
  return selectedProduct.value.currency === 'SHOP_COIN' ? shopCoin.value : gameCoin.value
})

const totalPrice = computed(() => (selectedProduct.value?.price ?? 0) * normalizedQuantity.value)
const taxRate = 0.06
const taxAmount = computed(() => Math.max(0, Math.round(totalPrice.value * taxRate)))
const afterBalance = computed(() => currentBalance.value - totalPrice.value - taxAmount.value)
const canConfirmPurchase = computed(() =>
  Boolean(selectedProduct.value && afterBalance.value >= 0 && !submitting.value)
)

function currencyMeta(currency: CurrencyCode) {
  return currency === 'SHOP_COIN'
    ? { label: `${shopCoinName.value} ${shopCoinShort.value}`, short: shopCoinShort.value, icon: 'mdi-database-outline', color: 'primary' }
    : { label: `${gameCoinName.value} ${gameCoinShort.value}`, short: gameCoinShort.value, icon: 'mdi-sword-cross', color: 'success' }
}

function availabilityMeta(product: ShopProduct) {
  if (!product.purchasable) return { label: '不可购买', color: 'error' }
  if (product.stock <= 0) return { label: '售罄', color: 'error' }
  if (product.stock <= 10) return { label: '库存紧张', color: 'warning' }
  return { label: '可购买', color: 'success' }
}

function stockLabel(product: ShopProduct) {
  if (product.stock <= 0) return '暂无库存'
  if (product.stock >= 999) return '库存充足'
  return `${product.stock} 件`
}

function formatMoney(value: number, currency: CurrencyCode) {
  return `${value.toLocaleString()} ${currencyMeta(currency).short}`
}

function formatRelativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  if (!Number.isFinite(diff) || diff < 0) return '刚刚'
  const min = 60000, hour = 3600000, day = 86400000
  if (diff < min) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / min)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`
  return new Date(value).toLocaleDateString('zh-CN')
}

function normalizeQuantity() { quantity.value = normalizedQuantity.value }

// Removed unused variables and imports: resolveProductIconMaterial, resolveDisplayIconUrl

function showSnackbar(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

function openDetail(product: ShopProduct) {
  selectedProduct.value = product
  detailDialog.value = true
}

function openPurchase(product: ShopProduct) {
  selectedProduct.value = product
  quantity.value = 1
  claimMethod.value = 'INSTANT'
  detailDialog.value = false
  purchaseDialog.value = true
}

async function loadProducts() {
  loading.value = true
  try {
    const res = await shopApi.getProducts()
    const raw = res.data?.data ?? res.data ?? []
    const list: any[] = Array.isArray(raw) ? raw : (raw.list ?? raw.products ?? [])
    products.value = list.map((item: any) => {
      const visual = resolveProductDisplayVisual(item)
      return {
        ...item,
        id: String(item.id ?? item.sku ?? Math.random()),
        title: visual.title,
        resolvedMaterial: visual.material,
        resolvedIconPath: visual.forceIconPath,
        sku: item.sku ?? '',
        description: item.description ?? item.desc ?? '',
        detail: item.detail ?? item.longDesc ?? item.description ?? '',
        imageUrl: item.imageUrl ?? item.icon ?? item.image ?? '',
        price: Number(item.price ?? 0),
        currency: (item.currency ?? 'SHOP_COIN') as CurrencyCode,
        stock: (item.unlimited || item.unlimitedStock)
          ? 999
          : item.stock != null
            ? Number(item.stock)
            : item.quantity != null
              ? Number(item.quantity)
              : 999,
        purchaseLimit: Number(item.purchaseLimit ?? item.maxPurchase ?? 99),
        tags: Array.isArray(item.tags) ? item.tags : [],
        type: item.type ?? item.category ?? '商品',
        delivery: item.delivery ?? '在线自动发货',
        purchasable: item.purchasable !== false && item.enabled !== false,
        listedAt: item.listedAt ?? item.createdAt ?? new Date().toISOString(),
      }
    })
  } catch (err) {
    console.error('Failed to load products:', err)
    showSnackbar('加载商品失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

async function confirmPurchase() {
  if (!selectedProduct.value || !canConfirmPurchase.value) return
  submitting.value = true
  try {
    await shopApi.createOrder({
      productId: selectedProduct.value.id,
      sku: selectedProduct.value.sku,
      quantity: normalizedQuantity.value,
      claimMethod: claimMethod.value,
    })
    purchaseDialog.value = false
    showSnackbar(`已购买 ${selectedProduct.value.title} x${normalizedQuantity.value}`)
    await loadProducts()
  } catch (err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? '购买失败'
    showSnackbar(msg, 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(loadProducts)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-view-toggle { width: 100%; }
.product-view-toggle :deep(.v-btn) { flex: 1 1 0; min-width: 0; }
.product-price-label { font-size: 0.68rem; font-weight: 500; line-height: 1.1; }
.product-price-value { align-items: center; display: flex; font-size: 1.12rem; font-weight: 800; line-height: 1.25; }
.product-refresh-button { width: 100%; }
.product-list-cta { align-items: center; display: flex; gap: 8px; flex-wrap: nowrap; }
.product-icon-surface { background-color: rgba(var(--v-theme-on-surface), 0.04) !important; border: 1px solid rgba(var(--v-theme-on-surface), 0.08); }
.product-card-media { min-height: 136px; }
.product-card-image, .product-list-image, .product-detail-image { flex: none; }

@media (min-width: 960px) {
  .product-view-toggle { width: auto; }
  .product-view-toggle :deep(.v-btn) { flex: 0 0 auto; min-width: 48px; }
  .product-refresh-button { width: auto; }
}

.product-detail-media { aspect-ratio: 1; max-width: 208px; width: 100%; }
.product-detail-image { height: clamp(88px, 16vw, 144px); width: clamp(88px, 16vw, 144px); }
.dialog-card { display: flex; flex-direction: column; max-height: calc(100dvh - 48px); }
.dialog-card__content { flex: 1 1 auto; min-height: 0; overflow-y: auto; }

@media (max-width: 600px) {
  .product-detail-media { max-width: 136px; }
  .product-detail-image { height: 88px; width: 88px; }
}
</style>
