<template>
  <v-container fluid class="pa-4 pa-md-6" style="max-width: 1400px; min-height: 100vh;">
    <v-card variant="outlined" class="mb-4 mb-md-6">
      <v-card-text class="pa-3 pa-sm-4">
        <v-row align="center" dense>
          <v-col cols="12" md="5">
            <v-text-field
              v-model="searchQuery"
              label="搜索商品"
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
              :loading="refreshing"
              @click="refreshProducts"
            >
              刷新
            </v-btn>
          </v-col>
        </v-row>

        <v-expansion-panels
          v-model="advancedFilterPanel"
          variant="accordion"
          class="mt-4"
        >
          <v-expansion-panel value="advanced">
            <v-expansion-panel-title>
              高级筛选
            </v-expansion-panel-title>
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
          <v-chip-group
            v-model="selectedTags"
            column
            multiple
            selected-class="text-primary font-weight-bold"
          >
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
        </div>
      </v-card-text>
    </v-card>

    <template v-if="filteredProducts.length > 0">
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
            <v-sheet
              class="product-icon-surface product-card-media d-flex align-center justify-center pa-4"
              min-height="136"
            >
              <v-img
                :src="product.imageUrl"
                :alt="product.title"
                class="product-card-image"
                width="88"
                height="88"
                contain
              >
                <template #placeholder>
                  <v-skeleton-loader type="avatar" width="88" height="88"></v-skeleton-loader>
                </template>
              </v-img>
            </v-sheet>

            <v-card-item>
              <template #title>
                <div class="text-subtitle-1 font-weight-bold text-truncate">
                  {{ product.title }}
                </div>
              </template>
              <template v-if="productSubtitle(product)" #subtitle>
                <span>{{ productSubtitle(product) }}</span>
              </template>
              <template #append>
                <v-chip
                  :color="availabilityMeta(product).color"
                  size="small"
                  variant="tonal"
                >
                  {{ availabilityMeta(product).label }}
                </v-chip>
              </template>
            </v-card-item>

            <v-card-text class="pt-0 flex-grow-1">
              <div class="text-body-2 text-medium-emphasis line-clamp-2 mb-3">
                {{ product.description }}
              </div>
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-if="product.tradeType !== 'PURCHASE'"
                  :color="tradeMeta(product).color"
                  size="x-small"
                  variant="tonal"
                >
                  {{ tradeMeta(product).label }}
                </v-chip>
                <v-chip
                  v-for="tag in product.tags"
                  :key="tag"
                  size="x-small"
                  variant="tonal"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="px-4 py-3">
              <div>
                <div class="product-price-label text-medium-emphasis">{{ priceLabel(product) }}</div>
                <div class="product-price-value">
                  <v-icon :color="currencyMeta(product.currency).color" size="18" class="mr-1">
                    {{ currencyMeta(product.currency).icon }}
                  </v-icon>
                  <span :class="`text-${currencyMeta(product.currency).color}`">
                    {{ displayPrice(product).toLocaleString() }}
                  </span>
                </div>
              </div>
              <v-spacer></v-spacer>
              <v-btn
                variant="text"
                color="primary"
                @click.stop="openDetail(product)"
              >
                详情
              </v-btn>
              <v-btn
                variant="flat"
                color="primary"
                :disabled="!canStartTrade(product)"
                @click.stop="openPrimaryAction(product)"
              >
                {{ primaryActionLabel(product) }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-else-if="viewMode === 'list'" variant="outlined">
        <v-list lines="two" class="py-0">
          <template v-for="(product, index) in filteredProducts" :key="product.id">
            <v-list-item
              class="py-4"
              @click="openDetail(product)"
            >
              <template #prepend>
                <v-sheet
                  class="product-icon-surface product-list-media d-flex align-center justify-center rounded-lg mr-3 mr-sm-4"
                  width="64"
                  height="64"
                >
                  <v-img
                    :src="product.imageUrl"
                    :alt="product.title"
                    class="product-list-image"
                    width="44"
                    height="44"
                    contain
                  ></v-img>
                </v-sheet>
              </template>

              <div class="d-flex flex-column flex-md-row align-md-center ga-3 w-100">
                <div class="flex-grow-1 min-width-0">
                  <div class="d-flex align-center flex-wrap ga-2 mb-1">
                    <div class="text-subtitle-1 font-weight-bold text-truncate">
                      {{ product.title }}
                    </div>
                    <v-chip
                      :color="availabilityMeta(product).color"
                      size="small"
                      variant="tonal"
                    >
                      {{ availabilityMeta(product).label }}
                    </v-chip>
                  </div>
                  <div v-if="productSubtitle(product)" class="text-caption text-medium-emphasis mb-1">
                    {{ productSubtitle(product) }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis line-clamp-2 mb-2">
                    {{ product.description }}
                  </div>
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-if="product.tradeType !== 'PURCHASE'"
                      :color="tradeMeta(product).color"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ tradeMeta(product).label }}
                    </v-chip>
                    <v-chip
                      v-for="tag in product.tags"
                      :key="tag"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                </div>

                <div class="d-flex align-center justify-space-between justify-md-end ga-2 flex-wrap product-list-actions">
                  <div class="text-md-right mr-md-2">
                    <div class="product-price-label text-medium-emphasis">{{ priceLabel(product) }}</div>
                    <div class="product-price-value text-no-wrap">
                      <v-icon :color="currencyMeta(product.currency).color" size="18" class="mr-1">
                        {{ currencyMeta(product.currency).icon }}
                      </v-icon>
                      <span :class="`text-${currencyMeta(product.currency).color}`">
                        {{ displayPrice(product).toLocaleString() }}
                      </span>
                    </div>
                  </div>
                  <div class="product-list-cta">
                    <v-btn
                      variant="text"
                      color="primary"
                      @click.stop="openDetail(product)"
                    >
                      详情
                    </v-btn>
                    <v-btn
                      variant="flat"
                      color="primary"
                      :disabled="!canStartTrade(product)"
                      @click.stop="openPrimaryAction(product)"
                    >
                      {{ primaryActionLabel(product) }}
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
      icon="mdi-package-variant-closed"
      title="未找到匹配商品"
      text="调整搜索关键词、币种或排序条件后再试。"
      class="border rounded-lg"
    ></v-empty-state>

    <v-dialog v-model="detailDialog" max-width="760">
      <v-card v-if="selectedProduct" class="dialog-card">
        <v-card-title class="d-flex align-center flex-shrink-0">
          <v-icon color="primary" class="mr-2">mdi-package-variant-closed</v-icon>
          <span class="text-truncate">{{ selectedProduct.title }}</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="detailDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="dialog-card__content">
          <v-row>
            <v-col cols="12" md="5">
              <v-sheet
                class="product-icon-surface product-detail-media d-flex align-center justify-center pa-3 pa-sm-4 pa-md-5 rounded-lg"
              >
                <v-img
                  :src="selectedProduct.imageUrl"
                  :alt="selectedProduct.title"
                  class="product-detail-image"
                  contain
                ></v-img>
              </v-sheet>
            </v-col>

            <v-col cols="12" md="7">
              <div class="d-flex flex-wrap ga-2 mb-4">
                <v-chip :color="availabilityMeta(selectedProduct).color" variant="tonal">
                  {{ availabilityMeta(selectedProduct).label }}
                </v-chip>
                <v-chip
                  v-if="selectedProduct.tradeType !== 'PURCHASE'"
                  :color="tradeMeta(selectedProduct).color"
                  variant="tonal"
                >
                  {{ tradeMeta(selectedProduct).label }}
                </v-chip>
                <v-chip color="primary" variant="tonal">{{ selectedProduct.type }}</v-chip>
                <v-chip variant="tonal">{{ currencyMeta(selectedProduct.currency).label }}</v-chip>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ selectedProduct.detail }}
              </p>

              <v-list density="compact" lines="one" class="border rounded-lg">
                <v-list-item v-if="selectedProduct.seller" title="卖家" :subtitle="selectedProduct.seller.name">
                  <template #prepend>
                    <v-avatar size="32">
                      <v-img
                        :src="sellerAvatarUrl(selectedProduct.seller.mcUsername)"
                        :alt="selectedProduct.seller.name"
                      ></v-img>
                    </v-avatar>
                  </template>
                </v-list-item>
                <v-list-item title="上架时间" :subtitle="formatRelativeTime(selectedProduct.listedAt)">
                  <template #prepend>
                    <v-icon>mdi-clock-outline</v-icon>
                  </template>
                </v-list-item>
                <template v-if="selectedProduct.tradeType === 'AUCTION' && selectedProduct.auction">
                  <v-list-item title="当前出价" :subtitle="formatMoney(selectedProduct.auction.currentBid, selectedProduct.currency)">
                    <template #prepend>
                      <v-icon>mdi-gavel</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item title="最低加价" :subtitle="formatMoney(selectedProduct.auction.minIncrement, selectedProduct.currency)">
                    <template #prepend>
                      <v-icon>mdi-trending-up</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item title="出价次数" :subtitle="`${selectedProduct.auction.bidCount} 次`">
                    <template #prepend>
                      <v-icon>mdi-account-multiple-outline</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item title="最高出价者" :subtitle="selectedProduct.auction.highestBidder ?? '暂无出价'">
                    <template #prepend>
                      <v-icon>mdi-account-star-outline</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item title="结束时间" :subtitle="formatCountdown(selectedProduct.auction.endsAt)">
                    <template #prepend>
                      <v-icon>mdi-timer-outline</v-icon>
                    </template>
                  </v-list-item>
                </template>
                <template v-else-if="selectedProduct.tradeType === 'RECYCLE' && selectedProduct.recycle">
                  <v-list-item title="可回收数量" :subtitle="`${selectedProduct.recycle.ownedQuantity} 件`">
                    <template #prepend>
                      <v-icon>mdi-package-variant</v-icon>
                    </template>
                  </v-list-item>
                </template>
                <template v-else>
                  <v-list-item title="库存" :subtitle="stockLabel(selectedProduct)">
                    <template #prepend>
                      <v-icon>mdi-archive-outline</v-icon>
                    </template>
                  </v-list-item>
                  <v-list-item v-if="selectedProduct.purchaseLimit" title="限购" :subtitle="`${selectedProduct.purchaseLimit} 件`">
                    <template #prepend>
                      <v-icon>mdi-counter</v-icon>
                    </template>
                  </v-list-item>
                </template>
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
            :prepend-icon="primaryActionIcon(selectedProduct)"
            :disabled="!canStartTrade(selectedProduct)"
            @click="openPrimaryAction(selectedProduct)"
          >
            {{ primaryActionLabel(selectedProduct) }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="purchaseDialog" max-width="520">
      <v-card v-if="selectedProduct && selectedProduct.tradeType === 'PURCHASE'" class="dialog-card">
        <v-card-title class="d-flex align-center flex-shrink-0">
          <v-icon color="primary" class="mr-2">mdi-cart-check</v-icon>
          确认购买
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="purchaseDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="dialog-card__content">
          <v-list density="compact" class="mb-4 border rounded-lg">
            <v-list-item :title="selectedProduct.title" :subtitle="productSubtitle(selectedProduct) || undefined">
              <template #prepend>
                <v-avatar rounded="lg" size="48" class="product-icon-surface">
                  <v-img :src="selectedProduct.imageUrl" :alt="selectedProduct.title"></v-img>
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
                <td class="text-right font-weight-bold">
                  {{ formatMoney(totalPrice, selectedProduct.currency) }}
                </td>
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
                <td
                  class="text-right font-weight-bold"
                  :class="afterBalance < 0 ? 'text-error' : 'text-success'"
                >
                  {{ formatMoney(afterBalance, selectedProduct.currency) }}
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-alert
            v-if="afterBalance < 0"
            type="error"
            variant="tonal"
            density="comfortable"
            text="钱包余额不足，无法完成本次购买。"
          ></v-alert>
          <v-alert
            v-else
            type="success"
            variant="tonal"
            density="comfortable"
            text="余额充足，确认后将创建订单并扣除对应金额。"
          ></v-alert>
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

    <v-dialog v-model="bidDialog" max-width="520">
      <v-card v-if="selectedProduct && selectedProduct.auction" class="dialog-card">
        <v-card-title class="d-flex align-center flex-shrink-0">
          <v-icon color="primary" class="mr-2">mdi-gavel</v-icon>
          确认出价
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="bidDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="dialog-card__content">
          <v-list density="compact" class="mb-4 border rounded-lg">
            <v-list-item :title="selectedProduct.title" :subtitle="productSubtitle(selectedProduct) || undefined">
              <template #prepend>
                <v-avatar rounded="lg" size="48" class="product-icon-surface">
                  <v-img :src="selectedProduct.imageUrl" :alt="selectedProduct.title"></v-img>
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
            :prepend-inner-icon="currencyMeta(selectedProduct.currency).icon"
            hide-details="auto"
            class="mb-3"
            @blur="normalizeBidAmount"
          ></v-text-field>

          <div class="d-flex flex-wrap ga-2 mb-4">
            <v-chip
              v-for="step in bidQuickSteps"
              :key="step"
              color="primary"
              variant="tonal"
              @click="bidAmount = minimumBid + step"
            >
              +{{ step.toLocaleString() }}
            </v-chip>
          </div>

          <v-table density="comfortable" class="border rounded-lg mb-4">
            <tbody>
              <tr>
                <td>当前出价</td>
                <td class="text-right">{{ formatMoney(selectedProduct.auction.currentBid, selectedProduct.currency) }}</td>
              </tr>
              <tr>
                <td>最低加价</td>
                <td class="text-right">{{ formatMoney(selectedProduct.auction.minIncrement, selectedProduct.currency) }}</td>
              </tr>
              <tr>
                <td class="font-weight-bold">最低可出价</td>
                <td class="text-right font-weight-bold">{{ formatMoney(minimumBid, selectedProduct.currency) }}</td>
              </tr>
              <tr>
                <td>当前余额</td>
                <td class="text-right">{{ formatMoney(currentBalance, selectedProduct.currency) }}</td>
              </tr>
              <tr>
                <td>冻结后余额</td>
                <td
                  class="text-right font-weight-bold"
                  :class="afterBidBalance < 0 ? 'text-error' : 'text-success'"
                >
                  {{ formatMoney(afterBidBalance, selectedProduct.currency) }}
                </td>
              </tr>
              <tr>
                <td>结束时间</td>
                <td class="text-right">{{ formatCountdown(selectedProduct.auction.endsAt) }}</td>
              </tr>
            </tbody>
          </v-table>

          <v-alert
            v-if="normalizedBidAmount < minimumBid"
            type="error"
            variant="tonal"
            density="comfortable"
            text="出价金额低于最低可出价。"
          ></v-alert>
          <v-alert
            v-else-if="afterBidBalance < 0"
            type="error"
            variant="tonal"
            density="comfortable"
            text="钱包余额不足，无法冻结本次出价金额。"
          ></v-alert>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            density="comfortable"
            text="出价成功后将冻结对应余额，若被超出价则自动解冻。"
          ></v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-6 py-4 flex-shrink-0">
          <v-btn variant="text" @click="bidDialog = false">取消</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-gavel"
            :loading="submitting"
            :disabled="!canConfirmBid"
            @click="confirmBid"
          >
            确认出价
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="recycleDialog" max-width="520">
      <v-card v-if="selectedProduct && selectedProduct.recycle" class="dialog-card">
        <v-card-title class="d-flex align-center flex-shrink-0">
          <v-icon color="primary" class="mr-2">mdi-recycle</v-icon>
          确认回收
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="recycleDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="dialog-card__content">
          <v-list density="compact" class="mb-4 border rounded-lg">
            <v-list-item :title="selectedProduct.title" :subtitle="productSubtitle(selectedProduct) || undefined">
              <template #prepend>
                <v-avatar rounded="lg" size="48" class="product-icon-surface">
                  <v-img :src="selectedProduct.imageUrl" :alt="selectedProduct.title"></v-img>
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>

          <v-row align="center" dense class="mb-4">
            <v-col cols="12" sm="8">
              <v-slider
                v-model="recycleQuantity"
                label="回收数量"
                :min="selectedProduct.recycle.minQuantity"
                :max="maxRecycleQuantity"
                step="1"
                thumb-label
                color="primary"
                track-color="surface-variant"
                prepend-icon="mdi-recycle"
                hide-details
                @end="normalizeRecycleQuantity"
              ></v-slider>
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="recycleQuantity"
                label="数量"
                type="number"
                :min="selectedProduct.recycle.minQuantity"
                :max="maxRecycleQuantity"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                @blur="normalizeRecycleQuantity"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-table density="comfortable" class="border rounded-lg mb-4">
            <tbody>
              <tr>
                <td>回收价</td>
                <td class="text-right">{{ formatMoney(selectedProduct.price, selectedProduct.currency) }}</td>
              </tr>
              <tr>
                <td>可回收数量</td>
                <td class="text-right">{{ selectedProduct.recycle.ownedQuantity }} 件</td>
              </tr>
              <tr>
                <td class="font-weight-bold">预计获得</td>
                <td class="text-right font-weight-bold">
                  {{ formatMoney(recycleTotal, selectedProduct.currency) }}
                </td>
              </tr>
              <tr>
                <td>当前余额</td>
                <td class="text-right">{{ formatMoney(currentBalance, selectedProduct.currency) }}</td>
              </tr>
              <tr>
                <td>回收后余额</td>
                <td class="text-right font-weight-bold text-success">
                  {{ formatMoney(afterRecycleBalance, selectedProduct.currency) }}
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-alert
            type="success"
            variant="tonal"
            density="comfortable"
            text="确认后将提交回收订单，并在处理完成后发放对应金额。"
          ></v-alert>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="px-6 py-4 flex-shrink-0">
          <v-btn variant="text" @click="recycleDialog = false">取消</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-recycle"
            :loading="submitting"
            :disabled="!canConfirmRecycle"
            @click="confirmRecycle"
          >
            确认回收
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" location="bottom right">
      {{ snackbarText }}
      <template #actions>
        <v-btn variant="text" @click="snackbar = false">关闭</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { shopCoinName, shopCoinShort, gameCoinName, gameCoinShort } from '@/api/authStore'

type CurrencyCode = 'SHOP_COIN' | 'GAME_COIN'
type ClaimMethod = 'INSTANT' | 'MANUAL'
type ProductViewMode = 'grid' | 'list'
type ProductSource = 'OFFICIAL' | 'PLAYER'
type ProductTradeType = 'PURCHASE' | 'AUCTION' | 'RECYCLE'

type ProductSeller = {
  name: string
  mcUsername: string
}

type ProductAuction = {
  currentBid: number
  minIncrement: number
  bidCount: number
  endsAt: string
  highestBidder?: string
}

type ProductRecycle = {
  ownedQuantity: number
  minQuantity: number
  maxQuantity: number
}

type ProductCardItem = {
  id: string
  title: string
  sku: string
  source: ProductSource
  tradeType: ProductTradeType
  seller?: ProductSeller
  listedAt: string
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
  auction?: ProductAuction
  recycle?: ProductRecycle
}

const products = ref<ProductCardItem[]>([
  {
    id: 'portal',
    title: '建造传送门',
    sku: 'portal',
    source: 'OFFICIAL',
    tradeType: 'PURCHASE',
    listedAt: createListedAt({ days: 8 }),
    description: '快速创建可配置传送门，适合主城、活动区与副本入口。',
    detail: '购买后系统会生成一张可领取的建造服务订单。管理员审核通过后，可在指定区域创建一次传送门配置。',
    imageUrl: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/9/9b/Paper_JE2_BE2.png/revision/latest?format=original',
    price: 8000,
    currency: 'GAME_COIN',
    stock: 8,
    purchaseLimit: 2,
    tags: ['服务', '建筑', '热门'],
    type: '服务器服务',
    delivery: '订单审核后人工交付',
    purchasable: true,
  },
  {
    id: 'experience',
    title: '购买等级',
    sku: 'experience',
    source: 'OFFICIAL',
    tradeType: 'PURCHASE',
    listedAt: createListedAt({ days: 2 }),
    description: '补充经验等级，用于附魔、修复以及各类服务器玩法。',
    detail: '订单完成后，经验等级会在下一次玩家在线同步时发放到对应 Minecraft 账户。',
    imageUrl: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/6/6a/Experience_Bottle_JE2_BE2.png/revision/latest?format=original',
    price: 500,
    currency: 'GAME_COIN',
    stock: 999,
    purchaseLimit: 64,
    tags: ['消耗品', '即时发放'],
    type: '虚拟物品',
    delivery: '在线自动发货',
    purchasable: true,
  },
  {
    id: 'totem',
    title: '不死图腾',
    sku: 'totem_of_undying',
    source: 'PLAYER',
    tradeType: 'PURCHASE',
    seller: {
      name: 'Steve',
      mcUsername: 'Steve',
    },
    listedAt: createListedAt({ hours: 3, minutes: 25 }),
    description: '关键时刻保命的稀有物品，适合远征、探险与高风险战斗。',
    detail: '购买后商品会进入待领取状态。请在游戏内登录并保持背包有空位，以便自动发货。',
    imageUrl: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/2/2e/Totem_of_Undying_JE2_BE2.png/revision/latest?format=original',
    price: 1000,
    currency: 'GAME_COIN',
    stock: 12,
    purchaseLimit: 4,
    tags: ['稀有', '战斗'],
    type: '游戏物品',
    delivery: '游戏内自动发货',
    purchasable: true,
  },
  {
    id: 'elytra-auction',
    title: '鞘翅拍卖',
    sku: 'elytra_auction',
    source: 'PLAYER',
    tradeType: 'AUCTION',
    seller: {
      name: 'Notch',
      mcUsername: 'Notch',
    },
    listedAt: createListedAt({ hours: 1, minutes: 10 }),
    description: '耐久良好的稀有鞘翅，适合长途探索、主城通勤与大型建筑施工。',
    detail: '该商品以拍卖方式出售。出价成功后会冻结对应余额，拍卖结束时由最高出价者获得商品。',
    imageUrl: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/9/9d/Elytra_JE2_BE2.png/revision/latest?format=original',
    price: 0,
    currency: 'GAME_COIN',
    stock: 1,
    purchaseLimit: 1,
    tags: ['稀有', '飞行'],
    type: '游戏物品',
    delivery: '拍卖结束后自动发货',
    purchasable: true,
    auction: {
      currentBid: 2400,
      minIncrement: 200,
      bidCount: 7,
      endsAt: createFutureAt({ hours: 2, minutes: 15 }),
      highestBidder: 'Alex',
    },
  },
  {
    id: 'diamond',
    title: '回收钻石',
    sku: 'recycled_diamonds',
    source: 'OFFICIAL',
    tradeType: 'RECYCLE',
    listedAt: createListedAt({ minutes: 42 }),
    description: '将背包中的钻石按固定价格回收为网页币，适合快速整理库存与换取余额。',
    detail: '回收订单提交后，系统会校验玩家背包中的可回收物品数量，并在处理完成后发放对应网页币。',
    imageUrl: 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/e/ea/Diamond_JE3_BE3.png/revision/latest?format=original',
    price: 500,
    currency: 'SHOP_COIN',
    stock: 24,
    purchaseLimit: 16,
    tags: ['材料'],
    type: '回收项目',
    delivery: '回收完成后自动结算',
    purchasable: true,
    recycle: {
      ownedQuantity: 24,
      minQuantity: 1,
      maxQuantity: 16,
    },
  },
])

const wallets = ref<Record<CurrencyCode, number>>({
  SHOP_COIN: 194,
  GAME_COIN: 8140,
})

const searchQuery = ref('')
const selectedCurrency = ref<CurrencyCode | 'ALL'>('ALL')
const selectedSort = ref<'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC' | 'STOCK_ASC'>('POPULAR')
const viewMode = ref<ProductViewMode>('grid')
const advancedFilterPanel = ref<string | null>(null)
const selectedTags = ref<string[]>([])
const selectedCategory = ref<string | 'ALL'>('ALL')
const ownershipFilter = ref<'ALL' | 'HIDE_SELF'>('HIDE_SELF')
const selectedProduct = ref<ProductCardItem | null>(null)
const detailDialog = ref(false)
const purchaseDialog = ref(false)
const bidDialog = ref(false)
const recycleDialog = ref(false)
const quantity = ref(1)
const bidAmount = ref(0)
const recycleQuantity = ref(1)
const claimMethod = ref<ClaimMethod>('INSTANT')
const refreshing = ref(false)
const submitting = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const currencyOptions = computed(() => [
  { title: '全部币种', value: 'ALL' },
  { title: `${shopCoinName.value} ${shopCoinShort.value}`, value: 'SHOP_COIN' },
  { title: `${gameCoinName.value} ${gameCoinShort.value}`, value: 'GAME_COIN' },
])

const ownershipOptions = [
  { title: '显示全部', value: 'ALL' },
  { title: '隐藏本人商品', value: 'HIDE_SELF' },
]

const sortOptions = [
  { title: '默认推荐', value: 'POPULAR' },
  { title: '价格低到高', value: 'PRICE_ASC' },
  { title: '价格高到低', value: 'PRICE_DESC' },
  { title: '库存少到多', value: 'STOCK_ASC' },
]

const viewModeOptions: Array<{ title: string; value: ProductViewMode; icon: string }> = [
  { title: '卡片视图', value: 'grid', icon: 'mdi-view-grid-outline' },
  { title: '列表视图', value: 'list', icon: 'mdi-view-list-outline' },
]

const availableTags = computed(() => {
  const tags = new Set<string>()
  products.value.forEach((product) => {
    product.tags.forEach((tag) => tags.add(tag))
  })

  return Array.from(tags)
})

const categoryOptions = computed(() => {
  const categories = new Set<string>()
  products.value.forEach((product) => {
    if (product.type) categories.add(product.type)
  })

  return [
    { title: '全部分类', value: 'ALL' },
    ...Array.from(categories).map((category) => ({ title: category, value: category })),
  ]
})

const claimMethodOptions: Array<{ title: string; value: ClaimMethod; description: string }> = [
  {
    title: '即时到账',
    value: 'INSTANT',
    description: '订单完成后自动发放到对应账户或游戏内待收货队列。',
  },
  {
    title: '手动领取',
    value: 'MANUAL',
    description: '订单完成后保留为可领取状态，稍后由玩家自行领取。',
  },
]

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const list = products.value.filter((product) => {
    const currencyMatched = selectedCurrency.value === 'ALL' || product.currency === selectedCurrency.value
    const queryMatched = !query ||
      product.title.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
      product.seller?.name.toLowerCase().includes(query) ||
      product.seller?.mcUsername.toLowerCase().includes(query) ||
      product.tags.some((tag) => tag.toLowerCase().includes(query))
    const tagMatched = selectedTags.value.length === 0 || selectedTags.value.some((tag) => product.tags.includes(tag))
    const categoryMatched = selectedCategory.value === 'ALL' || product.type === selectedCategory.value
    const ownershipMatched = ownershipFilter.value === 'ALL' || !isSelfProduct(product)

    return currencyMatched && queryMatched && tagMatched && categoryMatched && ownershipMatched
  })

  return [...list].sort((a, b) => {
    if (selectedSort.value === 'PRICE_ASC') return displayPrice(a) - displayPrice(b)
    if (selectedSort.value === 'PRICE_DESC') return displayPrice(b) - displayPrice(a)
    if (selectedSort.value === 'STOCK_ASC') return tradeQuantity(a) - tradeQuantity(b)
    return Number(b.purchasable) - Number(a.purchasable)
  })
})

