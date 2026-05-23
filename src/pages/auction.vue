<template>
  <v-container fluid class="pa-4 pa-md-6" style="max-width: 1400px; min-height: 100vh;">
    <!-- Filter / Search Bar -->
    <v-card variant="outlined" class="mb-4 mb-md-6">
      <v-card-text class="pa-3 pa-sm-4">
        <v-row align="center" dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="searchQuery"
              label="搜索拍卖"
              placeholder="商品名称、卖家或关键词"
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
            <v-btn-toggle v-model="viewMode" mandatory variant="outlined" density="comfortable" divided class="product-view-toggle">
              <v-btn v-for="option in viewModeOptions" :key="option.value" :value="option.value" icon :title="option.title">
                <v-icon :icon="option.icon"></v-icon>
                <v-tooltip activator="parent" location="bottom">{{ option.title }}</v-tooltip>
              </v-btn>
            </v-btn-toggle>
          </v-col>

          <v-col cols="6" md="1" class="d-flex justify-md-end">
            <v-btn prepend-icon="mdi-refresh" variant="tonal" color="primary" class="product-refresh-button" :loading="loading" @click="loadAuctions">刷新</v-btn>
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
                    v-model="statusFilter"
                    :items="statusOptions"
                    item-title="title"
                    item-value="value"
                    label="状态"
                    prepend-inner-icon="mdi-gavel"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-select
                    v-model="ownershipFilter"
                    :items="ownershipOptions"
                    item-title="title"
                    item-value="value"
                    label="本人商品"
                    prepend-inner-icon="mdi-account-outline"
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
            <v-chip v-for="tag in availableTags" :key="tag" :value="tag" filter variant="outlined" class="px-4">{{ tag }}</v-chip>
          </v-chip-group>
        </div>
      </v-card-text>
    </v-card>

    <!-- Skeleton -->
    <v-row v-if="loading && auctions.length === 0">
      <v-col v-for="i in 8" :key="i" cols="12" sm="6" md="4" lg="3">
        <v-skeleton-loader type="card"></v-skeleton-loader>
      </v-col>
    </v-row>

    <template v-else-if="filteredAuctions.length > 0">
      <!-- Grid view -->
      <v-row v-if="viewMode === 'grid'">
        <v-col v-for="item in filteredAuctions" :key="item.id" cols="12" sm="6" md="4" lg="3">
          <v-card variant="outlined" class="h-100 d-flex flex-column" :disabled="!isAuctionActive(item)" @click="openDetail(item)">
            <v-sheet class="product-icon-surface product-card-media d-flex align-center justify-center pa-4" min-height="136">
              <McIcon
                :material="item.resolvedMaterial"
                :icon-url="item.resolvedIconPath"
                :size="88"
                color="info"
              />
            </v-sheet>

            <v-card-item>
              <template #title>
                <div class="text-subtitle-1 font-weight-bold text-truncate">{{ item.title }}</div>
              </template>
              <template #subtitle>
                <span v-if="item.sellerName" class="text-caption">{{ item.sellerName }}</span>
              </template>
              <template #append>
                <v-chip :color="auctionStatusMeta(item).color" size="small" variant="tonal">{{ auctionStatusMeta(item).label }}</v-chip>
              </template>
            </v-card-item>

            <v-card-text class="pt-0 flex-grow-1">
              <div class="text-body-2 text-medium-emphasis line-clamp-2 mb-3">{{ item.description }}</div>
              <div class="d-flex flex-wrap ga-2 mb-2">
                <v-chip size="x-small" color="info" variant="tonal">拍卖</v-chip>
                <v-chip v-for="tag in item.tags" :key="tag" size="x-small" variant="tonal">{{ tag }}</v-chip>
              </div>
              <div class="text-caption text-medium-emphasis">
                <v-icon size="14" class="mr-1">mdi-timer-outline</v-icon>{{ formatCountdown(item.endsAt) }}
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="px-4 py-3">
              <div>
                <div class="product-price-label text-medium-emphasis">当前价</div>
                <div class="product-price-value">
                  <v-icon :color="currencyMeta(item.currency).color" size="18" class="mr-1">{{ currencyMeta(item.currency).icon }}</v-icon>
                  <span :class="`text-${currencyMeta(item.currency).color}`">{{ item.currentBid.toLocaleString() }}</span>
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-btn variant="text" color="primary" @click.stop="openDetail(item)">详情</v-btn>
              <v-btn variant="flat" color="primary" :disabled="!isAuctionActive(item)" @click.stop="openBidDialog(item)">出价</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- List view -->
      <v-card v-else-if="viewMode === 'list'" variant="outlined">
        <v-list lines="two" class="py-0">
          <template v-for="(item, index) in filteredAuctions" :key="item.id">
            <v-list-item class="py-4" @click="openDetail(item)">
              <template #prepend>
                <v-sheet class="product-icon-surface product-list-media d-flex align-center justify-center rounded-lg mr-3 mr-sm-4" width="64" height="64">
                  <McIcon :material="item.resolvedMaterial" :icon-url="item.resolvedIconPath" :size="44" color="info" />
                </v-sheet>
              </template>

              <div class="d-flex flex-column flex-md-row align-md-center ga-3 w-100">
                <div class="flex-grow-1 min-width-0">
                  <div class="d-flex align-center flex-wrap ga-2 mb-1">
                    <div class="text-subtitle-1 font-weight-bold text-truncate">{{ item.title }}</div>
                    <v-chip :color="auctionStatusMeta(item).color" size="small" variant="tonal">{{ auctionStatusMeta(item).label }}</v-chip>
                    <v-chip size="small" color="info" variant="tonal">拍卖</v-chip>
                  </div>
                  <div v-if="item.sellerName" class="text-caption text-medium-emphasis mb-1">{{ item.sellerName }}</div>
                  <div class="text-body-2 text-medium-emphasis line-clamp-2 mb-2">{{ item.description }}</div>
                  <div class="d-flex align-center ga-3">
                    <span class="text-caption text-medium-emphasis">
                      <v-icon size="14" class="mr-1">mdi-timer-outline</v-icon>{{ formatCountdown(item.endsAt) }}
                    </span>
                    <span class="text-caption text-medium-emphasis">
                      <v-icon size="14" class="mr-1">mdi-account-multiple-outline</v-icon>{{ item.bidCount }} 次出价
                    </span>
                  </div>
                </div>

                <div class="d-flex align-center justify-space-between justify-md-end ga-2 flex-wrap product-list-actions">
                  <div class="text-md-right mr-md-2">
                    <div class="product-price-label text-medium-emphasis">当前价</div>
                    <div class="product-price-value text-no-wrap">
                      <v-icon :color="currencyMeta(item.currency).color" size="18" class="mr-1">{{ currencyMeta(item.currency).icon }}</v-icon>
                      <span :class="`text-${currencyMeta(item.currency).color}`">{{ item.currentBid.toLocaleString() }}</span>
                    </div>
                  </div>
                  <div class="product-list-cta">
                    <v-btn variant="text" color="primary" @click.stop="openDetail(item)">详情</v-btn>
                    <v-btn variant="flat" color="primary" :disabled="!isAuctionActive(item)" @click.stop="openBidDialog(item)">出价</v-btn>
                  </div>
                </div>
              </div>
            </v-list-item>
            <v-divider v-if="index < filteredAuctions.length - 1"></v-divider>
          </template>
        </v-list>
      </v-card>
    </template>

    <v-empty-state v-else icon="mdi-gavel" title="暂无拍卖" text="当前没有进行中的拍卖，稍后再来或调整筛选条件。" class="border rounded-lg"></v-empty-state>

    <!-- Detail dialog -->
    <v-dialog v-model="detailDialog" max-width="760">
      <v-card v-if="selectedItem" class="dialog-card">
        <v-card-title class="d-flex align-center flex-shrink-0">
          <v-icon color="primary" class="mr-2">mdi-gavel</v-icon>
          <span class="text-truncate">{{ selectedItem.title }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="dialog-card__content">
          <v-row>
            <v-col cols="12" md="5">
              <v-sheet class="product-icon-surface product-detail-media d-flex align-center justify-center pa-3 pa-sm-4 pa-md-5 rounded-lg">
                <McIcon :material="selectedItem.resolvedMaterial" :icon-url="selectedItem.resolvedIconPath" :size="120" color="info" />
              </v-sheet>
            </v-col>
            <v-col cols="12" md="7">
              <div class="d-flex flex-wrap ga-2 mb-4">
                <v-chip :color="auctionStatusMeta(selectedItem).color" variant="tonal">{{ auctionStatusMeta(selectedItem).label }}</v-chip>
                <v-chip color="info" variant="tonal">拍卖</v-chip>
                <v-chip variant="tonal">{{ currencyMeta(selectedItem.currency).label }}</v-chip>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-4">{{ selectedItem.remark || selectedItem.description }}</p>
              <v-list density="compact" lines="one" class="border rounded-lg">
                <v-list-item v-if="selectedItem.sellerName" title="卖家" :subtitle="selectedItem.sellerName">
                  <template #prepend>
                    <v-avatar size="32">
                      <v-img :src="`https://nmsr.nickac.dev/face/${encodeURIComponent(selectedItem.sellerName)}`" :alt="selectedItem.sellerName"></v-img>
                    </v-avatar>
                  </template>
                </v-list-item>
                <v-list-item title="当前出价" :subtitle="formatMoney(selectedItem.currentBid, selectedItem.currency)">
                  <template #prepend><v-icon>mdi-gavel</v-icon></template>
                </v-list-item>
                <v-list-item title="最低加价" :subtitle="formatMoney(selectedItem.minIncrement, selectedItem.currency)">
                  <template #prepend><v-icon>mdi-trending-up</v-icon></template>
                </v-list-item>
                <v-list-item title="出价次数" :subtitle="`${selectedItem.bidCount} 次`">
                  <template #prepend><v-icon>mdi-account-multiple-outline</v-icon></template>
                </v-list-item>
                <v-list-item title="最高出价者" :subtitle="selectedItem.highestBidder ?? '暂无出价'">
                  <template #prepend><v-icon>mdi-account-star-outline</v-icon></template>
                </v-list-item>
                <v-list-item title="结束时间" :subtitle="formatCountdown(selectedItem.endsAt)">
                  <template #prepend><v-icon>mdi-timer-outline</v-icon></template>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 flex-shrink-0">
          <v-btn variant="text" @click="detailDialog = false">关闭</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-gavel" :disabled="!isAuctionActive(selectedItem)" @click="openBidDialog(selectedItem)">出价</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bid dialog -->
    <v-dialog v-model="bidDialog" max-width="520">
      <v-card v-if="selectedItem" class="dialog-card">
        <v-card-title class="d-flex align-center flex-shrink-0">
          <v-icon color="primary" class="mr-2">mdi-gavel</v-icon>
          确认出价
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="bidDialog = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="dialog-card__content">
          <v-list density="compact" class="mb-4 border rounded-lg">
            <v-list-item :title="selectedItem.title" :subtitle="selectedItem.sellerName">
              <template #prepend>
                <v-avatar rounded="lg" size="48" class="product-icon-surface">
                  <McIcon :material="selectedItem.resolvedMaterial" :icon-url="selectedItem.resolvedIconPath" :size="40" color="info" />
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>

          <v-text-field
            v-model.number="bidAmount"
            label="你的出价"
            type="number"
            :min="minimumBid"
            variant="outlined"
            density="comfortable"
            :prepend-inner-icon="currencyMeta(selectedItem.currency).icon"
            hide-details="auto"
            class="mb-3"
            @blur="normalizeBidAmount"
          ></v-text-field>

          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip v-for="step in bidQuickSteps" :key="step" color="primary" variant="tonal" @click="bidAmount = minimumBid + step">
              +{{ step.toLocaleString() }}
            </v-chip>
          </div>

          <v-table density="comfortable" class="border rounded-lg mb-4">
            <tbody>
              <tr><td>当前出价</td><td class="text-right">{{ formatMoney(selectedItem.currentBid, selectedItem.currency) }}</td></tr>
              <tr><td>最低加价</td><td class="text-right">{{ formatMoney(selectedItem.minIncrement, selectedItem.currency) }}</td></tr>
              <tr><td class="font-weight-bold">最低可出价</td><td class="text-right font-weight-bold">{{ formatMoney(minimumBid, selectedItem.currency) }}</td></tr>
              <tr><td>当前余额</td><td class="text-right">{{ formatMoney(currentBalance, selectedItem.currency) }}</td></tr>
              <tr>
                <td>冻结后余额</td>
                <td class="text-right font-weight-bold" :class="afterBidBalance < 0 ? 'text-error' : 'text-success'">{{ formatMoney(afterBidBalance, selectedItem.currency) }}</td>
              </tr>
              <tr><td>结束时间</td><td class="text-right">{{ formatCountdown(selectedItem.endsAt) }}</td></tr>
            </tbody>
          </v-table>

          <v-alert v-if="normalizedBidAmount < minimumBid" type="error" variant="tonal" density="comfortable" text="出价金额低于最低可出价。"></v-alert>
          <v-alert v-else-if="afterBidBalance < 0" type="error" variant="tonal" density="comfortable" text="钱包余额不足，无法冻结本次出价金额。"></v-alert>
          <v-alert v-else type="info" variant="tonal" density="comfortable" text="出价成功后将冻结对应余额，若被超出价则自动解冻。"></v-alert>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 flex-shrink-0">
          <v-btn variant="text" @click="bidDialog = false">取消</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-gavel" :loading="submitting" :disabled="!canConfirmBid" @click="confirmBid">确认出价</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="bottom right">
      {{ snackbarText }}
      <template #actions><v-btn variant="text" @click="snackbar = false">关闭</v-btn></template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { shopApi } from '@/api/shop'
import { shopCoin, gameCoin, username, shopCoinName, shopCoinShort, gameCoinName, gameCoinShort } from '@/api/authStore'
import McIcon from '@/components/McIcon.vue'
import { resolveListingDisplayVisual } from '@/utils/displayVisual'

type CurrencyCode = 'SHOP_COIN' | 'GAME_COIN'
type ProductViewMode = 'grid' | 'list'

type AuctionItem = {
  id: string
  title: string
  description: string
  remark?: string
  imageUrl: string
  currency: CurrencyCode
  currentBid: number
  minIncrement: number
  bidCount: number
  endsAt: string
  highestBidder?: string
  sellerName?: string
  tags: string[]
  resolvedMaterial: string
  resolvedIconPath: string
}

const auctions = ref<AuctionItem[]>([])
const loading = ref(false)
const submitting = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const searchQuery = ref('')
const selectedCurrency = ref<CurrencyCode | 'ALL'>('ALL')
const selectedSort = ref<'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'ENDS_SOON'>('POPULAR')
const viewMode = ref<ProductViewMode>('grid')
const advancedFilterPanel = ref<string | null>(null)
const selectedTags = ref<string[]>([])
const statusFilter = ref<'ALL' | 'ACTIVE' | 'ENDED'>('ACTIVE')
const ownershipFilter = ref<'ALL' | 'HIDE_SELF'>('HIDE_SELF')
const selectedItem = ref<AuctionItem | null>(null)
const detailDialog = ref(false)
const bidDialog = ref(false)
const bidAmount = ref(0)

const bidQuickSteps = [200, 500, 1000, 2000]

const sortOptions = [
  { title: '默认推荐', value: 'POPULAR' },
  { title: '当前价低到高', value: 'PRICE_ASC' },
  { title: '当前价高到低', value: 'PRICE_DESC' },
  { title: '即将结束', value: 'ENDS_SOON' },
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

const statusOptions = [
  { title: '进行中', value: 'ACTIVE' },
  { title: '全部', value: 'ALL' },
  { title: '已结束', value: 'ENDED' },
]

const ownershipOptions = [
  { title: '显示全部', value: 'ALL' },
  { title: '隐藏本人拍卖', value: 'HIDE_SELF' },
]

const availableTags = computed(() => {
  const tags = new Set<string>()
  auctions.value.forEach((a) => a.tags.forEach((t) => tags.add(t)))
  return Array.from(tags)
})

const filteredAuctions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const list = auctions.value.filter((a) => {
    const active = isAuctionActive(a)
    const currMatch = selectedCurrency.value === 'ALL' || a.currency === selectedCurrency.value
    const qMatch = !q || a.title.toLowerCase().includes(q) || a.sellerName?.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q))
    const tagMatch = selectedTags.value.length === 0 || selectedTags.value.some((t) => a.tags.includes(t))
    const statusMatch = statusFilter.value === 'ALL' || (statusFilter.value === 'ACTIVE' ? active : !active)
    const ownMatch = ownershipFilter.value === 'ALL' || a.sellerName !== username.value
    return currMatch && qMatch && tagMatch && statusMatch && ownMatch
  })
  return [...list].sort((a, b) => {
    if (selectedSort.value === 'PRICE_ASC') return a.currentBid - b.currentBid
    if (selectedSort.value === 'PRICE_DESC') return b.currentBid - a.currentBid
    if (selectedSort.value === 'ENDS_SOON') return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
    return Number(isAuctionActive(b)) - Number(isAuctionActive(a))
  })
})

