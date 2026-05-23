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
              color="warning"
              density="comfortable"
              class="rounded-lg bg-grey-lighten-4 pa-1"
            >
              <v-tab value="sales" prepend-icon="mdi-format-list-bulleted" class="rounded-lg font-weight-bold text-caption">{{ $t('admin.uiText.autoHtml.k0403') }}</v-tab>
              <v-tab value="limitations" prepend-icon="mdi-scale-balance" class="rounded-lg font-weight-bold text-caption">规则限制</v-tab>
              <v-tab value="overrides" prepend-icon="mdi-palette-swatch-outline" class="rounded-lg font-weight-bold text-caption">材质映射</v-tab>
            </v-tabs>
          </v-col>
        </v-row>
      </v-card>

      <!-- Tabs Contents -->
      <v-window v-model="activeTab">
        <!-- Sales Audit Tab -->
        <v-window-item value="sales">
          <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-warning-light">
            <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-4">实时在售挂单监控</h3>
            
            <!-- Filters -->
            <v-row dense class="mb-4">
              <v-col cols="12" sm="4" md="3">
                <v-text-field
                  v-model="salesSearch"
                  :label="$t('admin.uiText.autoHtml.k0420')"
                  :placeholder="$t('admin.uiText.autoHtml.k0421')"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="warning"
                  hide-details
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" md="2">
                <v-select
                  v-model="salesStatusFilter"
                  :items="salesStatusOptions"
                  label="状态筛选"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="warning"
                  hide-details
                  class="mb-3"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="4" md="2">
                <v-text-field
                  v-model="salesSellerFilter"
                  label="卖家"
                  placeholder="昵称或 UUID"
                  prepend-inner-icon="mdi-account"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="warning"
                  hide-details
                  class="mb-3"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" md="2">
                <v-select
                  v-model="salesCurrencyFilter"
                  :items="salesCurrencyOptions"
                  label="币种筛选"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="warning"
                  hide-details
                  class="mb-3"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="4" md="3" class="d-flex align-center">
                <v-btn
                  color="warning"
                  variant="flat"
                  rounded="lg"
                  height="44"
                  block
                  class="font-weight-black text-none text-caption"
                  prepend-icon="mdi-refresh"
                  :loading="salesLoading"
                  @click="handleLoadListings"
                >
                  {{ $t('admin.uiText.autoHtml.k0404') }}
                </v-btn>
              </v-col>
            </v-row>

            <!-- Table of listings -->
            <v-table class="bg-transparent text-caption rounded-xl overflow-hidden border">
              <thead>
                <tr class="bg-table-header text-slate-800 font-weight-black">
                  <th class="font-weight-bold">ID</th>
                  <th class="font-weight-bold">物品</th>
                  <th class="font-weight-bold">类型</th>
                  <th class="font-weight-bold">价格</th>
                  <th class="font-weight-bold">买卖双方</th>
                  <th class="font-weight-bold">挂单备注</th>
                  <th class="font-weight-bold">状态</th>
                  <th class="font-weight-bold text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="salesLoading">
                  <td colspan="8" class="text-center py-6">
                    <v-progress-circular indeterminate color="warning" size="32"></v-progress-circular>
                    <div class="text-caption mt-2 text-medium-emphasis">加载在售挂单中，请稍后...</div>
                  </td>
                </tr>
                <tr v-else-if="filteredListings.length === 0">
                  <td colspan="8" class="text-center py-6 text-medium-emphasis">
                    {{ $t('admin.uiText.page.emptyState') }}
                  </td>
                </tr>
                <tr
                  v-for="item in filteredListings"
                  :key="item.id"
                  class="hover-bg-row"
                >
                  <td class="font-mono font-weight-bold">#{{ item.id }}</td>
                  <td>
                    <div class="d-flex align-center py-1">
                      <v-avatar size="32" rounded="lg" color="white" class="mr-2 border">
                        <McIcon
                          :material="item.material"
                          :icon-url="item.iconUrl"
                          :size="24"
                          color="warning"
                        />
                      </v-avatar>
                      <div>
                        <div class="font-weight-bold">{{ item.displayName || item.material || '未知物品' }}</div>
                        <div class="text-grey font-mono text-xxs">数量: x{{ item.quantity }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <v-chip size="x-small" :color="getTradeTypeColor(item.tradeType)" variant="tonal" class="font-weight-bold">
                      {{ getTradeTypeName(item.tradeType) }}
                    </v-chip>
                  </td>
                  <td>
                    <div class="font-weight-black">
                      {{ item.price }}
                      <span class="text-caption text-medium-emphasis font-weight-bold">
                        {{ item.currency === 'SHOP_COIN' ? shopCoinShort : gameCoinShort }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="text-caption leading-tight">
                      <div><span class="text-medium-emphasis">卖: </span>{{ item.sellerName || '未命名' }}</div>
                      <div v-if="item.buyerName"><span class="text-medium-emphasis">买: </span>{{ item.buyerName }}</div>
                    </div>
                  </td>
                  <td style="max-width: 150px;" class="text-truncate">
                    {{ item.comment || '无备注' }}
                  </td>
                  <td>
                    <v-chip size="x-small" :color="getListingStatusColor(item.status)" variant="flat" class="font-weight-bold">
                      {{ getListingStatusName(item.status) }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-btn
                      v-if="item.status === 'ON_SALE'"
                      color="error"
                      variant="tonal"
                      size="small"
                      rounded="lg"
                      class="font-weight-bold text-caption"
                      prepend-icon="mdi-hammer"
                      @click="confirmUnlist(item)"
                    >
                      强制下架
                    </v-btn>
                    <span v-else class="text-grey">--</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-window-item>

        <!-- Limitation & Tags Config Tab -->
        <v-window-item value="limitations">
          <v-row>
            <!-- Form Configurator -->
            <v-col cols="12" md="7">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 fill-height border-warning-light">
                <div class="d-flex align-center justify-between mb-4">
                  <h3 class="text-subtitle-1 font-weight-black text-slate-800">C2C 市场交易规则设置</h3>
                  <v-btn
                    color="warning"
                    variant="tonal"
                    size="small"
                    rounded="lg"
                    prepend-icon="mdi-refresh"
                    @click="handleLoadConfigs"
                  >
                    重载规则
                  </v-btn>
                </div>

                <v-form ref="limitationsFormRef" class="d-flex flex-column">
                  <h4 class="text-caption font-weight-black text-slate-800 border-b pb-1 mb-3">全局上架基本限度</h4>
                  <v-row dense>
                    <v-col cols="6">
                      <v-text-field
                        v-model.number="limitationsConfig.defaultMaxListings"
                        type="number"
                        :label="$t('admin.uiText.autoHtml.k0250')"
                        placeholder="5"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="warning"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" class="d-flex align-center">
                      <settings-switch
                        v-model="limitationsConfig.defaultCreateCostEnabled"
                        color="warning"
                        label="启用上架建单费"
                        density="comfortable"
                        hide-details
                      ></settings-switch>
                    </v-col>
                  </v-row>

                  <v-expand-transition>
                    <v-row dense v-if="limitationsConfig.defaultCreateCostEnabled">
                      <v-col cols="6">
                        <v-select
                          v-model="limitationsConfig.defaultCreateCostCurrency"
                          :items="currencySelectOptions"
                          label="上架费币种"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          color="warning"
                          class="mb-3"
                        ></v-select>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model.number="limitationsConfig.defaultCreateCostAmount"
                          type="number"
                          label="上架费金额"
                          placeholder="0"
                          variant="outlined"
                          density="comfortable"
                          rounded="lg"
                          color="warning"
                          class="mb-3"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-expand-transition>

                  <h4 class="text-caption font-weight-black text-slate-800 border-b pb-1 mb-3 mt-2">默认白名单匹配规则</h4>
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="limitationsConfig.defaultAllowSides"
                        label="允许上架方向 (AllowSides)*"
                        placeholder="SELL,BUY"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="warning"
                        class="mb-3"
                        hint="用逗号分隔，如 SELL,BUY"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="limitationsConfig.defaultAllowTradeTypes"
                        label="允许交易模式 (AllowTradeTypes)*"
                        placeholder="DIRECT,AUCTION"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="warning"
                        class="mb-3"
                        hint="用逗号分隔，如 DIRECT,AUCTION"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-row dense class="mt-2">
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="limitationsConfig.defaultAllowCurrencies"
                        label="允许结算币种 (AllowCurrencies)*"
                        placeholder="GAME_COIN,SHOP_COIN"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="warning"
                        class="mb-3"
                        hint="留空=不限，逗号分隔"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="limitationsConfig.defaultAllowTags"
                        label="允许分类标签 (AllowTags)*"
                        placeholder="weapon,armor"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="warning"
                        class="mb-3"
                        hint="留空=不限，逗号分隔"
                        persistent-hint
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <h4 class="text-caption font-weight-black text-slate-800 border-b pb-1 mb-3 mt-4 d-flex align-center justify-between">
                    <span>交易类型自定义标签规则 (Tags Config)</span>
                    <v-btn size="x-small" color="warning" variant="tonal" rounded="lg" prepend-icon="mdi-plus" @click="handleAddNewTag">
                      新增标签
                    </v-btn>
                  </h4>

                  <v-expansion-panels variant="accordion" class="mb-4">
                    <v-expansion-panel
                      v-for="(tag, index) in tagsConfig.tags"
                      :key="tag.code"
                      class="bg-transparent border rounded-lg mb-2"
                    >
                      <v-expansion-panel-title class="font-weight-bold py-2">
                        <div class="d-flex align-center justify-between w-100 pr-4">
                          <span>{{ tag.displayName || tag.code || '未命名标签' }} ({{ tag.code }})</span>
                          <v-chip size="x-small" color="primary" class="ml-2">优先级: {{ tag.priority }}</v-chip>
                        </div>
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-row dense class="pt-2">
                          <v-col cols="12" sm="4">
                            <v-text-field
                              v-model="tag.code"
                              label="标签 code"
                              placeholder="weapon"
                              variant="outlined"
                              density="compact"
                              rounded="lg"
                              color="warning"
                              class="mb-2"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="4">
                            <v-text-field
                              v-model="tag.displayName"
                              label="展示中文名称"
                              placeholder="武器"
                              variant="outlined"
                              density="compact"
                              rounded="lg"
                              color="warning"
                              class="mb-2"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="4">
                            <v-text-field
                              v-model.number="tag.priority"
                              type="number"
                              label="优先级"
                              placeholder="100"
                              variant="outlined"
                              density="compact"
                              rounded="lg"
                              color="warning"
                              class="mb-2"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-textarea
                          v-model="tag.materialInString"
                          label="匹配物品材质列表 (materialIn)*"
                          placeholder="DIAMOND_SWORD,IRON_SWORD"
                          variant="outlined"
                          density="compact"
                          rounded="lg"
                          color="warning"
                          rows="2"
                          class="mb-2"
                          hint="逗号分隔材质 Key"
                          persistent-hint
                        ></v-textarea>
                        <div class="d-flex justify-end mt-2">
                          <v-btn size="x-small" color="error" variant="tonal" rounded="lg" prepend-icon="mdi-trash-can-outline" @click="handleRemoveTag(index)">
                            删除标签
                          </v-btn>
                        </div>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>

                  <div class="d-flex justify-end mt-4">
                    <v-btn
                      color="warning"
                      variant="flat"
                      rounded="lg"
                      class="font-weight-black text-caption text-none"
                      prepend-icon="mdi-content-save-outline"
                      :loading="saveConfigsLoading"
                      @click="handleSaveConfigs"
                    >
                      保存规则限制与标签
                    </v-btn>
                  </div>
                </v-form>
              </v-card>
            </v-col>

            <!-- Raw JSON Editor -->
            <v-col cols="12" md="5">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-warning-dashed">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-2">高级 JSON 双轨编辑器</h3>
                <p class="text-caption text-medium-emphasis mb-4">
                  若有大量复杂嵌套规则需批量配置，建议在此处直接编写原生 JSON，点击“应用到可视化”验证无误后再点击保存。
                </p>

                <h4 class="text-caption font-weight-bold text-slate-800 mb-1">标签规则 (Tags JSON)</h4>
                <v-textarea
                  v-model="rawTagsConfigJSON"
                  placeholder="请输入标签配置 JSON"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="warning"
                  rows="10"
                  class="font-mono text-caption mb-3"
                ></v-textarea>

                <h4 class="text-caption font-weight-bold text-slate-800 mb-1">上架规则 (Limitations JSON)</h4>
                <v-textarea
                  v-model="rawLimitationsConfigJSON"
                  placeholder="请输入限额配置 JSON"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="warning"
                  rows="10"
                  class="font-mono text-caption mb-4"
                ></v-textarea>

                <v-btn
                  color="warning"
                  variant="tonal"
                  block
                  height="44"
                  rounded="lg"
                  class="font-weight-black text-caption text-none"
                  prepend-icon="mdi-swap-horizontal"
                  @click="handleApplyJSONToVisual"
                >
                  应用 JSON 到可视化表单
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Material Overrides Tab -->
        <v-window-item value="overrides">
          <v-row>
            <!-- Interactive Override Editor -->
            <v-col cols="12" md="4">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-warning-light fill-height">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-2">自定义材质名称与图标</h3>
                <p class="text-caption text-medium-emphasis mb-4">
                  在此为原版或模组中的物品标识配置专有的高保真汉化译名，并上传自定义图片图标。
                </p>

                <v-form ref="overrideFormRef" v-model="overrideValid" @submit.prevent="handleSaveOverride">
                  <v-text-field
                    v-model="formOverride.materialKey"
                    :label="$t('admin.uiText.autoHtml.k0390')"
                    :placeholder="$t('admin.uiText.autoHtml.k0391')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="warning"
                    class="mb-3 font-mono text-caption"
                    :rules="[v => !!v || '请输入物品材质 Key']"
                    :disabled="overrideEditMode"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="formOverride.displayName"
                    :label="$t('admin.uiText.autoHtml.k0392')"
                    :placeholder="$t('admin.uiText.autoHtml.k0393')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="warning"
                    class="mb-3"
                  ></v-text-field>

                  <v-divider class="my-4"></v-divider>

                  <div class="mb-4">
                    <h4 class="text-caption font-weight-black text-slate-800 mb-2">材质图标 (png/webp/jpg/gif)</h4>
                    
                    <div class="d-flex align-center flex-wrap">
                      <v-avatar size="64" rounded="lg" color="white" class="mr-4 border">
                        <McIcon
                          :material="formOverride.materialKey"
                          :icon-url="formOverride.iconUrl"
                          :size="48"
                          color="warning"
                        />
                      </v-avatar>
                      
                      <div class="my-2">
                        <v-file-input
                          label="选择材质图片"
                          accept="image/*"
                          variant="outlined"
                          density="compact"
                          rounded="lg"
                          color="warning"
                          hide-details
                          class="mb-2"
                          style="width: 200px;"
                          @update:model-value="openCropDialog"
                        ></v-file-input>
                        <p class="text-xxs text-medium-emphasis">支持裁剪，上传后保存立即生效。</p>
                      </div>
                    </div>
                  </div>

                  <v-row dense class="mt-4">
                    <v-col cols="6">
                      <v-btn
                        type="button"
                        color="secondary"
                        variant="tonal"
                        block
                        height="40"
                        rounded="lg"
                        class="font-weight-bold text-caption"
                        @click="handleClearOverrideEditor"
                      >
                        清空
                      </v-btn>
                    </v-col>
                    <v-col cols="6">
                      <v-btn
                        type="submit"
                        color="warning"
                        variant="flat"
                        block
                        height="40"
                        rounded="lg"
                        class="font-weight-black text-caption"
                        :loading="saveOverrideLoading"
                      >
                        保存映射
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card>
            </v-col>

            <!-- Table Override List -->
            <v-col cols="12" md="8">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-warning-light fill-height">
                <div class="d-flex align-center justify-between mb-4 flex-wrap">
                  <h3 class="text-subtitle-1 font-weight-black text-slate-800">对照映射字典数据库</h3>
                  
                  <div class="d-flex align-center" style="max-width: 300px; width: 100%;">
                    <v-text-field
                      v-model="overrideSearch"
                      :label="$t('admin.uiText.autoHtml.k0388')"
                      :placeholder="$t('admin.uiText.autoHtml.k0389')"
                      prepend-inner-icon="mdi-magnify"
                      variant="outlined"
                      density="compact"
                      rounded="lg"
                      color="warning"
                      hide-details
                      class="mr-2"
                    ></v-text-field>
                    <v-btn
                      color="warning"
                      variant="tonal"
                      icon
                      size="small"
                      :loading="overridesLoading"
                      @click="handleLoadOverrides"
                    >
                      <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                  </div>
                </div>

                <v-table class="bg-transparent text-caption rounded-xl overflow-hidden border">
                  <thead>
                    <tr class="bg-table-header text-slate-800 font-weight-black">
                      <th class="font-weight-bold">图标</th>
                      <th class="font-weight-bold">材质 Key (minecraft:*)</th>
                      <th class="font-weight-bold">汉化覆盖译名</th>
                      <th class="font-weight-bold text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="overridesLoading">
                      <td colspan="4" class="text-center py-6">
                        <v-progress-circular indeterminate color="warning" size="32"></v-progress-circular>
                        <div class="text-caption mt-2 text-medium-emphasis">加载映射数据中...</div>
                      </td>
                    </tr>
                    <tr v-else-if="filteredOverrides.length === 0">
                      <td colspan="4" class="text-center py-6 text-medium-emphasis">
                        {{ $t('admin.uiText.page.emptyState') }}
                      </td>
                    </tr>
                    <tr
                      v-for="item in filteredOverrides"
                      :key="item.materialKey"
                      class="hover-bg-row"
                    >
                      <td>
                        <v-avatar size="32" rounded="lg" color="white" class="border">
                          <McIcon
                            :material="item.materialKey"
                            :icon-url="item.iconUrl"
                            :size="24"
                            color="warning"
                          />
                        </v-avatar>
                      </td>
                      <td class="font-mono font-weight-bold text-xxs">{{ item.materialKey }}</td>
                      <td class="font-weight-black text-warning">{{ item.displayName || '跟随默认翻译' }}</td>
                      <td class="text-center">
                        <v-btn
                          color="warning"
                          variant="tonal"
                          size="x-small"
                          rounded="lg"
                          class="font-weight-bold text-caption mr-2"
                          prepend-icon="mdi-pencil-outline"
                          @click="handleEditOverride(item)"
                        >
                          编辑
                        </v-btn>
                        <v-btn
                          color="error"
                          variant="tonal"
                          size="x-small"
                          rounded="lg"
                          class="font-weight-bold text-caption"
                          prepend-icon="mdi-delete-outline"
                          @click="confirmDeleteOverride(item)"
                        >
                          删除
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>
      </v-window>

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

      <!-- C2C listing taking down confirm dialog -->
      <v-dialog v-model="unlistDialog" max-width="450" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card text-center border-error-top">
          <v-avatar color="red-lighten-5" size="56" class="mx-auto mb-4">
            <v-icon color="error" size="30">mdi-hammer</v-icon>
          </v-avatar>
          <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-2">安全重锤：确认强制下架挂单？</h3>
          <p class="text-caption text-medium-emphasis mb-4 leading-relaxed">
            该动作会即时将卖家挂牌的商品下线，并安全的退回其冻结的物资资产，同时会在游戏内发送下架通知信函。请确保该挂单涉嫌虚假交易、RMT或擦边广告。
          </p>
          <div class="d-flex justify-space-between mt-2">
            <v-btn color="secondary" variant="tonal" class="rounded-lg text-caption font-weight-bold width-45" @click="unlistDialog = false">
              取消
            </v-btn>
            <v-btn color="error" variant="flat" class="rounded-lg text-caption font-weight-bold width-45 animate-pulse" :loading="unlistLoading" @click="handleForceUnlist">
              确认强下架
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Delete Override Confirm Dialog -->
      <v-dialog v-model="deleteOverrideDialog" max-width="450" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card text-center border-error-top">
          <v-avatar color="red-lighten-5" size="56" class="mx-auto mb-4">
            <v-icon color="error" size="30">mdi-delete-alert-outline</v-icon>
          </v-avatar>
          <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-2">确认删除该材质覆盖映射？</h3>
          <p class="text-caption text-medium-emphasis mb-4 leading-relaxed">
            删除映射后，系统在展示该物品 ({{ targetDeleteOverride?.materialKey }}) 时将自动退回原版汉化与默认材质占位图。
          </p>
          <div class="d-flex justify-space-between mt-2">
            <v-btn color="secondary" variant="tonal" class="rounded-lg text-caption font-weight-bold width-45" @click="deleteOverrideDialog = false">
              取消
            </v-btn>
            <v-btn color="error" variant="flat" class="rounded-lg text-caption font-weight-bold width-45" :loading="deleteOverrideLoading" @click="handleDeleteOverride">
              确认删除
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Glassmorphic Canvas Image Cropper Dialog -->
      <v-dialog v-model="cropDialog" max-width="650" persistent class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card border-warning-top">
          <div class="d-flex align-center mb-3">
            <v-avatar color="warning-lighten-5" size="36" class="mr-3">
              <v-icon color="warning">mdi-crop</v-icon>
            </v-avatar>
            <div>
              <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.page.materialCropTitle') }}</h3>
              <p class="text-caption text-medium-emphasis mt-0_5">{{ $t('admin.uiText.page.materialCropDesc') }}</p>
            </div>
          </div>

          <!-- Canvas container -->
          <div
            class="crop-workplace my-4 d-flex align-center justify-center overflow-hidden rounded-xl border position-relative bg-grey-lighten-3"
            style="height: 350px;"
            @mousedown="startPan"
            @mousemove="doPan"
            @mouseup="endPan"
            @mouseleave="endPan"
            @wheel="handleWheel"
            @touchstart="startTouch"
            @touchmove="doTouch"
            @touchend="endTouch"
          >
            <canvas ref="cropCanvasRef" width="400" height="300" class="crop-canvas"></canvas>
            
            <!-- Crop overlay circular mask -->
            <div class="crop-circular-mask"></div>
          </div>

          <v-row dense class="align-center mb-3">
            <v-col cols="12" sm="8" class="d-flex align-center">
              <v-icon color="warning" class="mr-2">mdi-magnify-plus-outline</v-icon>
              <v-slider
                v-model="cropZoom"
                :min="0.1"
                :max="4.0"
                step="0.05"
                color="warning"
                hide-details
                density="compact"
                class="flex-grow-1"
              ></v-slider>
              <span class="text-caption ml-2 font-weight-bold" style="width: 40px;">{{ Math.round(cropZoom * 100) }}%</span>
            </v-col>
            <v-col cols="12" sm="4" class="d-flex justify-end">
              <v-btn color="secondary" variant="tonal" rounded="lg" class="text-caption font-weight-bold" prepend-icon="mdi-restore" @click="resetCrop">
                {{ $t('admin.uiText.page.materialCropResetBtn') }}
              </v-btn>
            </v-col>
          </v-row>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-end">
            <v-btn
              color="secondary"
              variant="tonal"
              class="rounded-lg font-weight-bold text-caption mr-2"
              @click="cancelCrop"
            >
              {{ $t('admin.uiText.page.materialCropCancelBtn') }}
            </v-btn>
            <v-btn
              color="warning"
              variant="flat"
              class="rounded-lg font-weight-bold text-caption"
              :loading="cropUploading"
              @click="handleApplyCropAndUpload"
            >
              {{ $t('admin.uiText.page.materialCropApplyBtn') }}
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
    </v-container>
  </admin-gate>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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

// Active tab switcher
const activeTab = ref<'sales' | 'limitations' | 'overrides'>('sales')

// SnackBar Alert state
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const showSnackbar = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// -------------------------------------------------------------
// TAB 1: C2C SALES MONITORING
// -------------------------------------------------------------
const listings = ref<any[]>([])
const salesLoading = ref(false)
const salesSearch = ref('')
const salesStatusFilter = ref<'ALL' | 'ON_SALE' | 'SOLD' | 'CANCELLED'>('ALL')
const salesSellerFilter = ref('')
const salesCurrencyFilter = ref<'ALL' | 'SHOP_COIN' | 'GAME_COIN'>('ALL')

const salesStatusOptions = computed(() => [
  { title: t('admin.uiText.autoHtml.k0406'), value: 'ALL' },
  { title: t('admin.uiText.autoHtml.k0407'), value: 'ON_SALE' },
  { title: t('admin.uiText.autoHtml.k0408'), value: 'SOLD' },
  { title: t('admin.uiText.autoHtml.k0409'), value: 'CANCELLED' }
])

const salesCurrencyOptions = computed(() => [
  { title: t('admin.uiText.autoHtml.k0417') || '全部', value: 'ALL' },
  { title: `${shopCoinName.value} (${shopCoinShort.value})`, value: 'SHOP_COIN' },
  { title: `${gameCoinName.value} (${gameCoinShort.value})`, value: 'GAME_COIN' }
])

const handleLoadListings = async () => {
  salesLoading.value = true
  try {
    const res = await adminApi.getMarketListings()
    if (res && res.data) {
      listings.value = res.data.list || res.data || []
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.loadFailed', { message: msg }), 'error')
  } finally {
    salesLoading.value = false
  }
}

const filteredListings = computed(() => {
  let list = listings.value

  if (salesStatusFilter.value !== 'ALL') {
    list = list.filter(item => item.status === salesStatusFilter.value)
  }

  if (salesCurrencyFilter.value !== 'ALL') {
    list = list.filter(item => item.currency === salesCurrencyFilter.value)
  }

  if (salesSellerFilter.value) {
    const q = salesSellerFilter.value.trim().toLowerCase()
    list = list.filter(item => 
      (item.sellerName || '').toLowerCase().includes(q) || 
      (item.sellerUuid || '').toLowerCase().includes(q)
    )
  }

  if (salesSearch.value) {
    const q = salesSearch.value.trim().toLowerCase()
    list = list.filter(item => 
      String(item.id).includes(q) ||
      (item.material || '').toLowerCase().includes(q) ||
      (item.displayName || '').toLowerCase().includes(q) ||
      (item.comment || '').toLowerCase().includes(q)
    )
  }

  return list
})

const getTradeTypeName = (type: string) => {
  if (type === 'BUY') return '收购单'
  if (type === 'SELL') return '出售单'
  if (type === 'AUCTION') return '拍卖单'
  return type
}

const getTradeTypeColor = (type: string) => {
  if (type === 'BUY') return 'info'
  if (type === 'SELL') return 'success'
  if (type === 'AUCTION') return 'warning'
  return 'default'
}

const getListingStatusName = (status: string) => {
  if (status === 'ON_SALE') return '展示在售'
  if (status === 'SOLD') return '已完成'
  if (status === 'CANCELLED') return '已下架'
  return status
}

const getListingStatusColor = (status: string) => {
  if (status === 'ON_SALE') return 'success'
  if (status === 'SOLD') return 'primary'
  if (status === 'CANCELLED') return 'grey-darken-1'
  return 'default'
}

// Security unlist state
const unlistDialog = ref(false)
const targetUnlistListing = ref<any>(null)
const unlistLoading = ref(false)

const confirmUnlist = (item: any) => {
  targetUnlistListing.value = item
  unlistDialog.value = true
}

const handleForceUnlist = async () => {
  if (!targetUnlistListing.value) return
  unlistLoading.value = true
  try {
    await adminApi.forceUnlistMarketListing({ id: targetUnlistListing.value.id })
    showSnackbar(`挂单 #${targetUnlistListing.value.id} 强制下架成功！`, 'success')
    unlistDialog.value = false
    await handleLoadListings()
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`强制下架失败：${msg}`, 'error')
  } finally {
    unlistLoading.value = false
  }
}

// -------------------------------------------------------------
// TAB 2: LIMITATION & TAGS CONFIGURATION
// -------------------------------------------------------------
const limitationsConfig = ref<any>({
  defaultMaxListings: 5,
  defaultAllowSides: 'SELL,BUY',
  defaultAllowTradeTypes: 'DIRECT,AUCTION',
  defaultAllowCurrencies: '',
  defaultAllowTags: '',
  defaultCreateCostEnabled: false,
  defaultCreateCostCurrency: 'GAME_COIN',
  defaultCreateCostAmount: 0
})

const tagsConfig = ref<any>({
  tags: []
})

const currencySelectOptions = computed(() => [
  { title: `${gameCoinName.value} (${gameCoinShort.value})`, value: 'GAME_COIN' },
  { title: `${shopCoinName.value} (${shopCoinShort.value})`, value: 'SHOP_COIN' }
])

const rawTagsConfigJSON = ref('')
const rawLimitationsConfigJSON = ref('')
const saveConfigsLoading = ref(false)

const handleLoadConfigs = async () => {
  try {
    const [resTags, resLimitation] = await Promise.all([
      adminApi.getMarketTagsConfig(),
      adminApi.getMarketLimitationConfig()
    ])

    if (resTags && resTags.data) {
      const rawData = resTags.data || {}
      const configData = rawData.config || rawData
      tagsConfig.value = {
        tags: (configData.tags || []).map((t: any) => ({
          ...t,
          materialInString: Array.isArray(t.materialIn) ? t.materialIn.join(',') : ''
        }))
      }
      rawTagsConfigJSON.value = JSON.stringify(configData, null, 2)
    }

    if (resLimitation && resLimitation.data) {
      const rawData = resLimitation.data || {}
      const configData = rawData.config || rawData
      limitationsConfig.value = {
        ...configData,
        defaultAllowSides: Array.isArray(configData.defaultAllowSides) ? configData.defaultAllowSides.join(',') : configData.defaultAllowSides || 'SELL,BUY',
        defaultAllowTradeTypes: Array.isArray(configData.defaultAllowTradeTypes) ? configData.defaultAllowTradeTypes.join(',') : configData.defaultAllowTradeTypes || 'DIRECT,AUCTION',
        defaultAllowCurrencies: Array.isArray(configData.defaultAllowCurrencies) ? configData.defaultAllowCurrencies.join(',') : configData.defaultAllowCurrencies || '',
        defaultAllowTags: Array.isArray(configData.defaultAllowTags) ? configData.defaultAllowTags.join(',') : configData.defaultAllowTags || ''
      }
      rawLimitationsConfigJSON.value = JSON.stringify(configData, null, 2)
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`加载配置失败：${msg}`, 'error')
  }
}

const handleAddNewTag = () => {
  tagsConfig.value.tags.push({
    code: 'new_tag_' + Date.now().toString().slice(-4),
    displayName: '新标签',
    priority: 10,
    materialInString: ''
  })
}

const handleRemoveTag = (index: number | string) => {
  const idx = typeof index === 'string' ? parseInt(index, 10) : index
  tagsConfig.value.tags.splice(idx, 1)
}

const handleApplyJSONToVisual = () => {
  try {
    if (rawTagsConfigJSON.value.trim()) {
      const parsedTags = JSON.parse(rawTagsConfigJSON.value)
      tagsConfig.value = {
        tags: (parsedTags.tags || []).map((t: any) => ({
          ...t,
          materialInString: Array.isArray(t.materialIn) ? t.materialIn.join(',') : ''
        }))
      }
    }
    if (rawLimitationsConfigJSON.value.trim()) {
      const parsedLim = JSON.parse(rawLimitationsConfigJSON.value)
      limitationsConfig.value = {
        ...parsedLim,
        defaultAllowSides: Array.isArray(parsedLim.defaultAllowSides) ? parsedLim.defaultAllowSides.join(',') : parsedLim.defaultAllowSides || '',
        defaultAllowTradeTypes: Array.isArray(parsedLim.defaultAllowTradeTypes) ? parsedLim.defaultAllowTradeTypes.join(',') : parsedLim.defaultAllowTradeTypes || '',
        defaultAllowCurrencies: Array.isArray(parsedLim.defaultAllowCurrencies) ? parsedLim.defaultAllowCurrencies.join(',') : parsedLim.defaultAllowCurrencies || '',
        defaultAllowTags: Array.isArray(parsedLim.defaultAllowTags) ? parsedLim.defaultAllowTags.join(',') : parsedLim.defaultAllowTags || ''
      }
    }
    showSnackbar('已成功应用 JSON 配置到可视化表单结构中！', 'success')
  } catch (e: any) {
    showSnackbar(`JSON 解析格式错误：${e.message}`, 'error')
  }
}

const handleSaveConfigs = async () => {
  saveConfigsLoading.value = true
  try {
    // 1. Pack Tags
    const tagsPayload = {
      config: {
        tags: tagsConfig.value.tags.map((t: any) => {
          const { materialInString, ...rest } = t
          return {
            ...rest,
            materialIn: materialInString ? materialInString.split(',').map((x: string) => x.trim()) : []
          }
        })
      }
    }

    // 2. Pack Limitations
    const limitPayload = {
      config: {
        ...limitationsConfig.value,
        defaultAllowSides: String(limitationsConfig.value.defaultAllowSides).split(',').map(s => s.trim()).filter(Boolean),
        defaultAllowTradeTypes: String(limitationsConfig.value.defaultAllowTradeTypes).split(',').map(s => s.trim()).filter(Boolean),
        defaultAllowCurrencies: limitationsConfig.value.defaultAllowCurrencies ? String(limitationsConfig.value.defaultAllowCurrencies).split(',').map(s => s.trim()).filter(Boolean) : [],
        defaultAllowTags: limitationsConfig.value.defaultAllowTags ? String(limitationsConfig.value.defaultAllowTags).split(',').map(s => s.trim()).filter(Boolean) : []
      }
    }

    await Promise.all([
      adminApi.saveMarketTagsConfig(tagsPayload),
      adminApi.saveMarketLimitationConfig(limitPayload)
    ])

    showSnackbar('成功更新并存储交易限制与标签字典规则！', 'success')
    await handleLoadConfigs() // Reload
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`保存配置失败：${msg}`, 'error')
  } finally {
    saveConfigsLoading.value = false
  }
}

// -------------------------------------------------------------
// TAB 3: MATERIAL OVERRIDES
// -------------------------------------------------------------
const overrides = ref<any[]>([])
const overridesLoading = ref(false)
const overrideSearch = ref('')

const formOverride = ref<any>({
  materialKey: '',
  displayName: '',
  iconUrl: ''
})
const overrideEditMode = ref(false)
const overrideFormRef = ref<any>(null)
const overrideValid = ref(false)
const saveOverrideLoading = ref(false)

const handleLoadOverrides = async () => {
  overridesLoading.value = true
  try {
    const res = await adminApi.getMaterialOverridesList()
    if (res && res.data) {
      overrides.value = res.data.list || res.data || []
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`加载对照字典失败：${msg}`, 'error')
  } finally {
    overridesLoading.value = false
  }
}

const filteredOverrides = computed(() => {
  let list = overrides.value
  if (overrideSearch.value) {
    const q = overrideSearch.value.trim().toLowerCase()
    list = list.filter(item => 
      item.materialKey.toLowerCase().includes(q) ||
      (item.displayName || '').toLowerCase().includes(q)
    )
  }
  return list
})

const handleEditOverride = (item: any) => {
  formOverride.value = { ...item }
  overrideEditMode.value = true
  if (overrideFormRef.value) overrideFormRef.value.resetValidation()
}

const handleClearOverrideEditor = () => {
  formOverride.value = {
    materialKey: '',
    displayName: '',
    iconUrl: ''
  }
  overrideEditMode.value = false
  if (overrideFormRef.value) overrideFormRef.value.resetValidation()
}

const handleSaveOverride = async () => {
  if (!overrideFormRef.value) return
  const { valid } = await overrideFormRef.value.validate()
  if (!valid) return

  saveOverrideLoading.value = true
  try {
    await adminApi.upsertMaterialOverride({
      materialKey: formOverride.value.materialKey,
      displayName: formOverride.value.displayName
    })

    showSnackbar('材质对照译名已保存！', 'success')
    handleClearOverrideEditor()
    await handleLoadOverrides()
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`保存对照失败：${msg}`, 'error')
  } finally {
    saveOverrideLoading.value = false
  }
}

// Override deletion
const deleteOverrideDialog = ref(false)
const targetDeleteOverride = ref<any>(null)
const deleteOverrideLoading = ref(false)

const confirmDeleteOverride = (item: any) => {
  targetDeleteOverride.value = item
  deleteOverrideDialog.value = true
}

const handleDeleteOverride = async () => {
  if (!targetDeleteOverride.value) return
  deleteOverrideLoading.value = true
  try {
    await adminApi.deleteMaterialOverride({ materialKey: targetDeleteOverride.value.materialKey })
    showSnackbar(`已成功清除材质 ${targetDeleteOverride.value.materialKey} 覆盖设定！`, 'success')
    deleteOverrideDialog.value = false
    await handleLoadOverrides()
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`删除材质对照失败：${msg}`, 'error')
  } finally {
    deleteOverrideLoading.value = false
  }
}

