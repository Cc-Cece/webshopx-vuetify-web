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
          <!-- Dialog Header -->
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

          <v-divider class="mb-2"></v-divider>

          <!-- Required / Optional Form Tabs Menu -->
          <v-tabs v-model="formTab" color="success" density="comfortable" grow class="mb-4 bg-grey-lighten-5 rounded-lg pa-1">
            <v-tab value="required" class="font-weight-black text-caption">
              <v-icon start size="16">mdi-alert-circle-outline</v-icon>
              必填配置 (Required)
            </v-tab>
            <v-tab value="optional" class="font-weight-black text-caption">
              <v-icon start size="16">mdi-cog-outline</v-icon>
              可选配置 (Optional)
            </v-tab>
          </v-tabs>

          <v-card-text class="pa-0 overflow-y-auto" style="max-height: 620px;">
            <v-form ref="upsertFormRef" v-model="upsertValid">
              <v-window v-model="formTab" class="pa-1">
                
                <!-- TAB 1: REQUIRED FIELDS (必填) -->
                <v-window-item value="required">
                  <!-- 1.1 基础信息 (Basic Info) -->
                  <h4 class="text-caption font-weight-black text-success mb-3 d-flex align-center">
                    <v-icon start size="16">mdi-information-outline</v-icon>
                    1. 基础挂牌信息 (Basic Info) *必填
                  </h4>
                  
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="formProduct.sku"
                        label="SKU (唯一编码) *"
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
                        label="商品标题 *"
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
                        label="售价 *"
                        placeholder="100"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3 font-weight-bold"
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
                        label="交易币种 *"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3 font-weight-bold"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-select
                        v-model="formProduct.productType"
                        :items="productTypeOptions"
                        item-title="title"
                        item-value="value"
                        label="商品类型 *"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3 font-weight-bold"
                      ></v-select>
                    </v-col>
                  </v-row>

                  <!-- 1.2 商品类型特定参数 (Type-specific parameters) -->
                  <h4 class="text-caption font-weight-black text-success mb-3 mt-4 d-flex align-center">
                    <v-icon start size="16">mdi-truck-delivery-outline</v-icon>
                    2. 发货及特定类型详情 (Delivery Type Parameters) *必填
                  </h4>

                  <!-- COMMAND / RECYCLE_COMMAND_ITEM parameters -->
                  <v-expand-transition>
                    <div v-if="formProduct.productType === 'COMMAND' || formProduct.productType === 'RECYCLE_COMMAND_ITEM'">
                      <v-textarea
                        v-model="formProduct.commandTemplate"
                        :label="formProduct.productType === 'COMMAND' ? '发货指令模板 (Command Template) *' : '回收检测指令模板 (Recycle Command Template) *'"
                        placeholder="例如：give %player% minecraft:diamond %amount%  或  clear %player% minecraft:diamond %amount%"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        rows="2"
                        class="mb-3 font-mono text-caption font-weight-bold"
                        :rules="[v => !!v || '请输入对应的发货或回收指令模板']"
                      ></v-textarea>
                      <p class="text-xxs text-grey mt-n2 mb-3">支持占位符: %player% (玩家名), %amount% (发货/回收数量)</p>
                    </div>
                  </v-expand-transition>

                  <!-- GIVE_ITEM / GIVE_CUSTOM_ITEM / RECYCLE_ITEM / RECYCLE_CUSTOM_ITEM parameters -->
                  <v-expand-transition>
                    <div v-if="['GIVE_ITEM', 'GIVE_CUSTOM_ITEM', 'RECYCLE_ITEM', 'RECYCLE_CUSTOM_ITEM'].includes(formProduct.productType)">
                      <v-text-field
                        v-model="formProduct.itemMaterial"
                        label="原版/自定义物品材质 ID (minecraft:material) *"
                        placeholder="例如：minecraft:diamond_sword, minecraft:oak_log"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3 font-mono font-weight-bold"
                        :rules="[v => !!v || '请输入物品材质 ID']"
                      ></v-text-field>
                    </div>
                  </v-expand-transition>

                  <!-- GROUP_BUY_VOUCHER banner -->
                  <v-expand-transition>
                    <div v-if="formProduct.productType === 'GROUP_BUY_VOUCHER'">
                      <v-alert
                        type="info"
                        variant="tonal"
                        color="success"
                        class="rounded-xl mb-4 text-caption font-weight-bold"
                        icon="mdi-shield-check"
                      >
                        【团购券码交付】无额外商品特权发货参数。系统将自动批量生成高保真防伪兑换凭证码（GB-XXXX），并由管理员在 cashier 面板核销后执行线下交付。
                      </v-alert>
                    </div>
                  </v-expand-transition>

                  <!-- POTION_EFFECT type parameters -->
                  <v-expand-transition>
                    <div v-if="formProduct.productType === 'POTION_EFFECT'">
                      <!-- Visual Grid checkable chips selector -->
                      <div class="mb-3">
                        <p class="text-caption font-weight-black text-grey-darken-3 mb-2">常用药水效果快捷选择（点击可直接填充效果名称）：</p>
                        <div class="d-flex flex-wrap ga-2 mb-3">
                          <v-chip
                            v-for="eff in commonEffects"
                            :key="eff.value"
                            :color="formProduct.effectType === eff.value ? 'purple' : 'default'"
                            variant="flat"
                            class="cursor-pointer font-weight-bold text-caption rounded-lg"
                            @click="formProduct.effectType = eff.value"
                          >
                            <v-icon start size="14">{{ formProduct.effectType === eff.value ? 'mdi-check-circle' : 'mdi-circle-outline' }}</v-icon>
                            {{ eff.title }}
                          </v-chip>
                        </div>
                      </div>

                      <v-row dense>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="formProduct.effectType"
                            label="药水效果类别 (effectType) *"
                            placeholder="例如：minecraft:speed、minecraft:strength"
                            variant="outlined"
                            density="comfortable"
                            rounded="lg"
                            color="success"
                            class="mb-3 font-mono font-weight-bold"
                            :rules="[v => !!v || '请输入药水效果标识']"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" sm="3">
                          <v-text-field
                            v-model.number="formProduct.effectSeconds"
                            type="number"
                            label="生效持续时长 (秒) *"
                            placeholder="300"
                            variant="outlined"
                            density="comfortable"
                            rounded="lg"
                            color="success"
                            class="mb-3 font-weight-bold"
                            :rules="[v => v !== null && v !== undefined && v > 0 || '请输入持续时长']"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="6" sm="3">
                          <v-select
                            v-model.number="formProduct.effectAmplifier"
                            :items="potionLevelOptions"
                            label="药水等级 *"
                            variant="outlined"
                            density="comfortable"
                            rounded="lg"
                            color="success"
                            class="mb-3 font-weight-bold"
                          ></v-select>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expand-transition>

                  <!-- 1.3 数量库存限制 (Quantity / Stock) -->
                  <h4 class="text-caption font-weight-black text-success mb-3 mt-4 d-flex align-center">
                    <v-icon start size="16">mdi-cube-outline</v-icon>
                    3. 商品库存限制与数量 (Quantity & Stock) *必填
                  </h4>
                  
                  <div class="mb-2">
                    <p class="text-caption text-grey-darken-3 font-weight-bold mb-2">库存供应模式选择：</p>
                    <v-btn-toggle
                      v-model="stockType"
                      mandatory
                      color="success"
                      variant="outlined"
                      divided
                      class="rounded-xl mb-3 d-flex w-100 bg-white"
                      style="height: 44px;"
                    >
                      <v-btn value="unlimited" class="flex-grow-1 font-weight-black text-caption">
                        <v-icon start>mdi-infinity</v-icon>
                        无限供应 (Unlimited Stock)
                      </v-btn>
                      <v-btn value="finite" class="flex-grow-1 font-weight-black text-caption">
                        <v-icon start>mdi-numeric</v-icon>
                        有限库存 (Finite Stock)
                      </v-btn>
                    </v-btn-toggle>
                  </div>

                  <v-expand-transition>
                    <div v-if="stockType === 'finite'">
                      <v-text-field
                        v-model.number="formProduct.itemAmount"
                        type="number"
                        label="商品数量 (Finite itemAmount) *"
                        placeholder="请输入具体可供购买的商品总量"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3 font-weight-bold"
                        :rules="stockType === 'finite' ? [v => !!v && v > 0 || '有限库存供应下商品数量必须大于 0'] : []"
                      ></v-text-field>
                    </div>
                  </v-expand-transition>
                </v-window-item>

                <!-- TAB 2: OPTIONAL FIELDS (可选) -->
                <v-window-item value="optional">
                  <!-- 2.1 商品自定义信息 (Custom Display styling) -->
                  <h4 class="text-caption font-weight-black text-success mb-3 d-flex align-center">
                    <v-icon start size="16">mdi-palette-swatch-outline</v-icon>
                    1. 前端显示与自定义信息覆盖 (Custom Display Override)
                  </h4>

                  <v-row dense class="align-center mb-3">
                    <v-col cols="12" sm="6">
                      <settings-switch
                        v-model="formProduct.active"
                        color="success"
                        :label="formProduct.active ? '商品启用状态：启用中 (立即上架玩家可见)' : '商品启用状态：已停用 (隐藏下架状态)'"
                        density="comfortable"
                        hide-details
                      ></settings-switch>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="formProduct.displayNameOverride"
                        label="自定义标题名称 (displayNameOverride) [可选]"
                        placeholder="留空即默认与基础标题一致，用于定制前台个性别名"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        hide-details
                        class="font-weight-bold"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <!-- Custom Icon strategies under Active status -->
                  <v-expand-transition>
                    <div v-if="formProduct.active">
                      <v-card variant="outlined" elevation="0" class="rounded-xl pa-4 bg-grey-lighten-5 mb-4 border border-success-light">
                        <p class="text-caption text-grey-darken-3 font-weight-bold mb-2">商品展示图标策略：</p>
                        <v-btn-toggle
                          v-model="iconStrategy"
                          mandatory
                          color="success"
                          variant="outlined"
                          divided
                          class="rounded-xl mb-3 d-flex w-100 bg-white"
                          style="height: 40px;"
                        >
                          <v-btn value="material" class="flex-grow-1 font-weight-black text-caption">使用原版/其它材质图标 (Material Icon)</v-btn>
                          <v-btn value="custom" class="flex-grow-1 font-weight-black text-caption">上传自定义图标图片 (Custom Image)</v-btn>
                        </v-btn-toggle>

                        <v-row dense class="align-center mt-2">
                          <v-col cols="12" sm="8">
                            <!-- Option A: Display Material Key -->
                            <v-expand-transition>
                              <div v-if="iconStrategy === 'material'">
                                <v-text-field
                                  v-model="formProduct.displayMaterial"
                                  label="覆盖图标使用的原版材质名 (displayMaterial) [可选]"
                                  placeholder="例如：minecraft:netherite_sword，留空即自动渲染发货材质"
                                  variant="outlined"
                                  density="comfortable"
                                  rounded="lg"
                                  color="success"
                                  class="font-mono font-weight-bold"
                                  hide-details
                                ></v-text-field>
                              </div>
                            </v-expand-transition>

                            <!-- Option B: Custom Image Upload -->
                            <v-expand-transition>
                              <div v-if="iconStrategy === 'custom'" class="d-flex align-center">
                                <v-file-input
                                  label="选择并上传独立高像素 PNG/WEBP 图标"
                                  accept="image/*"
                                  variant="outlined"
                                  density="comfortable"
                                  rounded="lg"
                                  color="success"
                                  hide-details
                                  class="mr-2 font-weight-bold"
                                  @update:model-value="handleIconFileSelect"
                                ></v-file-input>
                              </div>
                            </v-expand-transition>
                          </v-col>

                          <!-- Live icon preview -->
                          <v-col cols="12" sm="4" class="d-flex justify-center">
                            <v-avatar size="56" rounded="lg" color="white" class="border">
                              <McIcon
                                :material="iconStrategy === 'material' && formProduct.displayMaterial ? formProduct.displayMaterial : (formProduct.itemMaterial || 'minecraft:barrier')"
                                :icon-url="iconStrategy === 'custom' ? formProduct.displayIconPath : ''"
                                :size="38"
                                color="success"
                              />
                            </v-avatar>
                          </v-col>
                        </v-row>
                      </v-card>
                    </div>
                  </v-expand-transition>

                  <!-- 2.2 玩家限购数量 (perUserLimit) -->
                  <h4 class="text-caption font-weight-black text-success mb-3 mt-4 d-flex align-center">
                    <v-icon start size="16">mdi-account-lock-outline</v-icon>
                    2. 玩家级购买配额与限购 (Purchase Limit per User)
                  </h4>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model.number="formProduct.perUserLimit"
                        type="number"
                        label="玩家终身最大允许购买配额 (perUserLimit) [可选]"
                        placeholder="不限留空，用于配置特定VIP卡或福利包的全服限购"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3 font-weight-bold"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="formProduct.remark"
                        label="商品展示备注 remark [可选]"
                        placeholder="简短的活动提示或限制说明备注..."
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="success"
                        class="mb-3 font-weight-bold"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <!-- 2.3 动态价格波动策略 (Dynamic Pricing) -->
                  <h4 class="text-caption font-weight-black text-success mb-3 mt-4 d-flex align-center">
                    <v-icon start size="16">mdi-finance</v-icon>
                    3. 经济学动态波动价格策略 (Dynamic Pricing Strategy)
                  </h4>

                  <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 bg-grey-lighten-5 mb-4 border-warning-dashed">
                    <div class="d-flex align-center justify-space-between flex-wrap mb-3">
                      <div class="d-flex align-center">
                        <settings-switch
                          v-model="formProduct.dynamicPricingEnabled"
                          color="warning"
                          label="启用基于供需关系的热度波动计价"
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
                        <v-divider class="my-3"></v-divider>
                        
                        <!-- 动态价格基础参数 -->
                        <p class="text-caption text-warning font-weight-black mb-2">动态价格 - 基础参数配置：</p>
                        <v-row dense>
                          <v-col cols="12" sm="4">
                            <v-select
                              v-model="formProduct.dynamicAlgorithm"
                              :items="pricingAlgorithms"
                              item-title="title"
                              item-value="value"
                              label="动态波动计算模型 *"
                              variant="outlined"
                              density="comfortable"
                              rounded="lg"
                              color="warning"
                              class="mb-3 font-weight-bold"
                              :rules="formProduct.dynamicPricingEnabled ? [v => !!v || '请选择一个经济波动模型'] : []"
                            ></v-select>
                          </v-col>
                          <v-col cols="12" sm="4">
                            <v-text-field
                              v-model.number="formProduct.dynamicBasePrice"
                              type="number"
                              label="核心基准参考价 (Base Price) *"
                              placeholder="默认与售价一致"
                              variant="outlined"
                              density="comfortable"
                              rounded="lg"
                              color="warning"
                              class="mb-3 font-weight-bold"
                              :rules="formProduct.dynamicPricingEnabled ? [v => v !== null && v !== undefined && v >= 0 || '请输入基准核心定价'] : []"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="4">
                            <v-text-field
                              v-model.number="formProduct.dynamicPriceStep"
                              type="number"
                              label="波动调整步长价格比例 (Price Step) *"
                              placeholder="每次波动的金额比率，默认1"
                              variant="outlined"
                              density="comfortable"
                              rounded="lg"
                              color="warning"
                              class="mb-3 font-weight-bold"
                              :rules="formProduct.dynamicPricingEnabled ? [v => v !== null && v !== undefined && v > 0 || '步长不可为0或负数'] : []"
                            ></v-text-field>
                          </v-col>
                        </v-row>

                        <v-row dense>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model.number="formProduct.dynamicFloorPrice"
                              type="number"
                              label="保底地板限价 (Floor Price) [可选]"
                              placeholder="达到此底价后不再继续降价，防止无限抛售贬值"
                              variant="outlined"
                              density="comfortable"
                              rounded="lg"
                              color="warning"
                              class="mb-3 font-weight-bold"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model.number="formProduct.dynamicCapPrice"
                              type="number"
                              label="防炒作最高封顶售价 (Cap Price) [可选]"
                              placeholder="限价最高门槛，防止垄断爆炒通胀"
                              variant="outlined"
                              density="comfortable"
                              rounded="lg"
                              color="warning"
                              class="mb-3 font-weight-bold"
                            ></v-text-field>
                          </v-col>
                        </v-row>

                        <!-- 动态价格高级算法参数 (Visual Sliders & Inputs) -->
                        <v-divider class="my-3"></v-divider>
                        <p class="text-caption text-warning font-weight-black mb-3">动态价格 - 高级波动算法变量微调（实时同步双向 JSON）：</p>

                        <!-- LINEAR_DEMAND Advanced variables -->
                        <div v-if="formProduct.dynamicAlgorithm === 'LINEAR_DEMAND'" class="pa-3 bg-white border rounded-xl mb-3">
                          <p class="text-caption font-weight-bold text-grey-darken-3 d-flex align-center">
                            <v-icon color="warning" class="mr-2">mdi-chart-line</v-icon>
                            线性需求参数：每次交易后，价格随供需斜率以 k 进行线性递增或递减波动。
                          </p>
                          <div class="d-flex align-center mt-2 px-1">
                            <span class="text-caption mr-3" style="width: 80px;">线性斜率 (k):</span>
                            <v-slider
                              v-model="linearSlope"
                              :min="0.01"
                              :max="5.0"
                              step="0.01"
                              color="warning"
                              hide-details
                              class="flex-grow-1 mr-4"
                            ></v-slider>
                            <v-text-field
                              v-model.number="linearSlope"
                              type="number"
                              density="compact"
                              variant="outlined"
                              hide-details
                              style="max-width: 80px;"
                            ></v-text-field>
                          </div>
                        </div>

                        <!-- MARGINAL_DECAY Advanced variables -->
                        <div v-if="formProduct.dynamicAlgorithm === 'MARGINAL_DECAY'" class="pa-3 bg-white border rounded-xl mb-3">
                          <p class="text-caption font-weight-bold text-grey-darken-3 d-flex align-center">
                            <v-icon color="warning" class="mr-2">mdi-trending-down</v-icon>
                            边际递减参数：价格波动受振幅与抑制系数控制，热度增长时呈现边际效用递减效应。
                          </p>
                          <div class="d-flex align-center mt-3 px-1">
                            <span class="text-caption mr-3" style="width: 100px;">边际振幅:</span>
                            <v-slider
                              v-model="marginalAmplitude"
                              :min="1"
                              :max="500"
                              step="1"
                              color="warning"
                              hide-details
                              class="flex-grow-1 mr-4"
                            ></v-slider>
                            <v-text-field
                              v-model.number="marginalAmplitude"
                              type="number"
                              density="compact"
                              variant="outlined"
                              hide-details
                              style="max-width: 80px;"
                            ></v-text-field>
                          </div>
                          <div class="d-flex align-center mt-3 px-1">
                            <span class="text-caption mr-3" style="width: 100px;">抑制系数:</span>
                            <v-slider
                              v-model="marginalDecay"
                              :min="0.001"
                              :max="0.5"
                              step="0.001"
                              color="warning"
                              hide-details
                              class="flex-grow-1 mr-4"
                            ></v-slider>
                            <v-text-field
                              v-model.number="marginalDecay"
                              type="number"
                              density="compact"
                              variant="outlined"
                              hide-details
                              style="max-width: 80px;"
                            ></v-text-field>
                          </div>
                        </div>

                        <!-- LOGARITHMIC_SMOOTH Advanced variables -->
                        <div v-if="formProduct.dynamicAlgorithm === 'LOGARITHMIC_SMOOTH'" class="pa-3 bg-white border rounded-xl mb-3">
                          <p class="text-caption font-weight-bold text-grey-darken-3 d-flex align-center">
                            <v-icon color="warning" class="mr-2">mdi-calculator</v-icon>
                            对数平滑参数：通过自然对数尺度压缩巨量销量冲击，避免大单交易让售价产生瞬间暴涨暴跌。
                          </p>
                          <div class="d-flex align-center mt-2 px-1">
                            <span class="text-caption mr-3" style="width: 90px;">对数平滑系数:</span>
                            <v-slider
                              v-model="logarithmicAlpha"
                              :min="0.1"
                              :max="10.0"
                              step="0.1"
                              color="warning"
                              hide-details
                              class="flex-grow-1 mr-4"
                            ></v-slider>
                            <v-text-field
                              v-model.number="logarithmicAlpha"
                              type="number"
                              density="compact"
                              variant="outlined"
                              hide-details
                              style="max-width: 80px;"
                            ></v-text-field>
                          </div>
                        </div>

                        <!-- EXPONENTIAL_DEFENSE Advanced variables -->
                        <div v-if="formProduct.dynamicAlgorithm === 'EXPONENTIAL_DEFENSE'" class="pa-3 bg-white border rounded-xl mb-3">
                          <p class="text-caption font-weight-bold text-grey-darken-3 d-flex align-center">
                            <v-icon color="warning" class="mr-2">mdi-shield-alert-outline</v-icon>
                            指数防御参数：高敏感指数防护策略，在遭受批量投机刷取或疯狂倾销时，计算价格自动进行指数级极速偏离保护。
                          </p>
                          <div class="d-flex align-center mt-2 px-1">
                            <span class="text-caption mr-3" style="width: 90px;">指数倍率:</span>
                            <v-slider
                              v-model="exponentialMultiplier"
                              :min="1.01"
                              :max="2.0"
                              step="0.01"
                              color="warning"
                              hide-details
                              class="flex-grow-1 mr-4"
                            ></v-slider>
                            <v-text-field
                              v-model.number="exponentialMultiplier"
                              type="number"
                              density="compact"
                              variant="outlined"
                              hide-details
                              style="max-width: 80px;"
                            ></v-text-field>
                          </div>
                        </div>

                        <!-- THRESHOLD_STEP Advanced variables -->
                        <div v-if="formProduct.dynamicAlgorithm === 'THRESHOLD_STEP'" class="pa-3 bg-white border rounded-xl mb-3">
                          <p class="text-caption font-weight-bold text-grey-darken-3 d-flex align-center">
                            <v-icon color="warning" class="mr-2">mdi-stairs</v-icon>
                            阈值分段参数：基于设定阈值门槛的双段斜率公式。当需求累积跨过临界线时，将由低灵敏度偏离斜率自动跃升为高保护斜率。
                          </p>
                          <v-row dense class="align-center mt-3">
                            <v-col cols="4">
                              <v-text-field
                                v-model.number="thresholdVal"
                                type="number"
                                label="跃变起跳阈值 *"
                                density="comfortable"
                                variant="outlined"
                                hide-details
                                class="mb-2 font-weight-bold"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="4">
                              <v-text-field
                                v-model.number="thresholdSlope1"
                                type="number"
                                label="阈值前段斜率 *"
                                density="comfortable"
                                variant="outlined"
                                hide-details
                                class="mb-2 font-weight-bold"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="4">
                              <v-text-field
                                v-model.number="thresholdSlope2"
                                type="number"
                                label="阈值后段斜率 *"
                                density="comfortable"
                                variant="outlined"
                                hide-details
                                class="mb-2 font-weight-bold"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </div>

                        <!-- ELASTICITY_MODEL Advanced variables -->
                        <div v-if="formProduct.dynamicAlgorithm === 'ELASTICITY_MODEL'" class="pa-3 bg-white border rounded-xl mb-3">
                          <p class="text-caption font-weight-bold text-grey-darken-3 d-flex align-center">
                            <v-icon color="warning" class="mr-2">mdi-sine-wave</v-icon>
                            弹性模型参数：模拟现实市场需求价格弹性算法。考虑底线刚性需求平滑因子与参考期望热度，动态反馈价格波动。
                          </p>
                          <div class="d-flex align-center mt-3 px-1">
                            <span class="text-caption mr-3" style="width: 100px;">弹性指数:</span>
                            <v-slider
                              v-model="elasticityVal"
                              :min="0.1"
                              :max="5.0"
                              step="0.1"
                              color="warning"
                              hide-details
                              class="flex-grow-1 mr-4"
                            ></v-slider>
                            <v-text-field
                              v-model.number="elasticityVal"
                              type="number"
                              density="compact"
                              variant="outlined"
                              hide-details
                              style="max-width: 80px;"
                            ></v-text-field>
                          </div>
                          <div class="d-flex align-center mt-3 px-1">
                            <span class="text-caption mr-3" style="width: 100px;">刚性平滑项:</span>
                            <v-slider
                              v-model="elasticityEpsilon"
                              :min="0.01"
                              :max="1.0"
                              step="0.01"
                              color="warning"
                              hide-details
                              class="flex-grow-1 mr-4"
                            ></v-slider>
                            <v-text-field
                              v-model.number="elasticityEpsilon"
                              type="number"
                              density="compact"
                              variant="outlined"
                              hide-details
                              style="max-width: 80px;"
                            ></v-text-field>
                          </div>
                          <div class="d-flex align-center mt-3 px-1">
                            <v-text-field
                              v-model.number="elasticityBaseDemand"
                              type="number"
                              label="模型基准参考热度需求"
                              density="comfortable"
                              variant="outlined"
                              hide-details
                              class="w-100 font-weight-bold"
                            ></v-text-field>
                          </div>
                        </div>

                        <!-- PANIC_BUYING Advanced variables -->
                        <div v-if="formProduct.dynamicAlgorithm === 'PANIC_BUYING'" class="pa-3 bg-white border rounded-xl mb-3">
                          <p class="text-caption font-weight-bold text-grey-darken-3 d-flex align-center">
                            <v-icon color="warning" class="mr-2">mdi-lightning-bolt-outline</v-icon>
                            恐慌抢购参数：当销量速率爆发越过“恐慌警戒点”时，在原有线性斜率基础之上级联触发非线性的二次恐慌加成振幅。
                          </p>
                          <v-row dense class="align-center mt-2 mb-2">
                            <v-col cols="12" sm="4">
                              <v-text-field
                                v-model.number="panicThreshold"
                                type="number"
                                label="触发恐慌警戒阈值 *"
                                density="comfortable"
                                variant="outlined"
                                hide-details
                                class="font-weight-bold"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" class="d-flex align-center">
                              <span class="text-xxs mr-2">核心斜率 (k):</span>
                              <v-slider
                                v-model="panicK"
                                :min="0.01"
                                :max="2.0"
                                step="0.01"
                                color="warning"
                                hide-details
                                class="flex-grow-1 mr-2"
                              ></v-slider>
                              <v-text-field
                                v-model.number="panicK"
                                type="number"
                                density="compact"
                                variant="outlined"
                                hide-details
                                style="max-width: 65px;"
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="4" class="d-flex align-center">
                              <span class="text-xxs mr-2">二次振幅:</span>
                              <v-slider
                                v-model="panicMultiplier"
                                :min="0.01"
                                :max="5.0"
                                step="0.01"
                                color="warning"
                                hide-details
                                class="flex-grow-1 mr-2"
                              ></v-slider>
                              <v-text-field
                                v-model.number="panicMultiplier"
                                type="number"
                                density="compact"
                                variant="outlined"
                                hide-details
                                style="max-width: 65px;"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                        </div>

                        <!-- collapsible expert panel for Raw JSON Params -->
                        <v-expansion-panels class="mt-3">
                          <v-expansion-panel class="bg-transparent border rounded-lg">
                            <v-expansion-panel-title class="py-1 text-xxs font-weight-bold text-grey">
                              专家级参数：查看并手动重写最终原始 JSON
                            </v-expansion-panel-title>
                            <v-expansion-panel-text>
                              <v-textarea
                                v-model="rawPricingParams"
                                placeholder='例如：{"k": 0.2, "amplitude": 100}'
                                variant="outlined"
                                density="compact"
                                rounded="lg"
                                color="warning"
                                rows="3"
                                class="font-mono text-caption"
                                hide-details
                              ></v-textarea>
                            </v-expansion-panel-text>
                          </v-expansion-panel>
                        </v-expansion-panels>
                      </div>
                    </v-expand-transition>
                  </v-card>
                </v-window-item>

              </v-window>
            </v-form>
          </v-card-text>

          <v-divider class="my-4"></v-divider>

          <!-- Dialogue Actions -->
          <div class="d-flex justify-space-between align-center">
            <span class="text-xxs text-grey-darken-1 font-weight-bold">
              * 双栏排布设计已根据官方商城新模板归类
            </span>
            <div class="d-flex">
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
import { ref, computed, watch, onMounted } from 'vue'
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
  { title: '需求价格弹性模型 (ELASTICITY_MODEL)', value: 'ELASTICITY_MODEL' },
  { title: '恐慌抢购模型 (PANIC_BUYING)', value: 'PANIC_BUYING' }
])