const currentBalance = computed(() => {
  if (!selectedItem.value) return 0
  return selectedItem.value.currency === 'SHOP_COIN' ? shopCoin.value : gameCoin.value
})

const minimumBid = computed(() => {
  if (!selectedItem.value) return 0
  return selectedItem.value.currentBid + selectedItem.value.minIncrement
})

const normalizedBidAmount = computed(() => {
  const v = Number(bidAmount.value)
  return Number.isFinite(v) ? Math.max(Math.floor(v), 0) : 0
})

const afterBidBalance = computed(() => currentBalance.value - normalizedBidAmount.value)

const canConfirmBid = computed(() =>
  Boolean(selectedItem.value && isAuctionActive(selectedItem.value) && normalizedBidAmount.value >= minimumBid.value && afterBidBalance.value >= 0 && !submitting.value)
)

function currencyMeta(currency: CurrencyCode) {
  return currency === 'SHOP_COIN'
    ? { label: `${shopCoinName.value} ${shopCoinShort.value}`, short: shopCoinShort.value, icon: 'mdi-database-outline', color: 'primary' }
    : { label: `${gameCoinName.value} ${gameCoinShort.value}`, short: gameCoinShort.value, icon: 'mdi-sword-cross', color: 'success' }
}

function isAuctionActive(item: AuctionItem) {
  return new Date(item.endsAt).getTime() > Date.now()
}