const normalizedQuantity = computed(() => {
  const value = Number(quantity.value)
  if (!Number.isFinite(value)) return 1
  return Math.min(Math.max(Math.floor(value), 1), maxQuantity.value)
})

const maxQuantity = computed(() => {
  if (!selectedProduct.value) return 1
  return Math.max(1, Math.min(selectedProduct.value.stock, selectedProduct.value.purchaseLimit))
})

const currentBalance = computed(() => {
  if (!selectedProduct.value) return 0
  return wallets.value[selectedProduct.value.currency]
})

const totalPrice = computed(() => {
  if (!selectedProduct.value) return 0
  return selectedProduct.value.price * normalizedQuantity.value
})

const taxRate = 0.06

const taxAmount = computed(() => {
  if (!selectedProduct.value) return 0
  return Math.max(0, Math.round(totalPrice.value * taxRate))
})

const settlementTotal = computed(() => totalPrice.value + taxAmount.value)

const afterBalance = computed(() => currentBalance.value - settlementTotal.value)

const canConfirmPurchase = computed(() => {
  return Boolean(
    selectedProduct.value &&
    selectedProduct.value.tradeType === 'PURCHASE' &&
    canStartTrade(selectedProduct.value) &&
    afterBalance.value >= 0 &&
    !submitting.value
  )
})