// -------------------------------------------------------------
// PREMIUM CANVAS CROPPER LOGIC
// -------------------------------------------------------------
const cropDialog = ref(false)
const cropCanvasRef = ref<HTMLCanvasElement | null>(null)
const cropZoom = ref(1.0)
const cropUploading = ref(false)

// Source Image state
let sourceImage: HTMLImageElement | null = null
let imgX = 0
let imgY = 0
let isDragging = false
let startX = 0
let startY = 0

// Touch gestures
let lastTouchDist = 0

const openCropDialog = (files: File[] | File | null) => {
  if (!files) return
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return

  if (!formOverride.value.materialKey) {
    showSnackbar('请先输入材质 Key 以锁定绑定目标！', 'warning')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      sourceImage = new Image()
      sourceImage.onload = () => {
        // Reset scale and positions
        cropZoom.value = 1.0
        if (sourceImage) {
          // Center image
          imgX = 200 - (sourceImage.width * cropZoom.value) / 2
          imgY = 150 - (sourceImage.height * cropZoom.value) / 2
        }
        cropDialog.value = true
        // Render canvas on next tick
        setTimeout(drawCanvas, 100)
      }
      sourceImage.src = e.target.result as string
    }
  }
  reader.readAsDataURL(file)
}

const drawCanvas = () => {
  const canvas = cropCanvasRef.value
  if (!canvas || !sourceImage) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw image
  const w = sourceImage.width * cropZoom.value
  const h = sourceImage.height * cropZoom.value
  ctx.drawImage(sourceImage, imgX, imgY, w, h)
}