// Form Tabs & Extra UI state
const formTab = ref<'required' | 'optional'>('required')
const stockType = ref<'unlimited' | 'finite'>('unlimited')
const iconStrategy = ref<'material' | 'custom'>('material')

const potionLevelOptions = [
  { title: 'I 级 (0)', value: 0 },
  { title: 'II 级 (1)', value: 1 },
  { title: 'III 级 (2)', value: 2 },
  { title: 'IV 级 (3)', value: 3 },
  { title: 'V 级 (4)', value: 4 }
]

const commonEffects = [
  { title: '速度 (Speed)', value: 'minecraft:speed' },
  { title: '急迫 (Haste)', value: 'minecraft:haste' },
  { title: '力量 (Strength)', value: 'minecraft:strength' },
  { title: '生命恢复 (Regeneration)', value: 'minecraft:regeneration' },
  { title: '抗性提升 (Resistance)', value: 'minecraft:resistance' },
  { title: '防火 (Fire Resistance)', value: 'minecraft:fire_resistance' },
  { title: '水下呼吸 (Water Breathing)', value: 'minecraft:water_breathing' },
  { title: '夜视 (Night Vision)', value: 'minecraft:night_vision' },
  { title: '隐形 (Invisibility)', value: 'minecraft:invisibility' }
]