const selectedClaimMethod = computed(() => {
  return claimMethodOptions.find((option) => option.value === claimMethod.value) ?? claimMethodOptions[0]
})

const selectedAuction = computed(() => selectedProduct.value?.auction)

const selectedRecycle = computed(() => selectedProduct.value?.recycle)

const minimumBid = computed(() => {
  if (!selectedAuction.value) return 0
  return selectedAuction.value.currentBid + selectedAuction.value.minIncrement
})

const normalizedBidAmount = computed(() => {
  const value = Number(bidAmount.value)
  if (!Number.isFinite(value)) return 0
  return Math.max(Math.floor(value), 0)
})

const afterBidBalance = computed(() => currentBalance.value - normalizedBidAmount.value)

const canConfirmBid = computed(() => {
  return Boolean(
    selectedProduct.value &&
    selectedProduct.value.tradeType === 'AUCTION' &&
    selectedAuction.value &&
    canStartTrade(selectedProduct.value) &&
    normalizedBidAmount.value >= minimumBid.value &&
    afterBidBalance.value >= 0 &&
    !submitting.value
  )
})

const maxRecycleQuantity = computed(() => {
  if (!selectedRecycle.value) return 1
  return Math.max(
    selectedRecycle.value.minQuantity,
    Math.min(selectedRecycle.value.ownedQuantity, selectedRecycle.value.maxQuantity),
  )
})