// Watch Zoom change to redraw
watch(cropZoom, () => {
  if (sourceImage) {
    drawCanvas()
  }
})

// Mouse drag handlers
const startPan = (e: MouseEvent) => {
  isDragging = true
  startX = e.clientX - imgX
  startY = e.clientY - imgY
}

const doPan = (e: MouseEvent) => {
  if (!isDragging) return
  imgX = e.clientX - startX
  imgY = e.clientY - startY
  drawCanvas()
}

const endPan = () => {
  isDragging = false
}

const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const factor = e.deltaY < 0 ? 1.05 : 0.95
  cropZoom.value = Math.max(0.1, Math.min(4.0, cropZoom.value * factor))
}

// Touch controls for mobile
const startTouch = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    isDragging = true
    startX = e.touches[0].clientX - imgX
    startY = e.touches[0].clientY - imgY
  } else if (e.touches.length === 2) {
    // Pinch to zoom start
    lastTouchDist = getTouchDist(e)
  }
}

const doTouch = (e: TouchEvent) => {
  if (e.touches.length === 1 && isDragging) {
    imgX = e.touches[0].clientX - startX
    imgY = e.touches[0].clientY - startY
    drawCanvas()
  } else if (e.touches.length === 2) {
    const dist = getTouchDist(e)
    const factor = dist / lastTouchDist
    cropZoom.value = Math.max(0.1, Math.min(4.0, cropZoom.value * factor))
    lastTouchDist = dist
  }
}