function auctionStatusMeta(item: AuctionItem) {
  return isAuctionActive(item) ? { label: '拍卖中', color: 'info' } : { label: '已结束', color: 'error' }
}

function formatMoney(value: number, currency: CurrencyCode) {
  return `${value.toLocaleString()} ${currencyMeta(currency).short}`
}

function formatCountdown(value: string) {
  const diff = new Date(value).getTime() - Date.now()
  if (!Number.isFinite(diff)) return '时间未知'
  if (diff <= 0) return '已结束'
  const min = 60000, hour = 3600000, day = 86400000
  if (diff < hour) return `${Math.ceil(diff / min)} 分钟后`
  if (diff < day) return `${Math.floor(diff / hour)} 小时后`
  return `${Math.floor(diff / day)} 天后`
}

function normalizeBidAmount() {
  bidAmount.value = Math.max(normalizedBidAmount.value, minimumBid.value)
}

function showSnackbar(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

function openDetail(item: AuctionItem) {
  selectedItem.value = item
  detailDialog.value = true
}

function openBidDialog(item: AuctionItem) {
  selectedItem.value = item
  bidAmount.value = item.currentBid + item.minIncrement
  detailDialog.value = false
  bidDialog.value = true
}

async function loadAuctions() {
  loading.value = true
  try {
    const res = await shopApi.getMarketListings({ mode: 'AUCTION' })
    const raw = res.data?.data ?? res.data ?? []
    const list: any[] = Array.isArray(raw) ? raw : (raw.list ?? raw.listings ?? [])
    const auctionList = list.filter((item: any) => item.tradeMode === 'AUCTION')
    auctions.value = auctionList.map((item: any) => {
      const visual = resolveListingDisplayVisual(item, item.itemName ?? item.name ?? item.title ?? '')
      return {
        ...item,
        id: String(item.id ?? item.listingId ?? Math.random()),
        title: visual.title,
        resolvedMaterial: visual.material,
        resolvedIconPath: visual.forceIconPath,
        description: item.remark ?? item.description ?? '',
        remark: item.remark ?? '',
        imageUrl: item.itemIcon ?? item.imageUrl ?? item.icon ?? '',
        currency: (item.currency ?? 'GAME_COIN') as CurrencyCode,
        currentBid: Number(item.auctionCurrentBid ?? item.currentBid ?? item.startingPrice ?? item.price ?? 0),
        minIncrement: Number(item.auctionMinIncrement ?? item.minIncrement ?? item.bidIncrement ?? 100),
        bidCount: Number(item.auctionBidCount ?? item.bidCount ?? 0),
        endsAt: item.auctionEndsAt ?? item.endsAt ?? item.endTime ?? new Date(Date.now() + 3600000).toISOString(),
        highestBidder: item.auctionHighestBidder ?? item.highestBidder ?? undefined,
        sellerName: item.sellerName ?? item.seller ?? item.username ?? undefined,
        tags: Array.isArray(item.tags) ? item.tags : (item.tag ? [item.tag] : []),
      }
    })
  } catch (err) {
    console.error('Failed to load auctions:', err)
    showSnackbar('加载拍卖失败，请重试', 'error')
  } finally {
    loading.value = false
  }
}

async function confirmBid() {
  if (!selectedItem.value || !canConfirmBid.value) return
  submitting.value = true
  try {
    await shopApi.bidMarketListing({
      listingId: selectedItem.value.id,
      bidAmount: normalizedBidAmount.value,
    })
    bidDialog.value = false
    showSnackbar(`已对 ${selectedItem.value.title} 出价 ${formatMoney(normalizedBidAmount.value, selectedItem.value.currency)}`)
    await loadAuctions()
  } catch (err: any) {
    showSnackbar(err?.response?.data?.message ?? '出价失败', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(loadAuctions)
</script>

<style scoped>
.line-clamp-2 { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
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