const normalizedRecycleQuantity = computed(() => {
  const value = Number(recycleQuantity.value)
  const min = selectedRecycle.value?.minQuantity ?? 1
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(Math.floor(value), min), maxRecycleQuantity.value)
})

const recycleTotal = computed(() => {
  if (!selectedProduct.value) return 0
  return selectedProduct.value.price * normalizedRecycleQuantity.value
})

const afterRecycleBalance = computed(() => currentBalance.value + recycleTotal.value)

const canConfirmRecycle = computed(() => {
  return Boolean(
    selectedProduct.value &&
    selectedProduct.value.tradeType === 'RECYCLE' &&
    selectedRecycle.value &&
    canStartTrade(selectedProduct.value) &&
    normalizedRecycleQuantity.value >= selectedRecycle.value.minQuantity &&
    !submitting.value
  )
})

const bidQuickSteps = [200, 500, 1000]

function currencyMeta(currency: CurrencyCode) {
  if (currency === 'SHOP_COIN') {
    return { label: `${shopCoinName.value} ${shopCoinShort.value}`, short: shopCoinShort.value, icon: 'mdi-database-outline', color: 'primary' }
  }

  return { label: `${gameCoinName.value} ${gameCoinShort.value}`, short: gameCoinShort.value, icon: 'mdi-sword-cross', color: 'success' }
}