const endTouch = () => {
  isDragging = false
}

const getTouchDist = (e: TouchEvent) => {
  const dx = e.touches[0].clientX - e.touches[1].clientX
  const dy = e.touches[0].clientY - e.touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

const resetCrop = () => {
  cropZoom.value = 1.0
  if (sourceImage) {
    imgX = 200 - sourceImage.width / 2
    imgY = 150 - sourceImage.height / 2
    drawCanvas()
  }
}

const cancelCrop = () => {
  cropDialog.value = false
  sourceImage = null
  showSnackbar('已取消裁剪与上传', 'secondary')
}

const handleApplyCropAndUpload = async () => {
  if (!cropCanvasRef.value || !sourceImage) return
  cropUploading.value = true

  try {
    // Render cropped image to a 128x128 output canvas
    const outputCanvas = document.createElement('canvas')
    outputCanvas.width = 128
    outputCanvas.height = 128
    const outCtx = outputCanvas.getContext('2d')
    
    if (!outCtx) throw new Error('无法创建输出画布')

    // Circular crop geometry
    // Crop area in cropCanvas is centered: 400x300, circle center is (200, 150), radius 80 (diameter 160)
    // Output 128x128 needs to capture that specific 160x160 circular bounding square area from parent canvas.
    outCtx.drawImage(
      cropCanvasRef.value,
      200 - 80, 150 - 80, 160, 160, // source region
      0, 0, 128, 128               // dest region
    )

    // Convert output canvas to blob file
    outputCanvas.toBlob(async (blob) => {
      if (!blob) {
        showSnackbar('图片裁剪处理失败', 'error')
        cropUploading.value = false
        return
      }

      const croppedFile = new File([blob], `${formOverride.value.materialKey}.png`, { type: 'image/png' })

      try {
        const res = await adminApi.uploadMaterialOverrideIcon(
          { material: formOverride.value.materialKey, filename: croppedFile.name },
          croppedFile
        )
        if (res && res.data) {
          formOverride.value.iconUrl = res.data.iconUrl || ''
          showSnackbar('材质对照图标上传及绑定成功！', 'success')
          cropDialog.value = false
          await handleLoadOverrides() // Refresh lists
        }
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || '未知错误'
        showSnackbar(`上传图标失败：${msg}`, 'error')
      } finally {
        cropUploading.value = false
      }
    }, 'image/png')
  } catch (e: any) {
    showSnackbar(`图片裁剪错误：${e.message}`, 'error')
    cropUploading.value = false
  }
}

// -------------------------------------------------------------
// LIFECYCLE
// -------------------------------------------------------------
onMounted(async () => {
  await Promise.all([
    handleLoadListings(),
    handleLoadConfigs(),
    handleLoadOverrides()
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
  border-top: 4px solid rgb(var(--v-theme-warning)) !important;
}

.border-warning-light {
  border-left: 4px solid rgb(var(--v-theme-warning)) !important;
}

.hover-bg-row {
  transition: all 0.2s ease;
}
.hover-bg-row:hover {
  background-color: rgba(var(--v-theme-warning), 0.03) !important;
}

/* Table header styling */
.bg-table-header {
  background-color: rgba(var(--v-theme-warning), 0.04) !important;
}
.v-theme--dark .bg-table-header,
.v-theme--blackguard .bg-table-header {
  background-color: rgba(var(--v-theme-warning), 0.1) !important;
}

.border-warning-dashed {
  border: 1px dashed rgba(var(--v-theme-warning), 0.4) !important;
}

.text-slate-800 {
  color: #1e293b;
}
.v-theme--dark .text-slate-800,
.v-theme--blackguard .text-slate-800,
.v-theme--midnightSakura .text-slate-800 {
  color: #f1f5f9;
}

.font-mono {
  font-family: monospace !important;
}

.text-xxs {
  font-size: 0.65rem !important;
}

.width-45 {
  width: 45%;
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

/* Crop workspace */
.crop-circular-mask {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 160px;
  height: 160px;
  border-radius: 50%;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  border: 2px dashed rgb(var(--v-theme-warning));
  pointer-events: none;
}

.crop-workplace {
  cursor: move;
}

.border-error-top {
  border-top: 4px solid rgb(var(--v-theme-error)) !important;
}
</style>