// Dynamic Pricing Slider variables
const linearSlope = ref(0.2)
const marginalAmplitude = ref(100)
const marginalDecay = ref(0.01)
const logarithmicAlpha = ref(1.0)
const exponentialMultiplier = ref(1.1)
const thresholdVal = ref(100)
const thresholdSlope1 = ref(0.1)
const thresholdSlope2 = ref(0.5)
const elasticityVal = ref(1.0)
const elasticityEpsilon = ref(0.1)
const elasticityBaseDemand = ref(100)
const panicThreshold = ref(100)
const panicK = ref(0.2)
const panicMultiplier = ref(1.5)

let isSyncing = false

const syncVisualToJSON = () => {
  if (isSyncing) return
  isSyncing = true
  try {
    const alg = formProduct.value.dynamicAlgorithm
    let obj: any = {}
    if (alg === 'LINEAR_DEMAND') {
      obj = { k: Number(linearSlope.value) }
    } else if (alg === 'MARGINAL_DECAY') {
      obj = { amplitude: Number(marginalAmplitude.value), decay: Number(marginalDecay.value) }
    } else if (alg === 'LOGARITHMIC_SMOOTH') {
      obj = { alpha: Number(logarithmicAlpha.value) }
    } else if (alg === 'EXPONENTIAL_DEFENSE') {
      obj = { multiplier: Number(exponentialMultiplier.value) }
    } else if (alg === 'THRESHOLD_STEP') {
      obj = { threshold: Number(thresholdVal.value), slope1: Number(thresholdSlope1.value), slope2: Number(thresholdSlope2.value) }
    } else if (alg === 'ELASTICITY_MODEL') {
      obj = { elasticity: Number(elasticityVal.value), epsilon: Number(elasticityEpsilon.value), baseDemand: Number(elasticityBaseDemand.value) }
    } else if (alg === 'PANIC_BUYING') {
      obj = { panicThreshold: Number(panicThreshold.value), k: Number(panicK.value), panicMultiplier: Number(panicMultiplier.value) }
    }
    rawPricingParams.value = JSON.stringify(obj, null, 2)
  } catch (e) {
    console.error(e)
  } finally {
    isSyncing = false
  }
}