function availabilityMeta(product: ProductCardItem) {
  if (!product.purchasable) return { label: '不可操作', color: 'error' }
  if (product.tradeType === 'AUCTION') {
    return isAuctionActive(product) ? { label: '拍卖中', color: 'info' } : { label: '已结束', color: 'error' }
  }
  if (product.tradeType === 'RECYCLE') {
    return product.recycle && product.recycle.ownedQuantity > 0
      ? { label: '可回收', color: 'success' }
      : { label: '无可回收', color: 'error' }
  }
  if (!product.purchasable || product.stock <= 0) return { label: '售罄', color: 'error' }
  if (product.stock <= 10) return { label: '库存紧张', color: 'warning' }
  return { label: '可购买', color: 'success' }
}

function tradeMeta(product: ProductCardItem) {
  if (product.tradeType === 'AUCTION') return { label: '拍卖', color: 'info' }
  if (product.tradeType === 'RECYCLE') return { label: '回收', color: 'success' }
  return { label: '直购', color: 'primary' }
}

function priceLabel(product: ProductCardItem) {
  if (product.tradeType === 'AUCTION') return '当前价'
  if (product.tradeType === 'RECYCLE') return '回收价'
  return '单价'
}

function displayPrice(product: ProductCardItem) {
  return product.tradeType === 'AUCTION' && product.auction ? product.auction.currentBid : product.price
}

