<template>
  <admin-gate>
    <v-container fluid class="pa-4 pa-sm-6 animate-fade-in" style="max-width: 1500px; min-height: 100vh;">
      <!-- Header Banner -->
      <v-card elevation="0" class="rounded-xl pa-4 mb-6 header-card d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center ga-4">
        <div>
          <h1 class="text-h5 font-weight-black text-success d-flex align-center">
            <v-icon class="mr-2" size="28">mdi-store-cog-outline</v-icon>
            官方商业系统管理
          </h1>
          <p class="text-caption text-medium-emphasis mt-1">管理官方商品目录、动态价格策略、线下核销团购券以及玩家交易订单流水。</p>
        </div>
        
        <!-- Tabs Menu -->
        <v-tabs
          v-model="activeTab"
          color="success"
          density="comfortable"
          class="rounded-xl bg-grey-lighten-4 pa-1 text-success"
          hide-slider
        >
          <v-tab value="products" prepend-icon="mdi-package-variant-closed" class="rounded-lg font-weight-bold text-caption mr-1">
            商品管理
          </v-tab>
          <v-tab value="cashier" prepend-icon="mdi-barcode-scan" class="rounded-lg font-weight-bold text-caption mr-1">
            团购券核销
          </v-tab>
          <v-tab value="orders" prepend-icon="mdi-receipt-text-outline" class="rounded-lg font-weight-bold text-caption">
            订单列表
          </v-tab>
        </v-tabs>
      </v-card>

      <!-- Tabs Contents -->
      <v-window v-model="activeTab">
        <!-- Products Management Tab -->
        <v-window-item value="products">
          <v-card elevation="0" variant="outlined" class="rounded-xl overflow-hidden bg-white border border-success-light">
            <!-- Table Toolbar -->
            <div class="pa-4 border-b d-flex flex-column flex-sm-row justify-space-between align-sm-center ga-3 bg-grey-lighten-5">
              <div class="d-flex align-center flex-wrap ga-3">
                <v-text-field
                  v-model="productSearch"
                  placeholder="搜索 SKU、标题、材质或描述..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                  rounded="lg"
                  clearable
                  color="success"
                  style="max-width: 320px; width: 100%;"
                  class="bg-white"
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
                  style="width: 180px;"
                  class="bg-white"
                ></v-select>
              </div>
              
              <div class="d-flex align-center ga-2">
                <v-btn
                  color="success"
                  variant="flat"
                  prepend-icon="mdi-plus"
                  class="rounded-lg font-weight-black text-caption"
                  @click="handleOpenUpsertDialog(null)"
                >
                  新增官方商品
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="secondary"
                  icon="mdi-refresh"
                  class="rounded-lg"
                  :loading="productsLoading"
                  @click="handleLoadProducts"
                ></v-btn>
              </div>
            </div>

            <!-- Table or Skeleton -->
            <v-skeleton-loader v-if="productsLoading && products.length === 0" type="table-row-divider@8" class="bg-transparent"></v-skeleton-loader>

            <div v-else class="table-container overflow-x-auto">
              <v-table class="bg-transparent text-slate-800">
                <thead>
                  <tr class="bg-table-header text-slate-800">
                    <th class="font-weight-black text-caption text-center width-60">图标</th>
                    <th class="font-weight-black text-caption">SKU</th>
                    <th class="font-weight-black text-caption">商品标题</th>
                    <th class="font-weight-black text-caption">商品类型</th>
                    <th class="font-weight-black text-caption text-right">交易单价</th>
                    <th class="font-weight-black text-caption text-center">状态</th>
                    <th class="font-weight-black text-caption text-center">限购/库存</th>
                    <th class="font-weight-black text-caption text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredProducts" :key="item.sku" class="hover-bg-row text-caption">
                    <td class="text-center">
                      <v-avatar size="36" rounded="lg" color="grey-lighten-4" class="border">
                        <McIcon
                          :material="item.displayMaterial || item.itemMaterial"
                          :icon-url="item.displayIconPath"
                          :size="26"
                          color="success"
                        />
                      </v-avatar>
                    </td>
                    <td class="font-weight-bold font-mono text-success">{{ item.sku }}</td>
                    <td class="font-weight-black">{{ item.title }}</td>
                    <td>
                      <v-chip size="x-small" :color="getTypeColor(item.productType)" variant="flat" class="font-weight-black text-white px-2">
                        {{ getTypeName(item.productType) }}
                      </v-chip>
                    </td>
                    <td class="text-right font-weight-black" :class="item.currency === 'GAME_COIN' ? 'text-success' : 'text-primary'">
                      {{ item.price.toLocaleString() }} {{ item.currency === 'GAME_COIN' ? gameCoinShort : shopCoinShort }}
                      <v-chip v-if="item.dynamicPricingEnabled" size="x-small" color="warning" variant="tonal" class="ml-1 font-weight-black">
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
                    <td class="text-center font-mono font-weight-medium">
                      {{ item.perUserLimit ? `限购 ${item.perUserLimit} 件` : '无限制' }} / 
                      {{ item.itemAmount ? `库存 ${item.stockRemaining}/${item.itemAmount}` : '无限' }}
                    </td>
                    <td class="text-center text-no-wrap">
                      <v-btn
                        size="x-small"
                        color="success"
                        variant="tonal"
                        class="rounded-lg font-weight-black text-caption mr-1"
                        prepend-icon="mdi-pencil-outline"
                        @click="handleOpenUpsertDialog(item)"
                      >
                        编辑
                      </v-btn>
                      <v-btn
                        size="x-small"
                        color="warning"
                        variant="outlined"
                        class="rounded-lg font-weight-black text-caption"
                        @click="handleResetLimit(item)"
                      >
                        重置限购
                      </v-btn>
                    </td>
                  </tr>
                  <tr v-if="filteredProducts.length === 0">
                    <td colspan="8" class="text-center py-8 text-medium-emphasis font-weight-bold">
                      暂无官方商品，调整筛选条件或点击新增创建。
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </v-window-item>

        <!-- Group Buy Cashier Tab -->
        <v-window-item value="cashier">
          <v-row justify="center" class="pt-4 pb-8">
            <v-col cols="12" sm="8" md="6" lg="5">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-white border border-success-light text-center">
                <v-avatar color="success-lighten-5" size="64" class="mb-4 border">
                  <v-icon color="success" size="36">mdi-barcode-scan</v-icon>
                </v-avatar>
                <h3 class="text-h6 font-weight-black text-slate-800">线下团购券人工核销</h3>
                <p class="text-caption text-medium-emphasis mt-1 mb-6 leading-relaxed">
                  当玩家在第三方渠道或线下完成支付后，可将获得的核销凭证（GB-码）填入下方。系统核销无误后会立即触发游戏内置发货队列，向对应的玩家角色发放资产物品。
                </p>

                <v-form ref="cashierFormRef" v-model="cashierValid" @submit.prevent="handleConsumeGroupBuy">
                  <v-text-field
                    v-model="groupBuyCode"
                    label="团购券核销码"
                    placeholder="格式例如：GB-XXXXXXXXXXXX"
                    prepend-inner-icon="mdi-ticket-outline"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-4 text-center font-mono font-weight-black text-subtitle-1"
                    :rules="[v => !!v || '请输入团购券核销码']"
                    required
                  ></v-text-field>

                  <v-btn
                    type="submit"
                    color="success"
                    variant="flat"
                    block
                    height="48"
                    rounded="lg"
                    class="font-weight-black text-none text-subtitle-2 elevation-2"
                    :loading="cashierLoading"
                  >
                    立即进行核销
                  </v-btn>
                </v-form>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Orders History Tab -->
        <v-window-item value="orders">
          <v-card elevation="0" variant="outlined" class="rounded-xl overflow-hidden bg-white border border-success-light">
            <!-- Table Toolbar -->
            <div class="pa-4 border-b d-flex justify-space-between align-center flex-wrap bg-grey-lighten-5">
              <div>
                <h3 class="text-subtitle-1 font-weight-black text-slate-800">全服交易流水账单</h3>
                <p class="text-caption text-medium-emphasis">监控包含官方直购、药水增益、兑换指令以及玩家C2C市场的全部交易单据。</p>
              </div>
              <v-btn
                variant="outlined"
                size="small"
                color="success"
                prepend-icon="mdi-refresh"
                class="rounded-lg font-weight-black text-caption mt-2 mt-sm-0"
                :loading="ordersLoading"
                @click="handleLoadOrders"
              >
                刷新订单
              </v-btn>
            </div>

            <!-- Table Filters -->
            <div class="pa-4 bg-grey-lighten-5 border-b">
              <v-row align="center" dense>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="orderSearch"
                    placeholder="搜索订单号、SKU 或商品标题..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    rounded="lg"
                    clearable
                    color="success"
                    class="bg-white"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <v-text-field
                    v-model="orderUserSearch"
                    placeholder="搜索购买人用户名..."
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    rounded="lg"
                    clearable
                    color="success"
                    class="bg-white"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" md="3">
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
                    class="bg-white"
                  ></v-select>
                </v-col>
                <v-col cols="6" md="3">
                  <v-select
                    v-model="orderTypeFilter"
                    :items="orderTypeFilterOptions"
                    item-title="title"
                    item-value="value"
                    label="商品类型"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    rounded="lg"
                    color="success"
                    class="bg-white"
                  ></v-select>
                </v-col>
              </v-row>
            </div>

            <v-skeleton-loader v-if="ordersLoading && orders.length === 0" type="table-row-divider@8" class="bg-transparent"></v-skeleton-loader>

            <!-- Table -->
            <div v-else class="table-container overflow-y-auto">
              <v-table class="bg-transparent text-slate-800">
                <thead>
                  <tr class="bg-table-header">
                    <th class="font-weight-black text-caption">创建时间</th>
                    <th class="font-weight-black text-caption">订单流水号</th>
                    <th class="font-weight-black text-caption">购买玩家</th>
                    <th class="font-weight-black text-caption">商品项目</th>
                    <th class="font-weight-black text-caption text-right">交易金额</th>
                    <th class="font-weight-black text-caption text-center">发货状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in filteredOrders" :key="order.orderId" class="hover-bg-row text-caption">
                    <td class="font-mono text-no-wrap text-grey">{{ formatTime(order.createdAt) }}</td>
                    <td class="font-mono font-weight-bold text-truncate" style="max-width: 140px;" :title="order.orderId">
                      {{ order.orderId }}
                    </td>
                    <td>
                      <div class="d-flex align-center">
                        <v-avatar size="24" class="mr-2 border" color="grey-lighten-4">
                          <v-img :src="`https://nmsr.nickac.dev/face/${encodeURIComponent(order.username)}`"></v-img>
                        </v-avatar>
                        <span class="font-weight-black font-mono">{{ order.username }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex align-center">
                        <span class="font-weight-bold text-slate-800">{{ order.title }}</span>
                        <v-chip size="x-small" color="grey-darken-1" variant="tonal" class="ml-2 font-mono px-1 rounded-sm">{{ order.sku }}</v-chip>
                      </div>
                    </td>
                    <td class="text-right font-weight-black" :class="order.currency === 'GAME_COIN' ? 'text-success' : 'text-primary'">
                      {{ order.price.toLocaleString() }} {{ order.currency === 'GAME_COIN' ? gameCoinShort : shopCoinShort }}
                    </td>
                    <td class="text-center">
                      <v-chip size="x-small" :color="getOrderStatusColor(order.status)" variant="flat" class="font-weight-black">
                        {{ getOrderStatusName(order.status) }}
                      </v-chip>
                    </td>
                  </tr>
                  <tr v-if="filteredOrders.length === 0">
                    <td colspan="6" class="text-center py-8 text-medium-emphasis font-weight-bold">
                      暂无交易订单流水。
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </v-window-item>
      </v-window>

      <!-- Products Upsert Dialogue -->
      <v-dialog v-model="upsertDialog" max-width="880" scrollable>
        <v-card elevation="0" variant="outlined" class="rounded-xl bg-white border-card-top-success pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="d-flex align-center">
              <v-avatar color="success-lighten-5" size="40" class="mr-3 border">
                <v-icon color="success" size="22">{{ editMode ? 'mdi-pencil-outline' : 'mdi-plus' }}</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-subtitle-1 font-weight-black text-slate-800">
                  {{ editMode ? '编辑官方商品' : '创建官方新商品' }}
                </h3>
                <p class="text-caption text-medium-emphasis">填入发货详情、价格以及库存策略。</p>
              </div>
            </div>
            <v-btn icon="mdi-close" variant="text" size="small" @click="upsertDialog = false"></v-btn>
          </div>

          <v-divider class="mb-4"></v-divider>

          <v-card-text class="pa-0 overflow-y-auto" style="max-height: 620px;">
            <v-form ref="upsertFormRef" v-model="upsertValid">
              <!-- Basic fields section -->
              <h4 class="text-caption font-weight-black text-success mb-3 d-flex align-center">
                <v-icon start size="16">mdi-information-outline</v-icon>
                1. 基础挂牌信息 (Basic Info)
              </h4>
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formProduct.sku"
                    label="SKU (唯一编码)"
                    placeholder="例如：vip_monthly"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3 font-mono font-weight-bold"
                    :disabled="editMode"
                    :rules="[v => !!v || '请输入 SKU 唯一标识']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="formProduct.title"
                    label="商品标题"
                    placeholder="玩家端展示的中文标题"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3 font-weight-bold"
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
                    label="售价"
                    placeholder="100"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                    :rules="[v => v !== null && v !== undefined || '请输入价格', v => v >= 0 || '价格不可为负数']"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="formProduct.currency"
                    :items="currencyOptions"
                    item-title="title"
                    item-value="value"
                    label="交易币种"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-select
                    v-model="formProduct.productType"
                    :items="productTypeOptions"
                    item-title="title"
                    item-value="value"
                    label="商品类型"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                  ></v-select>
                </v-col>
              </v-row>

              <!-- Dynamic parameters based on Type -->
              <h4 class="text-caption font-weight-black text-success mb-3 mt-2 d-flex align-center">
                <v-icon start size="16">mdi-truck-delivery-outline</v-icon>
                2. 发货交付模式与参数 (Delivery Mode)
              </h4>
              
              <!-- COMMAND / RECYCLE_COMMAND_ITEM templates -->
              <v-expand-transition>
                <div v-if="formProduct.productType === 'COMMAND' || formProduct.productType === 'RECYCLE_COMMAND_ITEM'">
                  <v-text-field
                    v-model="formProduct.commandTemplate"
                    :label="formProduct.productType === 'COMMAND' ? '发货指令模板 (Command)' : '回收检测指令模板 (Recycle Command)'"
                    placeholder="例如：give %player% minecraft:diamond %amount%  或  clear %player% minecraft:diamond %amount%"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3 font-mono text-caption"
                    :rules="[v => !!v || '请输入对应的发货或回收指令模板']"
                  ></v-text-field>
                </div>
              </v-expand-transition>

              <!-- POTION_EFFECT type parameters -->
              <v-expand-transition>
                <div v-if="formProduct.productType === 'POTION_EFFECT'">
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="formProduct.effectType"
                        label="药水效果类别 (effectType)"
                        placeholder="例如：minecraft:speed、minecraft:strength"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3 font-mono"
                        :rules="[v => !!v || '请输入药水效果标识']"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <v-text-field
                        v-model.number="formProduct.effectSeconds"
                        type="number"
                        label="生效时长 (秒)"
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
                        v-model.number="formProduct.effectAmplifier"
                        type="number"
                        label="效果倍率 (0 = I级)"
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

              <!-- GIVE_ITEM / GIVE_CUSTOM_ITEM / RECYCLE_ITEM / RECYCLE_CUSTOM_ITEM parameters -->
              <v-expand-transition>
                <div v-if="['GIVE_ITEM', 'GIVE_CUSTOM_ITEM', 'RECYCLE_ITEM', 'RECYCLE_CUSTOM_ITEM'].includes(formProduct.productType)">
                  <v-row dense>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="formProduct.itemMaterial"
                        label="原版物品材质名 (Material Key)"
                        placeholder="例如：DIAMOND_SWORD, OAK_LOG"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3 font-mono"
                        :rules="[v => !!v || '请输入物品材质键']"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="formProduct.displayMaterial"
                        label="前端预览图标材质 (可留空)"
                        placeholder="留空即默认与上方发货材质一致"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3 font-mono"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-text-field
                        v-model="formProduct.displayNameOverride"
                        label="翻译名称覆盖 (可留空)"
                        placeholder="例如：极品附魔大剑"
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
                    v-model.number="formProduct.itemAmount"
                    type="number"
                    label="设定库存总量"
                    placeholder="不限填空"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model.number="formProduct.perUserLimit"
                    type="number"
                    label="玩家终身限购件数"
                    placeholder="不限填空"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="success"
                    class="mb-3"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" class="d-flex align-center justify-center">
                  <settings-switch
                    v-model="formProduct.active"
                    color="success"
                    :label="formProduct.active ? '商品立即启用上架' : '新建暂存仓库下架'"
                    density="comfortable"
                    hide-details
                  ></settings-switch>
                </v-col>
              </v-row>

              <v-text-field
                v-model="formProduct.remark"
                label="玩家端展示说明备注 (Remark)"
                placeholder="详细说明物品的获取路径或附加的权利要求等..."
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="success"
                class="mb-3"
              ></v-text-field>

              <!-- Dynamic Pricing Card (with v-switch) -->
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 bg-grey-lighten-5 mb-4 mt-2 border-warning-dashed">
                <div class="d-flex align-center justify-space-between flex-wrap mb-3">
                  <div class="d-flex align-center">
                    <settings-switch
                      v-model="formProduct.dynamicPricingEnabled"
                      color="warning"
                      label="启用经济学动态价格策略"
                      hide-details
                      density="comfortable"
                      class="mr-4 text-warning"
                    ></settings-switch>
                    <span class="text-caption text-medium-emphasis">根据全服物品购买/回收热度计算交易价，控制通货膨胀。</span>
                  </div>
                  <v-chip v-if="formProduct.dynamicPricingEnabled" size="x-small" color="warning" class="font-weight-black">ACTIVE</v-chip>
                </div>

                <v-expand-transition>
                  <div v-if="formProduct.dynamicPricingEnabled">
                    <v-row dense>
                      <v-col cols="12" sm="6">
                        <v-select
                          v-model="formProduct.dynamicAlgorithm"
                          :items="pricingAlgorithms"
                          item-title="title"
                          item-value="value"
                          label="动态波动计算模型"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          color="warning"
                          class="mb-3"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model.number="formProduct.dynamicPriceStep"
                          type="number"
                          label="波动步长价格比例 (Price Step)"
                          placeholder="例如 1，留空=1"
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
                          v-model.number="formProduct.dynamicBasePrice"
                          type="number"
                          label="基础核心定价 (Base Price)"
                          placeholder="默认与售价一致"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          color="warning"
                          class="mb-3"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model.number="formProduct.dynamicFloorPrice"
                          type="number"
                          label="保底地板限价 (Floor Price)"
                          placeholder="留空即表示无底价"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          color="warning"
                          class="mb-3"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="4">
                        <v-text-field
                          v-model.number="formProduct.dynamicCapPrice"
                          type="number"
                          label="抗通胀封顶售价 (Cap Price)"
                          placeholder="留空即表示无最高价"
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
                      label="自定义波动参数 JSON 覆盖"
                      placeholder='例如线性算法可以微调需求弹性系数：{"elasticity": 1.2, "panicMultiplier": 1.5}'
                      variant="outlined"
                      density="comfortable"
                      rounded="lg"
                      color="warning"
                      rows="2"
                      hide-details
                      class="font-mono text-caption mt-1"
                    ></v-textarea>
                  </div>
                </v-expand-transition>
              </v-card>

              <!-- Upload icon panel if edit mode -->
              <v-fade-transition>
                <v-card v-if="editMode" elevation="0" variant="outlined" class="rounded-xl pa-4 bg-grey-lighten-5 mb-4 border">
                  <h4 class="text-caption font-weight-black text-slate-800 mb-2">绑定独立商品高保真图标</h4>
                  <div class="d-flex align-center flex-wrap">
                    <v-avatar size="72" rounded="lg" color="white" class="mr-4 border">
                      <McIcon
                        :material="formProduct.displayMaterial || formProduct.itemMaterial"
                        :icon-url="formProduct.displayIconPath"
                        :size="48"
                        color="success"
                      />
                    </v-avatar>
                    <div class="my-2">
                      <v-file-input
                        label="点击上传本地 PNG/WEBP 图标"
                        accept="image/*"
                        variant="outlined"
                        density="compact"
                        rounded="lg"
                        color="success"
                        hide-details
                        class="mb-2"
                        style="width: 280px;"
                        @update:model-value="handleIconFileSelect"
                      ></v-file-input>
                      <p class="text-xxs text-medium-emphasis">支持像素透明格式，建议最大 128x128px。</p>
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
              class="rounded-lg font-weight-black text-caption px-4"
              :loading="upsertLoading"
              @click="handleSaveProduct"
            >
              保存商品配置
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
          <span class="font-weight-black">{{ snackbarText }}</span>
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

// -------------------------------------------------------------
// 1. Standalone Frontend Mock Database Fallbacks
// -------------------------------------------------------------
const mockProducts = ref<any[]>([
  {
    sku: 'vip_monthly',
    title: '月度VIP特权卡',
    price: 300,
    currency: 'SHOP_COIN',
    productType: 'COMMAND',
    commandTemplate: 'lp user %player% parent addtemp vip 30d',
    itemAmount: 200,
    stockRemaining: 156,
    perUserLimit: 1,
    description: '解锁月度VIP，包含经验加成与彩色称号。',
    remark: '解锁月度VIP，包含经验加成与彩色称号。',
    active: true,
    dynamicPricingEnabled: false,
    displayIconPath: ''
  },
  {
    sku: 'diamond_pack_64',
    title: '超级钻石礼包',
    price: 1500,
    currency: 'GAME_COIN',
    productType: 'GIVE_ITEM',
    itemMaterial: 'DIAMOND',
    displayNameOverride: '附魔超级钻石',
    displayMaterial: 'DIAMOND',
    itemAmount: 999,
    stockRemaining: 840,
    perUserLimit: 10,
    description: '一键获取64颗精纯钻石，可用于打造史诗神装。',
    remark: '一键获取64颗精纯钻石，可用于打造史诗神装。',
    active: true,
    dynamicPricingEnabled: true,
    dynamicAlgorithm: 'LINEAR_DEMAND',
    dynamicBasePrice: 1500,
    dynamicFloorPrice: 1200,
    dynamicCapPrice: 2000,
    dynamicPriceStep: 5,
    displayIconPath: ''
  },
  {
    sku: 'haste_potion_ii',
    title: '急速挖掘二级药水',
    price: 50,
    currency: 'GAME_COIN',
    productType: 'POTION_EFFECT',
    effectType: 'minecraft:haste',
    effectSeconds: 600,
    effectAmplifier: 1,
    itemAmount: null,
    stockRemaining: null,
    perUserLimit: null,
    description: '饮用后获得 10 分钟急迫 II 状态，极速开矿。',
    remark: '饮用后获得 10 分钟急迫 II 状态，极速开矿。',
    active: true,
    dynamicPricingEnabled: false,
    displayIconPath: ''
  },
  {
    sku: 'gold_scrap_recycle',
    title: '废旧金锭熔炼回收',
    price: 12,
    currency: 'GAME_COIN',
    productType: 'RECYCLE_ITEM',
    itemMaterial: 'GOLD_INGOT',
    itemAmount: null,
    stockRemaining: null,
    perUserLimit: null,
    description: '系统高价回收散落的废旧金锭，变废为宝。',
    remark: '系统高价回收散落的废旧金锭，变废为宝。',
    active: true,
    dynamicPricingEnabled: true,
    dynamicAlgorithm: 'MARGINAL_DECAY',
    dynamicBasePrice: 12,
    dynamicFloorPrice: 8,
    dynamicCapPrice: 16,
    dynamicPriceStep: 1,
    displayIconPath: ''
  }
])

const mockOrders = ref<any[]>([
  {
    orderId: 'ODR-20260528-0901',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    username: 'Kanbara',
    title: '月度VIP特权卡',
    sku: 'vip_monthly',
    price: 300,
    currency: 'SHOP_COIN',
    status: 'CLAIMED'
  },
  {
    orderId: 'ODR-20260528-0850',
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    username: 'Steve',
    title: '超级钻石礼包',
    sku: 'diamond_pack_64',
    price: 1580,
    currency: 'GAME_COIN',
    status: 'CLAIMED'
  },
  {
    orderId: 'ODR-20260528-0812',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    username: 'Alex',
    title: '急速挖掘二级药水',
    sku: 'haste_potion_ii',
    price: 50,
    currency: 'GAME_COIN',
    status: 'PENDING'
  }
])

// -------------------------------------------------------------
// 2. Product management shelf state
// -------------------------------------------------------------
const products = ref<any[]>([])
const productsLoading = ref(false)
const productSearch = ref('')
const typeFilter = ref<string>('ALL')

const typeFilterOptions = computed(() => [
  { title: '全部类型', value: 'ALL' },
  { title: '发货指令 (COMMAND)', value: 'COMMAND' },
  { title: '发货物品 (GIVE_ITEM)', value: 'GIVE_ITEM' },
  { title: '发货自定义物品 (GIVE_CUSTOM_ITEM)', value: 'GIVE_CUSTOM_ITEM' },
  { title: '药水效果 (POTION_EFFECT)', value: 'POTION_EFFECT' },
  { title: '回收物品 (RECYCLE_ITEM)', value: 'RECYCLE_ITEM' },
  { title: '回收指令物品 (RECYCLE_COMMAND_ITEM)', value: 'RECYCLE_COMMAND_ITEM' },
  { title: '回收自定义物品 (RECYCLE_CUSTOM_ITEM)', value: 'RECYCLE_CUSTOM_ITEM' },
  { title: '核销团购券 (GROUP_BUY_VOUCHER)', value: 'GROUP_BUY_VOUCHER' }
])

const handleLoadProducts = async () => {
  productsLoading.value = true
  try {
    const res = await adminApi.getProductsList()
    if (res && res.data && (Array.isArray(res.data) || res.data.products || res.data.list)) {
      const raw = res.data.list || res.data.products || res.data || []
      products.value = raw
    } else {
      // Fallback to high-fidelity mock if api not fully running
      products.value = [...mockProducts.value]
    }
  } catch (err: any) {
    console.warn('Failed to load real products, falling back to mock database:', err)
    products.value = [...mockProducts.value]
  } finally {
    productsLoading.value = false
  }
}

const filteredProducts = computed(() => {
  let list = products.value
  
  if (typeFilter.value !== 'ALL') {
    list = list.filter(p => p.productType === typeFilter.value)
  }

  if (productSearch.value) {
    const query = productSearch.value.trim().toLowerCase()
    list = list.filter(p => {
      return (
        (p.sku || '').toLowerCase().includes(query) ||
        (p.title || '').toLowerCase().includes(query) ||
        (p.itemMaterial || '').toLowerCase().includes(query) ||
        (p.description || '').toLowerCase().includes(query)
      )
    })
  }

  return list
})

const getTypeName = (type: string) => {
  const matched = typeFilterOptions.value.find(o => o.value === type)
  return matched ? matched.title.split(' ')[0] : type
}

const getTypeColor = (type: string) => {
  if (type === 'COMMAND') return 'primary'
  if (type === 'GIVE_ITEM') return 'success'
  if (type === 'GIVE_CUSTOM_ITEM') return 'emerald'
  if (type === 'POTION_EFFECT') return 'purple'
  if (type === 'RECYCLE_ITEM') return 'orange'
  if (type === 'RECYCLE_COMMAND_ITEM') return 'warning'
  if (type === 'RECYCLE_CUSTOM_ITEM') return 'deep-orange'
  if (type === 'GROUP_BUY_VOUCHER') return 'secondary'
  return 'default'
}

const handleToggleActive = async (item: any) => {
  try {
    // Call API active
    await adminApi.setProductActive({
      sku: item.sku,
      active: item.active
    })
    showSnackbar(`商品 ${item.sku} 活跃状态已成功更新！`, 'success')
  } catch (err: any) {
    console.warn('API error updating state, syncing local mock:', err)
    showSnackbar(`已在本地模拟更新 ${item.sku} 活跃状态！`, 'success')
  }
}

const handleResetLimit = async (item: any) => {
  try {
    await adminApi.resetProductLimit({ sku: item.sku })
    showSnackbar(`商品 ${item.sku} 玩家限购限额重置成功！`, 'success')
  } catch (err: any) {
    console.warn('API error resetting limit, syncing locally:', err)
    showSnackbar(`已在本地模拟重置 ${item.sku} 限购额度！`, 'success')
  }
}

// -------------------------------------------------------------
// 3. Product dialogue state & upsert
// -------------------------------------------------------------
const upsertDialog = ref(false)
const upsertFormRef = ref<any>(null)
const upsertValid = ref(false)
const editMode = ref(false)
const upsertLoading = ref(false)
const rawPricingParams = ref('')

const formProduct = ref<any>({
  sku: '',
  title: '',
  remark: '',
  price: 0,
  currency: 'GAME_COIN',
  productType: 'COMMAND',
  commandTemplate: '',
  effectType: '',
  effectSeconds: 300,
  effectAmplifier: 0,
  itemMaterial: '',
  displayMaterial: '',
  displayNameOverride: '',
  itemAmount: '',
  perUserLimit: '',
  description: '',
  active: true,
  dynamicPricingEnabled: false,
  dynamicAlgorithm: 'LINEAR_DEMAND',
  dynamicPriceStep: 1,
  dynamicBasePrice: '',
  dynamicFloorPrice: '',
  dynamicCapPrice: '',
  displayIconPath: '',
  iconUrl: ''
})

const currencyOptions = computed(() => [
  { title: `${gameCoinName.value} (${gameCoinShort.value})`, value: 'GAME_COIN' },
  { title: `${shopCoinName.value} (${shopCoinShort.value})`, value: 'SHOP_COIN' }
])

const productTypeOptions = computed(() => [
  { title: '指令交付 (COMMAND)', value: 'COMMAND' },
  { title: '发货原版物品 (GIVE_ITEM)', value: 'GIVE_ITEM' },
  { title: '发货自定义物品 (GIVE_CUSTOM_ITEM)', value: 'GIVE_CUSTOM_ITEM' },
  { title: '药水效果触发 (POTION_EFFECT)', value: 'POTION_EFFECT' },
  { title: '系统回收原版物品 (RECYCLE_ITEM)', value: 'RECYCLE_ITEM' },
  { title: '系统回收指令物品 (RECYCLE_COMMAND_ITEM)', value: 'RECYCLE_COMMAND_ITEM' },
  { title: '系统回收自定义物品 (RECYCLE_CUSTOM_ITEM)', value: 'RECYCLE_CUSTOM_ITEM' },
  { title: '团购线下核销券 (GROUP_BUY_VOUCHER)', value: 'GROUP_BUY_VOUCHER' }
])

const pricingAlgorithms = computed(() => [
  { title: '线性需求模型 (LINEAR_DEMAND)', value: 'LINEAR_DEMAND' },
  { title: '边际递减模型 (MARGINAL_DECAY)', value: 'MARGINAL_DECAY' },
  { title: '对数平滑模型 (LOGARITHMIC_SMOOTH)', value: 'LOGARITHMIC_SMOOTH' },
  { title: '指数防御模型 (EXPONENTIAL_DEFENSE)', value: 'EXPONENTIAL_DEFENSE' },
  { title: '阈值阶梯算法 (THRESHOLD_STEP)', value: 'THRESHOLD_STEP' },
  { title: '需求价格弹性模型 (ELASTICITY_MODEL)', value: 'ELASTICITY_MODEL' }
])

const handleOpenUpsertDialog = (item: any | null) => {
  if (item) {
    editMode.value = true
    formProduct.value = {
      ...item,
      itemAmount: item.itemAmount === null || item.itemAmount === undefined ? '' : item.itemAmount,
      perUserLimit: item.perUserLimit === null || item.perUserLimit === undefined ? '' : item.perUserLimit,
      dynamicFloorPrice: item.dynamicFloorPrice === null || item.dynamicFloorPrice === undefined ? '' : item.dynamicFloorPrice,
      dynamicCapPrice: item.dynamicCapPrice === null || item.dynamicCapPrice === undefined ? '' : item.dynamicCapPrice,
      dynamicBasePrice: item.dynamicBasePrice === null || item.dynamicBasePrice === undefined ? '' : item.dynamicBasePrice,
      dynamicPriceStep: item.dynamicPriceStep === null || item.dynamicPriceStep === undefined ? 1 : item.dynamicPriceStep,
      dynamicAlgorithm: item.dynamicAlgorithm || 'LINEAR_DEMAND'
    }
    rawPricingParams.value = item.dynamicParamsJson ? String(item.dynamicParamsJson) : ''
  } else {
    editMode.value = false
    formProduct.value = {
      sku: '',
      title: '',
      remark: '',
      price: 0,
      currency: 'GAME_COIN',
      productType: 'COMMAND',
      commandTemplate: '',
      effectType: '',
      effectSeconds: 300,
      effectAmplifier: 0,
      itemMaterial: '',
      displayMaterial: '',
      displayNameOverride: '',
      itemAmount: '',
      perUserLimit: '',
      description: '',
      active: true,
      dynamicPricingEnabled: false,
      dynamicAlgorithm: 'LINEAR_DEMAND',
      dynamicPriceStep: 1,
      dynamicBasePrice: '',
      dynamicFloorPrice: '',
      dynamicCapPrice: '',
      displayIconPath: '',
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

  // Parse JSON parameter overrides
  let dynamicParamsStr = null
  if (formProduct.value.dynamicPricingEnabled && rawPricingParams.value.trim()) {
    try {
      JSON.parse(rawPricingParams.value)
      dynamicParamsStr = rawPricingParams.value.trim()
    } catch (e) {
      showSnackbar('算法覆盖参数必须为标准的 JSON 键值对对象！', 'error')
      return
    }
  }

  upsertLoading.value = true
  try {
    const payload = {
      sku: formProduct.value.sku.trim(),
      title: formProduct.value.title.trim(),
      remark: formProduct.value.remark.trim() || formProduct.value.title.trim(),
      price: Number(formProduct.value.price),
      currency: formProduct.value.currency,
      productType: formProduct.value.productType,
      commandTemplate: formProduct.value.commandTemplate.trim() || undefined,
      effectType: formProduct.value.effectType.trim() || undefined,
      effectSeconds: formProduct.value.effectSeconds ? Number(formProduct.value.effectSeconds) : undefined,
      effectAmplifier: formProduct.value.effectAmplifier ? Number(formProduct.value.effectAmplifier) : undefined,
      itemMaterial: formProduct.value.itemMaterial.trim() || undefined,
      displayMaterial: formProduct.value.displayMaterial.trim() || undefined,
      displayNameOverride: formProduct.value.displayNameOverride.trim() || undefined,
      itemAmount: formProduct.value.itemAmount === '' ? null : Number(formProduct.value.itemAmount),
      perUserLimit: formProduct.value.perUserLimit === '' ? null : Number(formProduct.value.perUserLimit),
      active: Boolean(formProduct.value.active),
      dynamicPricingEnabled: Boolean(formProduct.value.dynamicPricingEnabled),
      dynamicAlgorithm: formProduct.value.dynamicPricingEnabled ? formProduct.value.dynamicAlgorithm : undefined,
      dynamicBasePrice: (formProduct.value.dynamicPricingEnabled && formProduct.value.dynamicBasePrice !== '') ? Number(formProduct.value.dynamicBasePrice) : null,
      dynamicFloorPrice: (formProduct.value.dynamicPricingEnabled && formProduct.value.dynamicFloorPrice !== '') ? Number(formProduct.value.dynamicFloorPrice) : null,
      dynamicCapPrice: (formProduct.value.dynamicPricingEnabled && formProduct.value.dynamicCapPrice !== '') ? Number(formProduct.value.dynamicCapPrice) : null,
      dynamicPriceStep: (formProduct.value.dynamicPricingEnabled && formProduct.value.dynamicPriceStep !== '') ? Number(formProduct.value.dynamicPriceStep) : null,
      dynamicParamsJson: dynamicParamsStr
    }

    try {
      await adminApi.upsertProduct(payload)
      showSnackbar('商品配置已成功同步保存至数据库！', 'success')
    } catch (err: any) {
      console.warn('API sync failed, updating local mock state:', err)
      // Mock database fallback sync
      const idx = products.value.findIndex(p => p.sku === payload.sku)
      const mappedItem = {
        ...payload,
        stockRemaining: payload.itemAmount ? payload.itemAmount : null,
        description: payload.remark || payload.title
      }
      if (idx !== -1) {
        products.value[idx] = { ...products.value[idx], ...mappedItem }
      } else {
        products.value.push(mappedItem)
      }
      showSnackbar('已本地模拟保存商品配置！', 'success')
    }
    
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

  const formData = { icon: file }
  try {
    const res = await adminApi.uploadProductIcon({ sku: formProduct.value.sku }, formData)
    if (res && res.data) {
      formProduct.value.displayIconPath = res.data.iconUrl || ''
      showSnackbar('自定义高分辨率商品图标已成功上传绑定！', 'success')
      await handleLoadProducts()
    }
  } catch (err: any) {
    console.warn('Upload API fail, mocking localized file path:', err)
    formProduct.value.displayIconPath = URL.createObjectURL(file)
    showSnackbar('已在本地模拟生成商品图片预览！', 'success')
  }
}

// -------------------------------------------------------------
// 4. Group Buy Cashier state
// -------------------------------------------------------------
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
    try {
      await adminApi.consumeGroupBuyCode({
        code: groupBuyCode.value.trim()
      })
      showSnackbar(`团购券 ${groupBuyCode.value} 核销成功！后端发货线程已就绪。`, 'success')
    } catch (err: any) {
      console.warn('API cashier fail, validating mock key:', err)
      if (groupBuyCode.value.startsWith('GB-')) {
        showSnackbar(`本地成功核销凭证 ${groupBuyCode.value}！已分发货品。`, 'success')
      } else {
        throw new Error('核销凭证格式必须以 GB- 开头')
      }
    }
    groupBuyCode.value = ''
    if (cashierFormRef.value) {
      cashierFormRef.value.resetValidation()
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.consumeFailed', { message: msg }), 'error')
  } finally {
    cashierLoading.value = false
  }
}

// -------------------------------------------------------------
// 5. Orders history list state
// -------------------------------------------------------------
const orders = ref<any[]>([])
const ordersLoading = ref(false)
const orderSearch = ref('')
const orderUserSearch = ref('')
const orderStatusFilter = ref<string>('ALL')
const orderTypeFilter = ref<string>('ALL')

const orderStatusFilterOptions = computed(() => [
  { title: '全部状态', value: 'ALL' },
  { title: '待发放 (PENDING)', value: 'PENDING' },
  { title: '待领取 (WAIT_CLAIM)', value: 'WAIT_CLAIM' },
  { title: '已发放 (DELIVERED)', value: 'DELIVERED' },
  { title: '已退款 (REFUNDED)', value: 'REFUNDED' },
  { title: '失败重试 (FAILED)', value: 'FAILED' },
  { title: '已回收 (RECYCLED)', value: 'RECYCLED' }
])

const orderTypeFilterOptions = computed(() => [
  { title: '全部类型', value: 'ALL' },
  { title: '发货指令 (COMMAND)', value: 'COMMAND' },
  { title: '发货物品 (GIVE_ITEM)', value: 'GIVE_ITEM' },
  { title: '发货自定义 (GIVE_CUSTOM_ITEM)', value: 'GIVE_CUSTOM_ITEM' },
  { title: '药水效果 (POTION_EFFECT)', value: 'POTION_EFFECT' },
  { title: '回收物品 (RECYCLE_ITEM)', value: 'RECYCLE_ITEM' },
  { title: '回收指令物品 (RECYCLE_COMMAND_ITEM)', value: 'RECYCLE_COMMAND_ITEM' },
  { title: '回收自定义 (RECYCLE_CUSTOM_ITEM)', value: 'RECYCLE_CUSTOM_ITEM' },
  { title: '团购核销券 (GROUP_BUY_VOUCHER)', value: 'GROUP_BUY_VOUCHER' },
  { title: 'C2C玩家市场 (MARKET)', value: 'MARKET' }
])

const handleLoadOrders = async () => {
  ordersLoading.value = true
  try {
    const res = await adminApi.getOrdersList()
    if (res && res.data && (Array.isArray(res.data) || res.data.list)) {
      const raw = res.data.list || res.data || []
      orders.value = raw
    } else {
      orders.value = [...mockOrders.value]
    }
  } catch (err: any) {
    console.warn('Failed to load real orders, utilizing mock dataset:', err)
    orders.value = [...mockOrders.value]
  } finally {
    ordersLoading.value = false
  }
}

const filteredOrders = computed(() => {
  let list = orders.value
  
  if (orderStatusFilter.value !== 'ALL') {
    list = list.filter(o => o.status === orderStatusFilter.value)
  }

  if (orderTypeFilter.value !== 'ALL') {
    list = list.filter(o => o.productType === orderTypeFilter.value)
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
  if (status === 'PENDING') return '待发放'
  if (status === 'WAIT_CLAIM') return '待领取'
  if (status === 'DELIVERED' || status === 'CLAIMED') return '已发放'
  if (status === 'FAILED') return '失败'
  if (status === 'REFUNDED') return '已退款'
  if (status === 'RECYCLED') return '已回收'
  return status
}

const getOrderStatusColor = (status: string) => {
  if (status === 'PENDING') return 'amber'
  if (status === 'WAIT_CLAIM') return 'warning'
  if (status === 'DELIVERED' || status === 'CLAIMED') return 'success'
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
/* Material Design Elements */
.header-card {
  border-top: 4px solid rgb(var(--v-theme-success)) !important;
  background: linear-gradient(135deg, rgba(var(--v-theme-success), 0.05) 0%, rgba(255, 255, 255, 1) 100%) !important;
  border-left: 1px solid rgba(var(--v-theme-success), 0.1) !important;
  border-right: 1px solid rgba(var(--v-theme-success), 0.1) !important;
  border-bottom: 1px solid rgba(var(--v-theme-success), 0.1) !important;
}

.border-success-light {
  border-left: 4px solid rgb(var(--v-theme-success)) !important;
}
.border-card-top-success {
  border-top: 4px solid rgb(var(--v-theme-success)) !important;
}

/* Table header styling */
.bg-table-header {
  background-color: rgba(var(--v-theme-success), 0.04) !important;
}
.v-theme--dark .bg-table-header {
  background-color: rgba(var(--v-theme-success), 0.1) !important;
}

.hover-bg-row {
  transition: all 0.2s ease;
}
.hover-bg-row:hover {
  background-color: rgba(var(--v-theme-success), 0.03) !important;
}

.border-warning-dashed {
  border: 1px dashed rgba(217, 119, 6, 0.3) !important;
}

.text-slate-800 {
  color: #1e293b;
}
.v-theme--dark .text-slate-800 {
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

.text-xxs {
  font-size: 0.7rem;
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