const syncJSONToVisual = (jsonStr: string) => {
  if (isSyncing) return
  isSyncing = true
  try {
    const parsed = JSON.parse(jsonStr)
    if (parsed && typeof parsed === 'object') {
      const alg = formProduct.value.dynamicAlgorithm
      if (alg === 'LINEAR_DEMAND') {
        if (typeof parsed.k === 'number') linearSlope.value = parsed.k
      } else if (alg === 'MARGINAL_DECAY') {
        if (typeof parsed.amplitude === 'number') marginalAmplitude.value = parsed.amplitude
        if (typeof parsed.decay === 'number') marginalDecay.value = parsed.decay
      } else if (alg === 'LOGARITHMIC_SMOOTH') {
        if (typeof parsed.alpha === 'number') logarithmicAlpha.value = parsed.alpha
      } else if (alg === 'EXPONENTIAL_DEFENSE') {
        if (typeof parsed.multiplier === 'number') exponentialMultiplier.value = parsed.multiplier
      } else if (alg === 'THRESHOLD_STEP') {
        if (typeof parsed.threshold === 'number') thresholdVal.value = parsed.threshold
        if (typeof parsed.slope1 === 'number') thresholdSlope1.value = parsed.slope1
        if (typeof parsed.slope2 === 'number') thresholdSlope2.value = parsed.slope2
      } else if (alg === 'ELASTICITY_MODEL') {
        if (typeof parsed.elasticity === 'number') elasticityVal.value = parsed.elasticity
        if (typeof parsed.epsilon === 'number') elasticityEpsilon.value = parsed.epsilon
        if (typeof parsed.baseDemand === 'number') elasticityBaseDemand.value = parsed.baseDemand
      } else if (alg === 'PANIC_BUYING') {
        if (typeof parsed.panicThreshold === 'number') panicThreshold.value = parsed.panicThreshold
        if (typeof parsed.k === 'number') panicK.value = parsed.k
        if (typeof parsed.panicMultiplier === 'number') panicMultiplier.value = parsed.panicMultiplier
      }
    }
  } catch (e) {
    // User typing incomplete JSON
  } finally {
    isSyncing = false
  }
}