function primaryActionLabel(product: ProductCardItem) {
  if (product.tradeType === 'AUCTION') return '出价'
  if (product.tradeType === 'RECYCLE') return '回收'
  return '购买'
}

function primaryActionIcon(product: ProductCardItem) {
  if (product.tradeType === 'AUCTION') return 'mdi-gavel'
  if (product.tradeType === 'RECYCLE') return 'mdi-recycle'
  return 'mdi-cart-outline'
}

function tradeQuantity(product: ProductCardItem) {
  if (product.tradeType === 'RECYCLE') return product.recycle?.ownedQuantity ?? 0
  return product.stock
}

function stockLabel(product: ProductCardItem) {
  if (product.stock <= 0) return '暂无库存'
  if (product.stock >= 999) return '库存充足'
  return `${product.stock} 件`
}

function productSubtitle(product: ProductCardItem) {
  return product.source === 'PLAYER' ? product.seller?.name ?? '未知卖家' : ''
}

function isSelfProduct(product: ProductCardItem) {
  return product.source === 'PLAYER' && product.seller?.mcUsername === 'Steve'
}

function sellerAvatarUrl(mcUsername: string) {
  return `https://nmsr.nickac.dev/face/${encodeURIComponent(mcUsername)}`
}

function createListedAt(offset: { days?: number; hours?: number; minutes?: number }) {
  const milliseconds =
    (offset.days ?? 0) * 24 * 60 * 60 * 1000 +
    (offset.hours ?? 0) * 60 * 60 * 1000 +
    (offset.minutes ?? 0) * 60 * 1000

  return new Date(Date.now() - milliseconds).toISOString()
}

