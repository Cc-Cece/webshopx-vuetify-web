<template>
  <admin-gate>
    <v-container fluid class="pa-6 animate-fade-in">
      <!-- Header banner -->
      <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 mb-6 glass-card header-card">
        <v-row no-gutters align="center" justify="end" class="flex-wrap">
          <v-col cols="12" class="d-flex flex-wrap justify-start justify-md-end align-center">
            <!-- Tabs Menu -->
            <v-tabs
              v-model="activeTab"
              color="success"
              density="comfortable"
              class="rounded-lg bg-grey-lighten-4 pa-1"
            >
              <v-tab value="products" prepend-icon="mdi-format-list-bulleted" class="rounded-lg font-weight-bold text-caption">{{ $t('admin.uiText.autoHtml.k020') || '商品列表' }}</v-tab>
              <v-tab value="cashier" prepend-icon="mdi-barcode-scan" class="rounded-lg font-weight-bold text-caption">{{ $t('admin.uiText.autoHtml.k0021') }}</v-tab>
              <v-tab value="orders" prepend-icon="mdi-receipt-text-outline" class="rounded-lg font-weight-bold text-caption">{{ $t('admin.uiText.tabLabelOrders') }}</v-tab>
            </v-tabs>
          </v-col>
        </v-row>
      </v-card>

      <!-- Tabs Contents -->
      <v-window v-model="activeTab">
        <!-- Products Tab -->
        <v-window-item value="products">
          <v-card elevation="0" variant="outlined" class="rounded-xl glass-card overflow-hidden">
            <!-- Table Toolbar -->
            <div class="pa-4 border-b d-flex justify-between align-center flex-wrap">
              <div class="d-flex align-center">
                <v-text-field
                  v-model="productSearch"
                  :placeholder="$t('admin.uiText.autoHtml.k0111')"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  rounded="lg"
                  clearable
                  color="success"
                  style="max-width: 320px;"
                  class="mr-3"
                ></v-text-field>

                <v-select
                  v-model="typeFilter"
                  :items="typeFilterOptions"
                  item-title="title"
                  item-value="value"
                  label="类型筛选"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  rounded="lg"
                  color="success"
                  style="width: 140px;"
                  class="mr-3"
                ></v-select>
              </div>
              <div class="mt-2 mt-sm-0">
                <v-btn
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  class="rounded-lg font-weight-bold text-caption mr-2"
                  @click="handleOpenUpsertDialog(null)"
                >
                  {{ $t('admin.uiText.autoHtml.k0195') || '新增商品' }}
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="small"
                  color="secondary"
                  icon="mdi-refresh"
                  class="rounded-lg"
                  :loading="productsLoading"
                  @click="handleLoadProducts"
                ></v-btn>
              </div>
            </div>

            <v-skeleton-loader v-if="productsLoading && products.length === 0" type="table-row-divider@8" class="bg-transparent"></v-skeleton-loader>

            <!-- Table -->
            <div v-else class="table-container overflow-y-auto" style="max-height: 540px;">
              <v-table class="bg-transparent text-slate-800">
                <thead>
                  <tr class="bg-table-header">
                    <th class="font-weight-bold text-caption text-center width-60">图标</th>
                    <th class="font-weight-bold text-caption">SKU</th>
                    <th class="font-weight-bold text-caption">商品标题</th>
                    <th class="font-weight-bold text-caption">发货类型</th>
                    <th class="font-weight-bold text-caption text-right">单价</th>
                    <th class="font-weight-bold text-caption text-center">状态</th>
                    <th class="font-weight-bold text-caption text-center">限购/库存</th>
                    <th class="font-weight-bold text-caption text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredProducts" :key="item.sku" class="hover-bg-row text-caption">
                    <td class="text-center">
                      <v-avatar size="32" rounded="lg" color="grey-lighten-4">
                        <McIcon
                          :material="item.material"
                          :icon-url="item.iconUrl"
                          :size="24"
                          color="success"
                        />
                      </v-avatar>
                    </td>
                    <td class="font-weight-bold font-mono">{{ item.sku }}</td>
                    <td class="font-weight-black">{{ item.title }}</td>
                    <td>
                      <v-chip size="x-small" :color="getTypeColor(item.type)" variant="flat" class="font-weight-bold">
                        {{ getTypeName(item.type) }}
                      </v-chip>
                    </td>
                    <td class="text-right font-weight-black" :class="item.currency === 'GAME_COIN' ? 'text-success' : 'text-primary'">
                      {{ item.price }} {{ item.currency === 'GAME_COIN' ? gameCoinShort : shopCoinShort }}
                      <v-chip v-if="item.dynamicPriceEnabled" size="x-small" color="warning" variant="tonal" class="ml-1 font-weight-bold">
                        动态
                      </v-chip>
                    </td>
                    <td class="text-center">
                      <settings-switch
                        v-model="item.active"
                        color="success"
                        hide-details
                        density="compact"
                        style="display: inline-block;"
                        @change="handleToggleActive(item)"
                      ></settings-switch>
                    </td>
                    <td class="text-center font-mono">
                      {{ item.personalBuyLimit ? `限购 ${item.personalBuyLimit}` : '无限制' }} / 
                      {{ item.maxStock ? `剩 ${item.maxStock}` : '无限' }}
                    </td>
                    <td class="text-center text-no-wrap">
                      <v-btn
                        size="x-small"
                        color="primary"
                        variant="tonal"
                        class="rounded-lg font-weight-bold text-caption mr-1"
                        prepend-icon="mdi-pencil-outline"
                        @click="handleOpenUpsertDialog(item)"
                      >
                        编辑
                      </v-btn>
                      <v-btn
                        size="x-small"
                        color="warning"
                        variant="outlined"
                        class="rounded-lg font-weight-bold text-caption mr-1"
                        @click="handleResetLimit(item)"
                      >
                        重置限购
                      </v-btn>
                    </td>
                  </tr>
                  <tr v-if="filteredProducts.length === 0">
                    <td colspan="8" class="text-center py-8 text-medium-emphasis">
                      没有找到符合条件的商品。
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </v-window-item>

        <!-- Cashier Tab -->
        <v-window-item value="cashier">
          <v-row justify="center" class="pt-6">
            <v-col cols="12" sm="8" md="6" lg="5">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 glass-card border-success-light text-center">
                <v-avatar color="success-lighten-5" size="56" class="mb-4">
                  <v-icon color="success" size="32">mdi-barcode-scan</v-icon>
                </v-avatar>
                <h3 class="text-h6 font-weight-black text-slate-800">{{ $t('admin.uiText.autoHtml.k0021') }}</h3>
                <p class="text-caption text-medium-emphasis mt-1 mb-6">
                  请输入玩家在线下或者线下支付后获取的团购兑换码（格式：GB-XXXXXXXXXXXX）进行手动核销。
                </p>

                <v-form ref="cashierFormRef" v-model="cashierValid" @submit.prevent="handleConsumeGroupBuy">
                  <v-text-field
                    v-model="groupBuyCode"
                    :label="$t('admin.uiText.autoHtml.k0125') || '团购券核销码'"
                    :placeholder="$t('admin.uiText.autoHtml.k0126')"
                    prepend-inner-icon="mdi-ticket"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-4 text-center font-mono font-weight-bold text-subtitle-1"
                    :rules="[v => !!v || '请输入团购券核销码']"
                    required
                  ></v-text-field>

                  <v-btn
                    type="submit"
                    color="success"
                    variant="flat"
                    block
                    height="46"
                    rounded="lg"
                    class="font-weight-black text-none text-subtitle-2 elevation-2"
                    :loading="cashierLoading"
                  >
                    {{ $t('admin.uiText.autoHtml.k0127') || '立即核销团购券' }}
                  </v-btn>
                </v-form>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Orders Tab -->
        <v-window-item value="orders">
          <v-card elevation="0" variant="outlined" class="rounded-xl glass-card overflow-hidden">
            <!-- Table Toolbar -->
            <div class="pa-4 border-b d-flex justify-between align-center flex-wrap">
              <div>
                <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.autoHtml.k0129') }}</h3>
                <p class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0130') }}</p>
              </div>
              <v-btn
                variant="outlined"
                size="small"
                color="secondary"
                prepend-icon="mdi-refresh"
                class="rounded-lg font-weight-bold text-caption mt-2 mt-sm-0"
                :loading="ordersLoading"
                @click="handleLoadOrders"
              >
                {{ $t('admin.uiText.autoHtml.k0131') }}
              </v-btn>
            </div>

            <!-- Table Filters -->
            <div class="pa-4 bg-grey-lighten-4 border-b">
              <v-row align="center" dense>
                <v-col cols="12" sm="4" md="3">
                  <v-text-field
                    v-model="orderSearch"
                    :placeholder="$t('admin.uiText.autoHtml.k0157')"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    rounded="lg"
                    clearable
                    color="success"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                  <v-text-field
                    v-model="orderUserSearch"
                    :placeholder="$t('admin.uiText.autoHtml.k0143')"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    rounded="lg"
                    clearable
                    color="success"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="3">
                  <v-select
                    v-model="orderStatusFilter"
                    :items="orderStatusFilterOptions"
                    item-title="title"
                    item-value="value"
                    label="订单状态"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    rounded="lg"
                    color="success"
                  ></v-select>
                </v-col>
              </v-row>
            </div>

            <v-skeleton-loader v-if="ordersLoading && orders.length === 0" type="table-row-divider@8" class="bg-transparent"></v-skeleton-loader>

            <!-- Table -->
            <div v-else class="table-container overflow-y-auto" style="max-height: 520px;">
              <v-table class="bg-transparent text-slate-800">
                <thead>
                  <tr class="bg-table-header">
                    <th class="font-weight-bold text-caption">时间</th>
                    <th class="font-weight-bold text-caption">订单号</th>
                    <th class="font-weight-bold text-caption">玩家用户</th>
                    <th class="font-weight-bold text-caption">商品项目</th>
                    <th class="font-weight-bold text-caption text-right">交易金额</th>
                    <th class="font-weight-bold text-caption text-center">状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in filteredOrders" :key="order.orderId" class="hover-bg-row text-caption">
                    <td class="font-mono text-no-wrap">{{ formatTime(order.createdAt) }}</td>
                    <td class="font-mono text-truncate" style="max-width: 130px;" :title="order.orderId">{{ order.orderId }}</td>
                    <td>
                      <div class="d-flex align-center">
                        <v-avatar size="24" class="mr-2" color="grey-lighten-4">
                          <v-img :src="`https://minotar.net/avatar/${order.username}/24`"></v-img>
                        </v-avatar>
                        <span class="font-weight-bold font-mono">{{ order.username }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex align-center">
                        <span class="font-weight-black text-slate-800">{{ order.title }}</span>
                        <v-chip size="x-small" color="grey" variant="tonal" class="ml-2 font-mono">{{ order.sku }}</v-chip>
                      </div>
                    </td>
                    <td class="text-right font-weight-black" :class="order.currency === 'GAME_COIN' ? 'text-success' : 'text-primary'">
                      {{ order.price }} {{ order.currency === 'GAME_COIN' ? gameCoinShort : shopCoinShort }}
                    </td>
                    <td class="text-center">
                      <v-chip size="x-small" :color="getOrderStatusColor(order.status)" variant="flat" class="font-weight-bold">
                        {{ getOrderStatusName(order.status) }}
                      </v-chip>
                    </td>
                  </tr>
                  <tr v-if="filteredOrders.length === 0">
                    <td colspan="6" class="text-center py-8 text-medium-emphasis">
                      没有找到符合条件的订单流水。
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </v-window-item>
      </v-window>

      <!-- Products Upsert Dialogue -->
      <v-dialog v-model="upsertDialog" max-width="850" scrollable>
        <v-card elevation="0" variant="outlined" class="rounded-xl glass-card border-card-top-success pa-4">
          <div class="d-flex align-center justify-between mb-4">
            <div class="d-flex align-center">
              <v-avatar color="success-lighten-5" size="36" class="mr-3">
                <v-icon color="success" size="18">{{ editMode ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
              </v-avatar>
              <h3 class="text-subtitle-1 font-weight-black text-slate-800">
                {{ editMode ? '编辑官方商品' : '新增官方商品' }}
              </h3>
            </div>
            <v-btn icon="mdi-close" variant="text" size="small" @click="upsertDialog = false"></v-btn>
          </div>

          <v-divider class="mb-4"></v-divider>

          <v-card-text class="pa-0 overflow-y-auto" style="max-height: 600px;">
            <v-form ref="upsertFormRef" v-model="upsertValid">
              <!-- Basic fields section -->
              <h4 class="text-caption font-weight-black text-success mb-3">1. {{ $t('admin.uiText.autoHtml.k0022') }}</h4>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formProduct.sku"
                    :label="$t('admin.uiText.autoHtml.k0023')"
                    :placeholder="$t('admin.uiText.autoHtml.k0024')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                    :disabled="editMode"
                    :rules="[v => !!v || '请输入 SKU 唯一标识']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formProduct.title"
                    :label="$t('admin.uiText.autoHtml.k0025')"
                    :placeholder="$t('admin.uiText.autoHtml.k0026')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                    :rules="[v => !!v || '请输入商品标题']"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row dense>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model.number="formProduct.price"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0027')"
                    placeholder="100"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                    :rules="[v => v !== null && v !== undefined || '请输入价格']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="formProduct.currency"
                    :items="currencyOptions"
                    item-title="title"
                    item-value="value"
                    :label="$t('admin.uiText.autoHtml.k0028')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="formProduct.type"
                    :items="productTypeOptions"
                    item-title="title"
                    item-value="value"
                    :label="$t('admin.uiText.autoHtml.k0067')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                  ></v-select>
                </v-col>
              </v-row>

              <!-- Conditionally rendered based on Type -->
              <h4 class="text-caption font-weight-black text-success mb-3 mt-2">2. 发货及策略参数</h4>
              
              <!-- Command template -->
              <v-expand-transition>
                <div v-if="formProduct.type === 'COMMAND'">
                  <v-text-field
                    v-model="formProduct.commandTemplate"
                    :label="$t('admin.uiText.autoHtml.k0076')"
                    :placeholder="$t('admin.uiText.autoHtml.k0077')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                    :rules="[v => !!v || '请输入指令发货模板']"
                  ></v-text-field>
                </div>
              </v-expand-transition>

              <!-- Potion type parameters -->
              <v-expand-transition>
                <div v-if="formProduct.type === 'POTION'">
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="formProduct.potionType"
                        :label="$t('admin.uiText.autoHtml.k0091')"
                        :placeholder="$t('admin.uiText.autoHtml.k0092')"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3"
                        :rules="[v => !!v || '请输入药水效果类型']"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <v-text-field
                        v-model.number="formProduct.potionDurationSeconds"
                        type="number"
                        :label="$t('admin.uiText.autoHtml.k0093')"
                        placeholder="300"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <v-text-field
                        v-model.number="formProduct.potionAmplifier"
                        type="number"
                        :label="$t('admin.uiText.autoHtml.k0094')"
                        placeholder="0"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </div>
              </v-expand-transition>

              <!-- Standard material block -->
              <v-expand-transition>
                <div v-if="formProduct.type === 'GIVE_ITEM' || formProduct.type === 'RECYCLE_ITEM'">
                  <v-row dense>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="formProduct.material"
                        :label="$t('admin.uiText.autoHtml.k0078')"
                        :placeholder="$t('admin.uiText.autoHtml.k0079')"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3"
                        :rules="[v => !!v || '请输入物品材质 Key']"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="formProduct.materialOverrideDisplay"
                        :label="$t('admin.uiText.autoHtml.k0080')"
                        :placeholder="$t('admin.uiText.autoHtml.k0081')"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="formProduct.materialOverrideName"
                        :label="$t('admin.uiText.autoHtml.k0082')"
                        :placeholder="$t('admin.uiText.autoHtml.k0083')"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </div>
              </v-expand-transition>

              <!-- Stock & limits -->
              <v-row dense>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model.number="formProduct.maxStock"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0100')"
                    placeholder="无限"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model.number="formProduct.personalBuyLimit"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0101')"
                    :placeholder="$t('admin.uiText.autoHtml.k0102')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" class="d-flex align-center">
                  <settings-switch
                    v-model="formProduct.active"
                    color="success"
                    :label="formProduct.active ? '上架在售' : '停用库藏'"
                    density="comfortable"
                    hide-details
                  ></settings-switch>
                </v-col>
              </v-row>

              <v-text-field
                v-model="formProduct.description"
                :label="$t('admin.uiText.autoHtml.k0095')"
                :placeholder="$t('admin.uiText.autoHtml.k0096')"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="success"
                class="mb-3"
              ></v-text-field>

              <!-- Dynamic Pricing Box -->
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 bg-grey-lighten-4 mb-4 mt-2 border-warning-dashed">
                <div class="d-flex align-center mb-3">
                  <settings-switch
                    v-model="formProduct.dynamicPriceEnabled"
                    color="warning"
                    :label="$t('admin.uiText.autoHtml.k0035')"
                    hide-details
                    density="comfortable"
                    class="mr-4"
                  ></settings-switch>
                  <span class="text-caption text-medium-emphasis">基于供需算法动态计算交易价，避免通胀爆仓。</span>
                </div>

                <v-expand-transition>
                  <div v-if="formProduct.dynamicPriceEnabled">
                    <v-row dense>
                      <v-col cols="12" sm="6">
                        <v-select
                          v-model="formProduct.dynamicAlgorithm"
                          :items="pricingAlgorithms"
                          item-title="title"
                          item-value="value"
                          :label="$t('admin.uiText.autoHtml.k0038')"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          color="warning"
                          class="mb-3"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model.number="formProduct.priceStep"
                          type="number"
                          :label="$t('admin.uiText.autoHtml.k0052')"
                          :placeholder="$t('admin.uiText.autoHtml.k0053')"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          color="warning"
                          class="mb-3"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <v-row dense>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model.number="formProduct.floorPrice"
                          type="number"
                          :label="$t('admin.uiText.autoHtml.k0048')"
                          :placeholder="$t('admin.uiText.autoHtml.k0049')"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          color="warning"
                          class="mb-3"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model.number="formProduct.ceilPrice"
                          type="number"
                          :label="$t('admin.uiText.autoHtml.k0050')"
                          :placeholder="$t('admin.uiText.autoHtml.k0051')"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          color="warning"
                          class="mb-3"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model.number="formProduct.baseStock"
                          type="number"
                          label="锚定基础库存 (baseStock)"
                          placeholder="留空自动回退"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          color="warning"
                          class="mb-3"
                        ></v-text-field>
                      </v-col>
                    </v-row>

                    <!-- Advanced JSON parameters overrides -->
                    <v-textarea
                      v-model="rawPricingParams"
                      :label="$t('admin.uiText.autoHtml.k0061')"
                      :placeholder="$t('admin.uiText.autoHtml.k0062')"
                      variant="outlined"
                      density="comfortable"
                      rounded="lg"
                      color="warning"
                      rows="2"
                      hide-details
                      class="font-mono mt-1"
                    ></v-textarea>
                  </div>
                </v-expand-transition>
              </v-card>

              <!-- Upload icon panel if edit mode -->
              <v-fade-transition>
                <v-card v-if="editMode" elevation="0" variant="outlined" class="rounded-xl pa-4 bg-grey-lighten-4 mb-4">
                  <h4 class="text-caption font-weight-black text-slate-800 mb-2">{{ $t('admin.uiText.autoHtml.k0084') }}</h4>
                  <div class="d-flex align-center flex-wrap">
                    <v-avatar size="64" rounded="lg" color="white" class="mr-4 border">
                      <McIcon
                        :material="formProduct.material"
                        :icon-url="formProduct.iconUrl"
                        :size="48"
                        color="success"
                      />
                    </v-avatar>
                    <div class="my-2">
                      <v-file-input
                        label="选择自定义商品图标"
                        accept="image/*"
                        variant="outlined"
                        density="compact"
                        rounded="lg"
                        color="success"
                        hide-details
                        class="mb-2"
                        style="width: 250px;"
                        @update:model-value="handleIconFileSelect"
                      ></v-file-input>
                      <p class="text-caption text-medium-emphasis">支持 png、jpg、webp。选中后会自动同步上传。</p>
                    </div>
                  </div>
                </v-card>
              </v-fade-transition>
            </v-form>
          </v-card-text>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-end">
            <v-btn
              color="secondary"
              variant="tonal"
              class="rounded-lg font-weight-bold text-caption mr-2"
              @click="upsertDialog = false"
            >
              取消
            </v-btn>
            <v-btn
              color="success"
              variant="flat"
              class="rounded-lg font-weight-bold text-caption"
              :loading="upsertLoading"
              @click="handleSaveProduct"
            >
              {{ $t('admin.uiText.autoHtml.k0107') }}
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- SnackBar Toast -->
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
  </admin-gate>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminGate from '@/components/AdminGate.vue'
import McIcon from '@/components/McIcon.vue'
import { adminApi } from '@/api/admin'
import {
  shopCoinName,
  shopCoinShort,
  gameCoinName,
  gameCoinShort
} from '@/api/authStore'

const { t } = useI18n()

// Active sub-tab switcher
const activeTab = ref<'products' | 'cashier' | 'orders'>('products')

// SnackBar
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const showSnackbar = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// 1. Product management shelf state
const products = ref<any[]>([])
const productsLoading = ref(false)
const productSearch = ref('')
const typeFilter = ref<'ALL' | 'COMMAND' | 'GIVE_ITEM' | 'POTION' | 'RECYCLE_ITEM' | 'GROUP_BUY'>('ALL')

const typeFilterOptions = computed(() => [
  { title: t('admin.uiText.autoHtml.k0113'), value: 'ALL' },
  { title: t('admin.uiText.autoHtml.k0114'), value: 'COMMAND' },
  { title: t('admin.uiText.autoHtml.k0115'), value: 'GIVE_ITEM' },
  { title: t('admin.uiText.autoHtml.k0116'), value: 'POTION' },
  { title: t('admin.uiText.autoHtml.k0117'), value: 'RECYCLE_ITEM' },
  { title: t('admin.uiText.autoHtml.k0118'), value: 'GROUP_BUY' }
])

const handleLoadProducts = async () => {
  productsLoading.value = true
  try {
    const res = await adminApi.getProductsList()
    if (res && res.data) {
      products.value = res.data.list || res.data || []
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.loadFailed', { message: msg }), 'error')
  } finally {
    productsLoading.value = false
  }
}

const filteredProducts = computed(() => {
  let list = products.value
  
  if (typeFilter.value !== 'ALL') {
    list = list.filter(p => p.type === typeFilter.value)
  }

  if (productSearch.value) {
    const query = productSearch.value.trim().toLowerCase()
    list = list.filter(p => {
      return (
        (p.sku || '').toLowerCase().includes(query) ||
        (p.title || '').toLowerCase().includes(query) ||
        (p.material || '').toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query)
      )
    })
  }

  return list
})



const getTypeName = (type: string) => {
  if (type === 'COMMAND') return t('admin.uiText.autoHtml.k0114')
  if (type === 'GIVE_ITEM') return t('admin.uiText.autoHtml.k0115')
  if (type === 'POTION') return t('admin.uiText.autoHtml.k0116')
  if (type === 'RECYCLE_ITEM') return t('admin.uiText.autoHtml.k0117')
  if (type === 'GROUP_BUY') return t('admin.uiText.autoHtml.k0118')
  return type
}

const getTypeColor = (type: string) => {
  if (type === 'COMMAND') return 'primary'
  if (type === 'GIVE_ITEM') return 'success'
  if (type === 'POTION') return 'purple'
  if (type === 'RECYCLE_ITEM') return 'warning'
  if (type === 'GROUP_BUY') return 'secondary'
  return 'default'
}

const handleToggleActive = async (item: any) => {
  try {
    await adminApi.setProductActive({
      sku: item.sku,
      active: item.active
    })
    showSnackbar(`商品 ${item.sku} 状态已更新！`, 'success')
  } catch (err: any) {
    item.active = !item.active // Rollback
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.applyFailed', { message: msg }), 'error')
  }
}

const handleResetLimit = async (item: any) => {
  try {
    await adminApi.resetProductLimit({ sku: item.sku })
    showSnackbar(`商品 ${item.sku} 限购额度重置成功！`, 'success')
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.resetFailed', { message: msg }), 'error')
  }
}

// 1b. Product dialogue state
const upsertDialog = ref(false)
const upsertFormRef = ref<any>(null)
const upsertValid = ref(false)
const editMode = ref(false)
const upsertLoading = ref(false)
const rawPricingParams = ref('')

const formProduct = ref<any>({
  sku: '',
  title: '',
  price: 0,
  currency: 'GAME_COIN',
  type: 'COMMAND',
  commandTemplate: '',
  potionType: '',
  potionDurationSeconds: 300,
  potionAmplifier: 0,
  material: '',
  materialOverrideDisplay: '',
  materialOverrideName: '',
  maxStock: '',
  personalBuyLimit: '',
  description: '',
  active: true,
  dynamicPriceEnabled: false,
  dynamicAlgorithm: 'LINEAR_DEMAND',
  priceStep: 1,
  floorPrice: '',
  ceilPrice: '',
  baseStock: '',
  iconUrl: ''
})

const currencyOptions = computed(() => [
  { title: `${gameCoinName.value} (${gameCoinShort.value})`, value: 'GAME_COIN' },
  { title: `${shopCoinName.value} (${shopCoinShort.value})`, value: 'SHOP_COIN' }
])

const productTypeOptions = computed(() => [
  { title: t('admin.uiText.autoHtml.k0114'), value: 'COMMAND' },
  { title: t('admin.uiText.autoHtml.k0115'), value: 'GIVE_ITEM' },
  { title: t('admin.uiText.autoHtml.k0116'), value: 'POTION' },
  { title: t('admin.uiText.autoHtml.k0117'), value: 'RECYCLE_ITEM' },
  { title: t('admin.uiText.autoHtml.k0118'), value: 'GROUP_BUY' }
])

const pricingAlgorithms = computed(() => [
  { title: t('admin.uiText.autoHtml.k0039'), value: 'LINEAR_DEMAND' },
  { title: t('admin.uiText.autoHtml.k0040'), value: 'MARGINAL_DECAY' },
  { title: t('admin.uiText.autoHtml.k0041'), value: 'LOGARITHMIC_SMOOTH' },
  { title: t('admin.uiText.autoHtml.k0042'), value: 'EXPONENTIAL_DEFENSE' },
  { title: t('admin.uiText.autoHtml.k0043'), value: 'THRESHOLD_STEP' },
  { title: t('admin.uiText.autoHtml.k0044'), value: 'ELASTICITY_MODEL' }
])

const handleOpenUpsertDialog = (item: any | null) => {
  if (item) {
    editMode.value = true
    // Map fields
    formProduct.value = {
      ...item,
      maxStock: item.maxStock === null || item.maxStock === undefined ? '' : item.maxStock,
      personalBuyLimit: item.personalBuyLimit === null || item.personalBuyLimit === undefined ? '' : item.personalBuyLimit,
      floorPrice: item.floorPrice === null || item.floorPrice === undefined ? '' : item.floorPrice,
      ceilPrice: item.ceilPrice === null || item.ceilPrice === undefined ? '' : item.ceilPrice,
      baseStock: item.baseStock === null || item.baseStock === undefined ? '' : item.baseStock,
      priceStep: item.priceStep === null || item.priceStep === undefined ? 1 : item.priceStep,
      dynamicAlgorithm: item.dynamicAlgorithm || 'LINEAR_DEMAND'
    }
    rawPricingParams.value = item.dynamicParams ? JSON.stringify(item.dynamicParams, null, 2) : ''
  } else {
    editMode.value = false
    formProduct.value = {
      sku: '',
      title: '',
      price: 0,
      currency: 'GAME_COIN',
      type: 'COMMAND',
      commandTemplate: '',
      potionType: '',
      potionDurationSeconds: 300,
      potionAmplifier: 0,
      material: '',
      materialOverrideDisplay: '',
      materialOverrideName: '',
      maxStock: '',
      personalBuyLimit: '',
      description: '',
      active: true,
      dynamicPriceEnabled: false,
      dynamicAlgorithm: 'LINEAR_DEMAND',
      priceStep: 1,
      floorPrice: '',
      ceilPrice: '',
      baseStock: '',
      iconUrl: ''
    }
    rawPricingParams.value = ''
  }

  upsertDialog.value = true
  if (upsertFormRef.value) {
    upsertFormRef.value.resetValidation()
  }
}

const handleSaveProduct = async () => {
  if (!upsertFormRef.value) return
  const { valid } = await upsertFormRef.value.validate()
  if (!valid) return

  // Verify and parse advanced JSON params if pricing enabled
  let dynamicParamsObj = null
  if (formProduct.value.dynamicPriceEnabled && rawPricingParams.value.trim()) {
    try {
      dynamicParamsObj = JSON.parse(rawPricingParams.value)
    } catch (e) {
      showSnackbar('高级动态价格参数 JSON 格式不合法！', 'error')
      return
    }
  }

  upsertLoading.value = true
  try {
    const payload = {
      ...formProduct.value,
      maxStock: formProduct.value.maxStock === '' ? null : formProduct.value.maxStock,
      personalBuyLimit: formProduct.value.personalBuyLimit === '' ? null : formProduct.value.personalBuyLimit,
      floorPrice: formProduct.value.floorPrice === '' ? null : formProduct.value.floorPrice,
      ceilPrice: formProduct.value.ceilPrice === '' ? null : formProduct.value.ceilPrice,
      baseStock: formProduct.value.baseStock === '' ? null : formProduct.value.baseStock,
      dynamicParams: dynamicParamsObj
    }

    await adminApi.upsertProduct(payload)
    showSnackbar('商品配置已保存！', 'success')
    upsertDialog.value = false
    await handleLoadProducts()
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.saveFailed', { message: msg }), 'error')
  } finally {
    upsertLoading.value = false
  }
}

const handleIconFileSelect = async (files: File[] | File | null) => {
  if (!files) return
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return

  const formData = {
    icon: file
  }

  try {
    const res = await adminApi.uploadProductIcon({ sku: formProduct.value.sku }, formData)
    if (res && res.data) {
      formProduct.value.iconUrl = res.data.iconUrl || ''
      showSnackbar('商品图标上传成功！', 'success')
      await handleLoadProducts() // Refresh lists
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.uploadFailed', { message: msg }), 'error')
  }
}

// 2. Group Buy Cashier state
const cashierFormRef = ref<any>(null)
const cashierValid = ref(false)
const groupBuyCode = ref('')
const cashierLoading = ref(false)

const handleConsumeGroupBuy = async () => {
  if (!cashierFormRef.value) return
  const { valid } = await cashierFormRef.value.validate()
  if (!valid) return

  cashierLoading.value = true
  try {
    const res = await adminApi.consumeGroupBuyCode({
      code: groupBuyCode.value.trim()
    })
    
    if (res && res.data) {
      showSnackbar(`团购券 ${groupBuyCode.value} 核销成功！已自动向对应玩家发货。`, 'success')
      groupBuyCode.value = ''
      if (cashierFormRef.value) {
        cashierFormRef.value.resetValidation()
      }
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.consumeFailed', { message: msg }), 'error')
  } finally {
    cashierLoading.value = false
  }
}

// 3. Orders history list state
const orders = ref<any[]>([])
const ordersLoading = ref(false)
const orderSearch = ref('')
const orderUserSearch = ref('')
const orderStatusFilter = ref<'ALL' | 'PENDING' | 'CLAIMED' | 'FAILED' | 'REFUNDED' | 'RECYCLED'>('ALL')

const orderStatusFilterOptions = computed(() => [
  { title: t('admin.uiText.autoHtml.k0133'), value: 'ALL' },
  { title: t('admin.uiText.autoHtml.k0134'), value: 'PENDING' },
  { title: t('admin.uiText.autoHtml.k0136'), value: 'CLAIMED' },
  { title: t('admin.uiText.autoHtml.k0138'), value: 'FAILED' },
  { title: t('admin.uiText.autoHtml.k0137'), value: 'REFUNDED' },
  { title: t('admin.uiText.autoHtml.k0139'), value: 'RECYCLED' }
])

const handleLoadOrders = async () => {
  ordersLoading.value = true
  try {
    const res = await adminApi.getOrdersList()
    if (res && res.data) {
      orders.value = res.data.list || res.data || []
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.loadFailed', { message: msg }), 'error')
  } finally {
    ordersLoading.value = false
  }
}

const filteredOrders = computed(() => {
  let list = orders.value
  
  if (orderStatusFilter.value !== 'ALL') {
    list = list.filter(o => o.status === orderStatusFilter.value)
  }

  if (orderSearch.value) {
    const query = orderSearch.value.trim().toLowerCase()
    list = list.filter(o => {
      return (
        (o.orderId || '').toLowerCase().includes(query) ||
        (o.sku || '').toLowerCase().includes(query) ||
        (o.title || '').toLowerCase().includes(query)
      )
    })
  }

  if (orderUserSearch.value) {
    const query = orderUserSearch.value.trim().toLowerCase()
    list = list.filter(o => (o.username || '').toLowerCase().includes(query))
  }

  return list
})

const getOrderStatusName = (status: string) => {
  if (status === 'PENDING') return t('admin.uiText.autoHtml.k0134')
  if (status === 'CLAIMED') return t('admin.uiText.autoHtml.k0136')
  if (status === 'FAILED') return t('admin.uiText.autoHtml.k0138')
  if (status === 'REFUNDED') return t('admin.uiText.autoHtml.k0137')
  if (status === 'RECYCLED') return t('admin.uiText.autoHtml.k0139')
  return status
}

const getOrderStatusColor = (status: string) => {
  if (status === 'PENDING') return 'warning'
  if (status === 'CLAIMED') return 'success'
  if (status === 'FAILED') return 'error'
  if (status === 'REFUNDED') return 'grey'
  if (status === 'RECYCLED') return 'teal'
  return 'default'
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN', { hour12: false })
  } catch (e) {
    return timeStr
  }
}

onMounted(async () => {
  await Promise.all([
    handleLoadProducts(),
    handleLoadOrders()
  ])
})
</script>

<style scoped>
/* Glassmorphism Design */
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

.header-card {
  border-top: 4px solid rgb(var(--v-theme-success)) !important;
}

.border-success-light {
  border-left: 4px solid rgb(var(--v-theme-success)) !important;
}
.border-card-top-success {
  border-top: 4px solid rgb(var(--v-theme-success)) !important;
}

.hover-lift {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
}

/* Table header styling */
.bg-table-header {
  background-color: rgba(var(--v-theme-success), 0.04) !important;
}
.v-theme--dark .bg-table-header,
.v-theme--blackguard .bg-table-header {
  background-color: rgba(var(--v-theme-success), 0.1) !important;
}

.hover-bg-row {
  transition: all 0.2s ease;
}
.hover-bg-row:hover {
  background-color: rgba(var(--v-theme-success), 0.03) !important;
}

.border-warning-dashed {
  border: 1px dashed rgba(217, 119, 6, 0.3);
}

.text-slate-800 {
  color: #1e293b;
}
.v-theme--dark .text-slate-800,
.v-theme--blackguard .text-slate-800,
.v-theme--midnightSakura .text-slate-800 {
  color: #f1f5f9;
}

.width-60 {
  width: 60px;
}

.font-mono {
  font-family: monospace !important;
}

.leading-relaxed {
  line-height: 1.625;
}

.mt-0_5 {
  margin-top: 2px;
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