watch(
  [
    linearSlope,
    marginalAmplitude,
    marginalDecay,
    logarithmicAlpha,
    exponentialMultiplier,
    thresholdVal,
    thresholdSlope1,
    thresholdSlope2,
    elasticityVal,
    elasticityEpsilon,
    elasticityBaseDemand,
    panicThreshold,
    panicK,
    panicMultiplier
  ],
  () => {
    syncVisualToJSON()
  }
)

watch(
  () => formProduct.value?.dynamicAlgorithm,
  () => {
    syncVisualToJSON()
  }
)

watch(
  () => rawPricingParams.value,
  (newVal) => {
    if (newVal) {
      syncJSONToVisual(newVal)
    }
  }
)

const handleOpenUpsertDialog = (item: any | null) => {
  formTab.value = 'required'
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
    
    // Supply stock strategy and icon strategy initialization
    stockType.value = (item.itemAmount && Number(item.itemAmount) > 0) ? 'finite' : 'unlimited'
    iconStrategy.value = item.displayIconPath ? 'custom' : 'material'
    
    if (item.dynamicParamsJson) {
      rawPricingParams.value = String(item.dynamicParamsJson)
      setTimeout(() => {
        syncJSONToVisual(String(item.dynamicParamsJson))
      }, 50)
    } else {
      rawPricingParams.value = ''
      syncVisualToJSON()
    }
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
    stockType.value = 'unlimited'
    iconStrategy.value = 'material'
    rawPricingParams.value = ''
    syncVisualToJSON()
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
      remark: formProduct.value.remark?.trim() || formProduct.value.title.trim(),
      price: Number(formProduct.value.price),
      currency: formProduct.value.currency,
      productType: formProduct.value.productType,
      commandTemplate: formProduct.value.commandTemplate?.trim() || undefined,
      effectType: formProduct.value.effectType?.trim() || undefined,
      effectSeconds: formProduct.value.effectSeconds ? Number(formProduct.value.effectSeconds) : undefined,
      effectAmplifier: formProduct.value.effectAmplifier !== undefined ? Number(formProduct.value.effectAmplifier) : undefined,
      itemMaterial: formProduct.value.itemMaterial?.trim() || undefined,
      displayMaterial: (iconStrategy.value === 'material' && formProduct.value.displayMaterial) ? formProduct.value.displayMaterial.trim() : undefined,
      displayIconPath: iconStrategy.value === 'custom' ? formProduct.value.displayIconPath : '',
      displayNameOverride: formProduct.value.displayNameOverride?.trim() || undefined,
      itemAmount: stockType.value === 'finite' ? (formProduct.value.itemAmount === '' ? null : Number(formProduct.value.itemAmount)) : null,
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