function createFutureAt(offset: { days?: number; hours?: number; minutes?: number }) {
  const milliseconds =
    (offset.days ?? 0) * 24 * 60 * 60 * 1000 +
    (offset.hours ?? 0) * 60 * 60 * 1000 +
    (offset.minutes ?? 0) * 60 * 1000

  return new Date(Date.now() + milliseconds).toISOString()
}

function formatRelativeTime(value: string) {
  const date = new Date(value)
  const diff = Date.now() - date.getTime()

  if (!Number.isFinite(diff) || diff < 0) return '刚刚'

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`

  return date.toLocaleDateString('zh-CN')
}

function formatCountdown(value: string) {
  const date = new Date(value)
  const diff = date.getTime() - Date.now()

  if (!Number.isFinite(diff)) return '时间未知'
  if (diff <= 0) return '已结束'

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < hour) return `${Math.ceil(diff / minute)} 分钟后`
  if (diff < day) return `${Math.floor(diff / hour)} 小时后`
  return `${Math.floor(diff / day)} 天后`
}

function isAuctionActive(product: ProductCardItem) {
  return Boolean(product.auction && new Date(product.auction.endsAt).getTime() > Date.now())
}

function canStartTrade(product: ProductCardItem) {
  if (!product.purchasable) return false
  if (product.tradeType === 'AUCTION') return isAuctionActive(product)
  if (product.tradeType === 'RECYCLE') return Boolean(product.recycle && product.recycle.ownedQuantity > 0)
  return product.stock > 0
}

function formatMoney(value: number, currency: CurrencyCode) {
  return `${value.toLocaleString()} ${currencyMeta(currency).short}`
}

function openDetail(product: ProductCardItem) {
  selectedProduct.value = product
  detailDialog.value = true
}

function openPrimaryAction(product: ProductCardItem) {
  if (product.tradeType === 'AUCTION') {
    openBid(product)
    return
  }
  if (product.tradeType === 'RECYCLE') {
    openRecycle(product)
    return
  }

  openPurchase(product)
}

function openPurchase(product: ProductCardItem) {
  selectedProduct.value = product
  quantity.value = 1
  claimMethod.value = 'INSTANT'
  detailDialog.value = false
  purchaseDialog.value = true
}

function openBid(product: ProductCardItem) {
  selectedProduct.value = product
  bidAmount.value = product.auction ? product.auction.currentBid + product.auction.minIncrement : 0
  detailDialog.value = false
  bidDialog.value = true
}

function openRecycle(product: ProductCardItem) {
  selectedProduct.value = product
  recycleQuantity.value = product.recycle?.minQuantity ?? 1
  detailDialog.value = false
  recycleDialog.value = true
}

function normalizeQuantity() {
  quantity.value = normalizedQuantity.value
}

function normalizeBidAmount() {
  bidAmount.value = Math.max(normalizedBidAmount.value, minimumBid.value)
}

function normalizeRecycleQuantity() {
  recycleQuantity.value = normalizedRecycleQuantity.value
}

function showSnackbar(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

async function refreshProducts() {
  refreshing.value = true
  await new Promise((resolve) => setTimeout(resolve, 400))
  refreshing.value = false
  showSnackbar('商品列表已刷新')
}

async function confirmPurchase() {
  if (!selectedProduct.value || !canConfirmPurchase.value) return

  submitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 600))

  const product = selectedProduct.value
  wallets.value[product.currency] = afterBalance.value
  product.stock = Math.max(0, product.stock - normalizedQuantity.value)
  purchaseDialog.value = false
  submitting.value = false
  showSnackbar(`已购买 ${product.title} x${normalizedQuantity.value}，领取方式：${selectedClaimMethod.value.title}`)
}

async function confirmBid() {
  if (!selectedProduct.value || !selectedProduct.value.auction || !canConfirmBid.value) return

  submitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 600))

  const product = selectedProduct.value
  const auction = product.auction
  if (!auction) return

  const amount = normalizedBidAmount.value
  wallets.value[product.currency] = afterBidBalance.value
  auction.currentBid = amount
  auction.bidCount += 1
  auction.highestBidder = '你'
  bidDialog.value = false
  submitting.value = false
  showSnackbar(`已对 ${product.title} 出价 ${formatMoney(amount, product.currency)}`)
}

async function confirmRecycle() {
  if (!selectedProduct.value || !selectedProduct.value.recycle || !canConfirmRecycle.value) return

  submitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 600))

  const product = selectedProduct.value
  const recycle = product.recycle
  if (!recycle) return

  wallets.value[product.currency] = afterRecycleBalance.value
  recycle.ownedQuantity = Math.max(0, recycle.ownedQuantity - normalizedRecycleQuantity.value)
  product.stock = recycle.ownedQuantity
  recycleDialog.value = false
  submitting.value = false
  showSnackbar(`已提交 ${product.title} x${normalizedRecycleQuantity.value} 的回收订单`)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-view-toggle {
  width: 100%;
}

.product-view-toggle :deep(.v-btn) {
  flex: 1 1 0;
  min-width: 0;
}

.product-price-label {
  font-size: 0.68rem;
  font-weight: 500;
  line-height: 1.1;
}

.product-price-value {
  align-items: center;
  display: flex;
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.25;
}

.product-refresh-button {
  width: 100%;
}

.product-list-cta {
  align-items: center;
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.product-icon-surface {
  background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.product-card-media {
  min-height: 136px;
}

.product-card-image,
.product-list-image,
.product-detail-image {
  flex: none;
}

@media (min-width: 960px) {
  .product-view-toggle {
    width: auto;
  }

  .product-view-toggle :deep(.v-btn) {
    flex: 0 0 auto;
    min-width: 48px;
  }

  .product-refresh-button {
    width: auto;
  }
}

.product-detail-media {
  aspect-ratio: 1;
  max-width: 208px;
  width: 100%;
}

.product-detail-image {
  height: clamp(88px, 16vw, 144px);
  width: clamp(88px, 16vw, 144px);
}

.dialog-card {
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 48px);
}

.dialog-card__content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

@media (max-width: 600px) {
  .product-detail-media {
    max-width: 136px;
  }

  .product-detail-image {
    height: 88px;
    width: 88px;
  }
}
</style>
