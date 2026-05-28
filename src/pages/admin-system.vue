<template>
  <admin-gate>
    <v-container fluid :class="mdAndUp ? 'pa-6' : 'pa-3'">
      <!-- 主展示面板 -->
      <v-card elevation="0" variant="outlined" class="rounded-xl overflow-hidden glass-card">
        <v-row class="ma-0" :class="mdAndUp ? 'flex-nowrap' : ''">
          <!-- 左侧菜单：非移动端，或者移动端未进入详情状态时显示 -->
          <v-col v-if="mdAndUp || !showDetail" cols="12" md="3" class="border-r pa-0 bg-light-soft overflow-y-auto" :style="mdAndUp ? 'max-height: 88vh;' : ''">
            <v-list v-model:selected="activeTab" mandatory color="primary" class="bg-transparent py-4">
              <v-list-item
                value="economy"
                prepend-icon="mdi-currency-usd"
                :title="$t('admin.uiText.tabLabelEconomy')"
                class="py-3 font-weight-bold"
                @click="showDetail = true"
              >
                <template #append v-if="isModuleDirty('economy')">
                  <v-badge dot color="warning" inline class="mr-2"></v-badge>
                </template>
              </v-list-item>
              <v-list-item
                value="products"
                prepend-icon="mdi-basket-outline"
                :title="$t('admin.uiText.tabLabelProducts')"
                class="py-3 font-weight-bold"
                @click="showDetail = true"
              >
                <template #append v-if="isModuleDirty('products')">
                  <v-badge dot color="warning" inline class="mr-2"></v-badge>
                </template>
              </v-list-item>
              <v-list-item
                value="permissions"
                prepend-icon="mdi-shield-account-outline"
                :title="$t('admin.uiText.tabLabelMarket')"
                class="py-3 font-weight-bold"
                @click="showDetail = true"
              >
                <template #append v-if="isModuleDirty('permissions')">
                  <v-badge dot color="warning" inline class="mr-2"></v-badge>
                </template>
              </v-list-item>
              <v-list-item
                value="frontend"
                prepend-icon="mdi-monitor-dashboard"
                :title="$t('admin.uiText.tabLabelFrontend')"
                class="py-3 font-weight-bold"
                @click="showDetail = true"
              >
                <template #append v-if="isModuleDirty('frontend')">
                  <v-badge dot color="warning" inline class="mr-2"></v-badge>
                </template>
              </v-list-item>
              <v-list-item
                value="backend"
                prepend-icon="mdi-server"
                :title="$t('admin.uiText.tabLabelBackend')"
                class="py-3 font-weight-bold"
                @click="showDetail = true"
              >
                <template #append v-if="isModuleDirty('backend')">
                  <v-badge dot color="warning" inline class="mr-2"></v-badge>
                </template>
              </v-list-item>
              <v-list-item
                value="other"
                prepend-icon="mdi-dots-horizontal-circle-outline"
                :title="$t('admin.uiText.tabLabelOther')"
                class="py-3 font-weight-bold"
                @click="showDetail = true"
              >
                <template #append v-if="isModuleDirty('other')">
                  <v-badge dot color="warning" inline class="mr-2"></v-badge>
                </template>
              </v-list-item>
            </v-list>
          </v-col>

          <!-- 右侧表单：非移动端，或者移动端已进入详情状态时显示 -->
          <v-col v-if="mdAndUp || showDetail" cols="12" md="9" :class="mdAndUp ? 'pa-6 overflow-y-auto bg-surface' : 'pa-4 bg-surface'" :style="mdAndUp ? 'max-height: 88vh;' : ''">
            <!-- 移动端详情态下的返回按钮 -->
            <div class="d-flex align-center mb-4 d-md-none">
              <v-btn icon="mdi-arrow-left" variant="text" color="primary" @click="showDetail = false" class="mr-2"></v-btn>
              <span class="text-h6 font-weight-bold text-slate-800">{{ $t(getTabTitleKey(activeTab[0])) }}</span>
            </div>

            <!-- 1. 经济设置 -->
            <div v-if="activeTab[0] === 'economy'">
              
              <!-- Vault 状态多状态警报 -->
              <v-alert
                :type="vaultStatus.connected ? 'success' : (vaultStatus.vaultPluginPresent ? 'warning' : 'error')"
                variant="tonal"
                class="mb-6 rounded-xl"
                border="start"
              >
                <template #title>
                  <span class="font-weight-bold">
                    {{ $t('admin.uiText.autoHtml.k0203') }}：{{ vaultStatus.connected ? $t('admin.uiText.vaultStatusReady') : $t('admin.uiText.vaultStatusNotReady') }}
                  </span>
                </template>
                <div class="d-flex align-center justify-space-between flex-wrap gap-4 mt-2">
                  <div class="text-caption text-medium-emphasis">
                    <span v-if="vaultStatus.connected" v-html="$t('admin.uiText.autoJs.k0237', { provider: vaultStatus.provider || 'Vault', gameCoin: economySettings.gameCoinSymbol || 'GC' })"></span>
                    <span v-else-if="vaultStatus.vaultPluginPresent" v-html="$t('admin.uiText.autoJs.k0064')"></span>
                    <span v-else v-html="$t('admin.uiText.autoJs.k0238', { gameCoin: economySettings.gameCoinSymbol || 'GC' })"></span>
                  </div>
                  <v-btn
                    size="x-small"
                    variant="outlined"
                    :color="vaultStatus.connected ? 'success' : (vaultStatus.vaultPluginPresent ? 'warning' : 'error')"
                    class="font-weight-bold rounded-lg"
                    @click="checkVaultStatus"
                    :loading="checkingVault"
                  >
                    {{ $t('admin.uiText.vaultRecheckBtn') }}
                  </v-btn>
                </div>
              </v-alert>

              <!-- 网页币名称与简称设置 -->
              <v-row class="mb-4">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="economySettings.webCoinName"
                    :label="$t('admin.uiText.autoHtml.k0193')"
                    :placeholder="$t('admin.uiText.autoHtml.k0194')"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="economySettings.webCoinSymbol"
                    :label="$t('admin.uiText.autoHtml.k0195')"
                    :placeholder="$t('admin.uiText.autoHtml.k0196')"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- 游戏币名称与简称设置 -->
              <v-row class="mb-6">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="economySettings.gameCoinName"
                    :label="$t('admin.uiText.autoHtml.k0197')"
                    :placeholder="$t('admin.uiText.autoHtml.k0198')"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="economySettings.gameCoinSymbol"
                    :label="$t('admin.uiText.autoHtml.k0199')"
                    :placeholder="$t('admin.uiText.autoHtml.k0200')"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-divider class="my-6"></v-divider>

              <!-- 兑换设置行：网页币 -> 游戏币 -->
              <v-row class="align-center mb-6">
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height d-flex align-center" variant="flat">
                    <div class="flex-grow-1">
                      <div class="text-subtitle-2 font-weight-bold mb-1" v-html="$t('admin.uiText.autoHtml.k0163')"></div>
                      <div class="text-caption text-medium-emphasis" v-html="$t('admin.uiText.autoHtml.k0160')"></div>
                    </div>
                    <settings-switch
                      v-model="economySettings.webToGameEnabled"
                      color="primary"
                    ></settings-switch>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="economySettings.webToGameRate"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0168').replace(/<[^>]*>/g, '')"
                    placeholder="100"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    :disabled="!economySettings.webToGameEnabled"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- 兑换设置行：游戏币 -> 网页币 -->
              <v-row class="align-center mb-6">
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height d-flex align-center" variant="flat">
                    <div class="flex-grow-1">
                      <div class="text-subtitle-2 font-weight-bold mb-1" v-html="$t('admin.uiText.autoHtml.k0171')"></div>
                      <div class="text-caption text-medium-emphasis" v-html="$t('admin.uiText.autoHtml.k0160')"></div>
                    </div>
                    <settings-switch
                      v-model="economySettings.gameToWebEnabled"
                      color="primary"
                    ></settings-switch>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="economySettings.gameToWebRate"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0176').replace(/<[^>]*>/g, '')"
                    placeholder="0.01"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    :disabled="!economySettings.gameToWebEnabled"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- 交易手续费 -->
              <v-row class="align-center mb-6">
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height d-flex align-center" variant="flat">
                    <div class="flex-grow-1">
                      <div class="text-subtitle-2 font-weight-bold mb-1">{{ $t('admin.uiText.autoHtml.k0183').replace(/（%）|\(%Text\)| \(%\)/g, '') }}</div>
                      <div class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0182') }}</div>
                    </div>
                    <settings-switch
                      v-model="economySettings.marketFeeEnabled"
                      color="primary"
                    ></settings-switch>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="economySettings.marketFeePercent"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0183')"
                    placeholder="5"
                    suffix="%"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    :disabled="!economySettings.marketFeeEnabled"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- 交易税率 -->
              <v-row class="align-center mb-6">
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height d-flex align-center" variant="flat">
                    <div class="flex-grow-1">
                      <div class="text-subtitle-2 font-weight-bold mb-1">{{ $t('admin.uiText.autoHtml.k0184').replace(/（%）|\(%Text\)| \(%\)/g, '') }}</div>
                      <div class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0182') }}</div>
                    </div>
                    <settings-switch
                      v-model="economySettings.marketTaxEnabled"
                      color="primary"
                    ></settings-switch>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="economySettings.marketTaxPercent"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0184')"
                    placeholder="2"
                    suffix="%"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    :disabled="!economySettings.marketTaxEnabled"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- 国库资金回收 -->
              <v-row class="align-center mb-6">
                <v-col cols="12" md="6">
                  <v-card class="pa-4 rounded-xl border bg-light-soft fill-height d-flex align-center" variant="flat">
                    <div class="flex-grow-1">
                      <div class="text-subtitle-2 font-weight-bold mb-1">{{ $t('admin.uiText.autoHtml.k0185') }}</div>
                      <div class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0188') }}</div>
                    </div>
                    <settings-switch
                      v-model="economySettings.treasuryEnabled"
                      color="primary"
                    ></settings-switch>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="economySettings.treasuryAccountId"
                    type="text"
                    :label="$t('admin.uiText.autoHtml.k0188')"
                    placeholder="10001"
                    variant="outlined"
                    density="comfortable"
                    hide-details="auto"
                    :disabled="!economySettings.treasuryEnabled"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>

            <!-- 2. 商品设置 -->
            <div v-else-if="activeTab[0] === 'products'">
              <!-- 图标与名称对照表 (Table Layout) -->
              <v-card variant="flat" border class="rounded-xl pa-5 mb-6 bg-light-soft">
                <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.autoHtml.k0385') }}</h3>
                    <p class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0386') }}</p>
                  </div>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    variant="flat"
                    size="small"
                    class="font-weight-bold rounded-lg px-4"
                    @click="addMaterialOverride"
                  >
                    {{ $t('admin.uiText.autoHtml.k0273').replace(/标签|Tag/g, '') }}
                  </v-btn>
                </div>

                <v-card elevation="0" border class="rounded-xl overflow-hidden bg-surface">
                  <v-table class="bg-transparent text-slate-800">
                    <thead>
                      <tr class="bg-table-header">
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 80px;">{{ $t('admin.uiText.autoHtml.k0132') }}</th>
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 90px;">{{ $t('admin.uiText.autoHtml.k0395') }}</th>
                        <th class="font-weight-bold text-subtitle-2" style="width: 150px;">{{ $t('admin.uiText.autoHtml.k0398') }}</th>
                        <th class="font-weight-bold text-subtitle-2">{{ $t('admin.uiText.autoHtml.k0390') }}</th>
                        <th class="font-weight-bold text-subtitle-2">{{ $t('admin.uiText.autoJs.k0240') }}</th>
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 80px;">{{ $t('admin.uiText.localeManagerUploadActionLabel') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(item, index) in productSettings.materialOverrides" :key="index" class="hover-bg-row">
                        <!-- 启用开关 -->
                        <td class="text-center">
                          <settings-switch
                            v-model="item.enabled"
                            color="primary"
                            hide-details
                            class="d-inline-flex"
                          ></settings-switch>
                        </td>
                        <!-- 图标预览 -->
                        <td class="text-center">
                          <v-avatar size="36" class="border bg-light-soft" rounded :style="!item.enabled ? 'opacity: 0.4;' : ''">
                            <v-img v-slot:default v-if="item.iconUrl" :src="resolveAssetUrl(item.iconUrl)" cover></v-img>
                            <v-icon v-else size="18" color="medium-emphasis">mdi-image-outline</v-icon>
                          </v-avatar>
                        </td>
                        <!-- 上传更换 -->
                        <td>
                          <v-file-input
                            v-model="item.iconFile"
                            :label="$t('admin.uiText.autoHtml.k0398')"
                            accept="image/*"
                            prepend-icon=""
                            prepend-inner-icon="mdi-camera"
                            variant="outlined"
                            density="compact"
                            hide-details
                            style="max-width: 130px;"
                            :disabled="!item.enabled"
                            @update:model-value="file => handleIconUpload(file, index)"
                          ></v-file-input>
                        </td>
                        <!-- 素材 ID -->
                        <td>
                          <v-text-field
                            v-model="item.id"
                            :placeholder="$t('admin.uiText.autoHtml.k0391')"
                            variant="outlined"
                            density="compact"
                            hide-details
                            class="font-mono text-caption"
                            :disabled="!item.enabled"
                          ></v-text-field>
                        </td>
                        <!-- 自定义名称 -->
                        <td>
                          <v-text-field
                            v-model="item.customName"
                            :placeholder="$t('admin.uiText.autoJs.k0240')"
                            variant="outlined"
                            density="compact"
                            hide-details
                            :disabled="!item.enabled"
                          ></v-text-field>
                        </td>
                        <!-- 删除 -->
                        <td class="text-center">
                          <v-btn
                            icon="mdi-trash-can-outline"
                            variant="text"
                            color="error"
                            size="small"
                            @click="removeMaterialOverride(index)"
                          ></v-btn>
                        </td>
                      </tr>
                      <tr v-if="productSettings.materialOverrides.length === 0">
                        <td colspan="6" class="text-center py-8 text-medium-emphasis text-caption">
                          {{ $t('admin.uiText.emptyState') }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>
              </v-card>

              <!-- 商品标签管理 (Table Layout) -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft">
                <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.autoHtml.k0267') }}</h3>
                    <p class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0270') }}</p>
                  </div>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-tag-plus-outline"
                    variant="flat"
                    size="small"
                    class="font-weight-bold rounded-lg px-4"
                    @click="addTag"
                  >
                    {{ $t('admin.uiText.autoHtml.k0273') }}
                  </v-btn>
                </div>

                <v-card elevation="0" border class="rounded-xl overflow-hidden bg-surface">
                  <v-table class="bg-transparent text-slate-800">
                    <thead>
                      <tr class="bg-table-header">
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 80px;">{{ $t('admin.uiText.autoHtml.k0132') }}</th>
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 100px;">{{ $t('admin.uiText.autoHtml.k0396') }}</th>
                        <th class="font-weight-bold text-subtitle-2" style="width: 160px;">{{ $t('admin.uiText.autoJs.k0240') }}</th>
                        <th class="font-weight-bold text-subtitle-2" style="width: 160px;">{{ $t('admin.uiText.autoHtml.k0067') }}</th>
                        <th class="font-weight-bold text-subtitle-2">{{ $t('admin.uiText.autoHtml.k0284') }}</th>
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 120px;">{{ $t('admin.uiText.localeManagerUploadActionLabel') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(tag, index) in productSettings.tags" :key="index" class="hover-bg-row">
                        <!-- 启用开关 -->
                        <td class="text-center">
                          <settings-switch
                            v-model="tag.visible"
                            color="primary"
                            hide-details
                            class="d-inline-flex"
                          ></settings-switch>
                        </td>
                        <!-- 效果预览 -->
                        <td class="text-center">
                          <v-chip
                            :color="tag.color"
                            variant="flat"
                            size="small"
                            class="font-weight-bold text-white"
                            :style="!tag.visible ? 'opacity: 0.4;' : ''"
                          >
                            {{ tag.name || 'Tag' }}
                          </v-chip>
                        </td>
                        <!-- 标签名称 -->
                        <td>
                          <v-text-field
                            v-model="tag.name"
                            placeholder="HOT"
                            variant="outlined"
                            density="compact"
                            hide-details
                            :disabled="!tag.visible"
                          ></v-text-field>
                        </td>
                        <!-- 预设色彩 -->
                        <td>
                          <v-select
                            v-model="tag.color"
                            :items="[
                              { title: 'Red (Error)', value: 'error' },
                              { title: 'Green (Success)', value: 'success' },
                              { title: 'Orange (Warning)', value: 'warning' },
                              { title: 'Blue (Primary)', value: 'primary' },
                              { title: 'Grey (Grey)', value: 'grey' }
                            ]"
                            variant="outlined"
                            density="compact"
                            hide-details
                            :disabled="!tag.visible"
                          ></v-select>
                        </td>
                        <!-- 标签描述 -->
                        <td>
                          <v-text-field
                            v-model="tag.description"
                            :placeholder="$t('admin.uiText.autoHtml.k0284')"
                            variant="outlined"
                            density="compact"
                            hide-details
                            :disabled="!tag.visible"
                          ></v-text-field>
                        </td>
                        <!-- 操作（编辑+删除） -->
                        <td class="text-center">
                          <div class="d-flex align-center justify-center gap-1">
                            <v-btn
                              icon="mdi-pencil-outline"
                              variant="text"
                              color="primary"
                              size="small"
                              @click="openTagEditDialog(index)"
                            ></v-btn>
                            <v-btn
                              icon="mdi-trash-can-outline"
                              variant="text"
                              color="error"
                              size="small"
                              @click="removeTag(index)"
                            ></v-btn>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="productSettings.tags.length === 0">
                        <td colspan="6" class="text-center py-8 text-medium-emphasis text-caption">
                          {{ $t('admin.uiText.emptyState') }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>
              </v-card>
            </div>

            <!-- 3. 权限设置 -->
            <div v-else-if="activeTab[0] === 'permissions'">
              <!-- 上架限制表格 -->
              <v-card variant="flat" border class="rounded-xl pa-5 mb-6 bg-light-soft">
                <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.autoHtml.k0283') }}</h3>
                    <p class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0284') }}</p>
                  </div>
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    variant="flat"
                    size="small"
                    class="font-weight-bold rounded-lg px-4"
                    @click="addListingLimit"
                  >
                    {{ $t('admin.uiText.autoHtml.k0273').replace(/标签|Tag/g, '') }}
                  </v-btn>
                </div>

                <v-card elevation="0" border class="rounded-xl overflow-hidden bg-surface">
                  <v-table class="bg-transparent text-slate-800">
                    <thead>
                      <tr class="bg-table-header">
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 80px;">{{ $t('admin.uiText.autoHtml.k0132') }}</th>
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 100px;">{{ $t('admin.uiText.autoHtml.k0524') }}</th>
                        <th class="font-weight-bold text-subtitle-2">{{ $t('admin.uiText.autoHtml.k0067') }}</th>
                        <th class="font-weight-bold text-subtitle-2 text-center">{{ $t('admin.uiText.autoHtml.k0302').replace(/金额|Amount/g, '') }}</th>
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 120px;">{{ $t('admin.uiText.localeManagerUploadActionLabel') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(limit, index) in permissionSettings.listingLimits" :key="index" class="hover-bg-row">
                        <!-- 状态 -->
                        <td class="text-center">
                          <settings-switch
                            v-model="limit.enabled"
                            color="primary"
                            hide-details
                            class="d-inline-flex"
                          ></settings-switch>
                        </td>
                        <!-- 优先级 -->
                        <td class="text-center font-weight-bold">
                          {{ limit.priority }}
                        </td>
                        <!-- 类型 -->
                        <td>
                          <v-chip
                            :color="limit.actionType === 'reject' ? 'error' : 'success'"
                            variant="tonal"
                            size="small"
                            class="font-weight-bold"
                            :style="!limit.enabled ? 'opacity: 0.4;' : ''"
                          >
                            {{ limit.actionType === 'reject' ? $t('admin.uiText.autoHtml.k0527') : $t('admin.uiText.autoHtml.k0526') }}
                          </v-chip>
                        </td>
                        <!-- 创建成本 -->
                        <td class="text-center">
                          <v-chip
                            :color="limit.costEnabled ? 'primary' : 'grey'"
                            variant="flat"
                            size="small"
                            class="font-weight-bold text-white"
                            :style="!limit.enabled ? 'opacity: 0.4;' : ''"
                          >
                            {{ limit.costEnabled ? $t('admin.uiText.autoHtml.k0326') : $t('admin.uiText.autoHtml.k0327') }}
                          </v-chip>
                        </td>
                        <!-- 操作 -->
                        <td class="text-center">
                          <div class="d-flex align-center justify-center gap-1">
                            <v-btn
                              icon="mdi-pencil-outline"
                              variant="text"
                              color="primary"
                              size="small"
                              @click="openLimitEditDialog(index)"
                            ></v-btn>
                            <v-btn
                              icon="mdi-trash-can-outline"
                              variant="text"
                              color="error"
                              size="small"
                              @click="removeListingLimit(index)"
                            ></v-btn>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="permissionSettings.listingLimits.length === 0">
                        <td colspan="5" class="text-center py-8 text-medium-emphasis text-caption">
                          {{ $t('admin.uiText.emptyState') }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>
              </v-card>

              <!-- 商品自定义权限 -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft mb-6">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-1">{{ $t('admin.uiText.autoHtml.k0351') }}</h3>
                <p class="text-caption text-medium-emphasis mb-4">{{ $t('admin.uiText.autoHtml.k0352') }}</p>

                <v-row>
                  <!-- 全局定制策略 -->
                  <v-col cols="12" md="4">
                    <v-card variant="outlined" class="rounded-xl pa-4 bg-surface fill-height d-flex flex-column justify-space-between">
                      <div>
                        <div class="text-subtitle-2 font-weight-bold mb-3 text-primary d-flex align-center">
                          <v-icon class="mr-1" size="18">mdi-earth</v-icon>{{ $t('admin.uiText.autoHtml.k0351') }}
                        </div>

                        <!-- 图标自定义及策略 -->
                        <div class="mb-4">
                          <div class="d-flex align-center justify-space-between mb-2">
                            <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0353') }}</span>
                            <settings-switch v-model="permissionSettings.customPermissions.globalCustomIconEnabled" hide-details></settings-switch>
                          </div>
                          <v-select
                            v-model="permissionSettings.customPermissions.iconPolicy"
                            :items="[
                              { title: $t('admin.uiText.autoHtml.k0357'), value: 'SOFT' },
                              { title: $t('admin.uiText.autoHtml.k0358'), value: 'HARD' }
                            ]"
                            :label="$t('admin.uiText.autoHtml.k0356')"
                            variant="outlined"
                            density="compact"
                            hide-details
                            :disabled="!permissionSettings.customPermissions.globalCustomIconEnabled"
                          ></v-select>
                        </div>

                        <!-- 名称自定义及策略 -->
                        <div>
                          <div class="d-flex align-center justify-space-between mb-2">
                            <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0359') }}</span>
                            <settings-switch v-model="permissionSettings.customPermissions.globalCustomNameEnabled" hide-details></settings-switch>
                          </div>
                          <v-select
                            v-model="permissionSettings.customPermissions.namePolicy"
                            :items="[
                              { title: $t('admin.uiText.autoHtml.k0363'), value: 'SOFT' },
                              { title: $t('admin.uiText.autoHtml.k0364'), value: 'HARD' }
                            ]"
                            :label="$t('admin.uiText.autoHtml.k0362')"
                            variant="outlined"
                            density="compact"
                            hide-details
                            :disabled="!permissionSettings.customPermissions.globalCustomNameEnabled"
                          ></v-select>
                        </div>
                      </div>
                    </v-card>
                  </v-col>

                  <!-- 官方商品权限 -->
                  <v-col cols="12" md="4">
                    <v-card variant="outlined" class="rounded-xl pa-4 bg-surface fill-height d-flex flex-column justify-space-between">
                      <div>
                        <div class="text-subtitle-2 font-weight-bold mb-3 text-secondary d-flex align-center">
                          <v-icon class="mr-1" size="18">mdi-shield-crown-outline</v-icon>{{ $t('admin.uiText.autoHtml.k0016') }}
                        </div>

                        <div class="d-flex align-center justify-space-between mb-3 py-2 border-b-dashed">
                          <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0443') }}</span>
                          <settings-switch v-model="permissionSettings.customPermissions.officialAllowCustomIcon" hide-details></settings-switch>
                        </div>

                        <div class="d-flex align-center justify-space-between mb-3 py-2 border-b-dashed">
                          <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0447') }}</span>
                          <settings-switch v-model="permissionSettings.customPermissions.officialAllowCustomName" hide-details></settings-switch>
                        </div>

                        <div class="d-flex align-center justify-space-between py-2">
                          <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0451') }}</span>
                          <settings-switch v-model="permissionSettings.customPermissions.officialAllowUploadImage" hide-details></settings-switch>
                        </div>
                      </div>
                    </v-card>
                  </v-col>

                  <!-- 玩家市场权限 -->
                  <v-col cols="12" md="4">
                    <v-card variant="outlined" class="rounded-xl pa-4 bg-surface fill-height d-flex flex-column justify-space-between">
                      <div>
                        <div class="text-subtitle-2 font-weight-bold mb-3 text-accent d-flex align-center">
                          <v-icon class="mr-1" size="18">mdi-account-group-outline</v-icon>{{ $t('admin.uiText.autoHtml.k0155') }}
                        </div>

                        <div class="d-flex align-center justify-space-between mb-3 py-2 border-b-dashed">
                          <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0443') }}</span>
                          <settings-switch v-model="permissionSettings.customPermissions.playerAllowCustomIcon" hide-details></settings-switch>
                        </div>

                        <div class="d-flex align-center justify-space-between mb-3 py-2 border-b-dashed">
                          <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0447') }}</span>
                          <settings-switch v-model="permissionSettings.customPermissions.playerAllowCustomName" hide-details></settings-switch>
                        </div>

                        <div class="d-flex align-center justify-space-between py-2">
                          <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0451') }}</span>
                          <settings-switch v-model="permissionSettings.customPermissions.playerAllowUploadImage" hide-details></settings-switch>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>

              <!-- 市场运行参数 -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-1">{{ $t('admin.uiText.autoHtml.k0248') }}</h3>
                <p class="text-caption text-medium-emphasis mb-4">{{ $t('admin.uiText.autoHtml.k0249') }}</p>

                <v-row>
                  <!-- 默认最大上架数 -->
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="permissionSettings.marketParams.defaultMaxListings"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0250')"
                      placeholder="10"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>
                  
                  <!-- 自动补货阈值 -->
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="permissionSettings.marketParams.autoRestockThreshold"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0251')"
                      placeholder="8"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 默认单次提取量 -->
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="permissionSettings.marketParams.defaultSingleExtraction"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0252')"
                      placeholder="64"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 最大单次提取量 -->
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="permissionSettings.marketParams.maxSingleExtraction"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0253')"
                      placeholder="256"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 默认中转库存 -->
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="permissionSettings.marketParams.defaultTransitStock"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0254')"
                      placeholder="256"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 最大中转库存 -->
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="permissionSettings.marketParams.maxTransitStock"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0255')"
                      placeholder="1024"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 4. 前端设置 -->
            <div v-else-if="activeTab[0] === 'frontend'">

              <!-- 语言管理 -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft mb-6">
                <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.localeSectionTitle') }}</h3>
                    <p class="text-caption text-medium-emphasis" v-html="$t('admin.uiText.localeSectionDescHtml')"></p>
                  </div>
                  <div class="d-flex align-center gap-2">
                    <v-btn
                      color="secondary"
                      prepend-icon="mdi-cloud-upload-outline"
                      variant="flat"
                      size="small"
                      class="font-weight-bold rounded-lg px-4"
                      @click="uploadDialog = true"
                    >
                      {{ $t('admin.uiText.localeManagerUploadBtn') }}
                    </v-btn>
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-web"
                      variant="flat"
                      size="small"
                      class="font-weight-bold rounded-lg px-4"
                      @click="openOnlineFetchDialog"
                    >
                      {{ $t('admin.uiText.localeManagerManifestBtn') }}
                    </v-btn>
                  </div>
                </div>

                <v-card elevation="0" border class="rounded-xl overflow-hidden bg-surface">
                  <v-table class="bg-transparent text-slate-800">
                    <thead>
                      <tr class="bg-table-header">
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 120px;">{{ $t('admin.uiText.localeTagWebOn') }}</th>
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 120px;">{{ $t('admin.uiText.localeTagGameOn') }}</th>
                        <th class="font-weight-bold text-subtitle-2">{{ $t('admin.uiText.autoJs.k0240') }}</th>
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 120px;">{{ $t('admin.uiText.localeManagerUploadActionLabel') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(lang, index) in languageList" :key="index" class="hover-bg-row">
                        <!-- 启用 Web 开关 -->
                        <td class="text-center">
                          <settings-switch
                            v-model="lang.webEnabled"
                            color="primary"
                            hide-details
                            class="d-inline-flex"
                          ></settings-switch>
                        </td>
                        <!-- 启用游戏内开关 -->
                        <td class="text-center">
                          <settings-switch
                            v-model="lang.gameEnabled"
                            color="primary"
                            hide-details
                            class="d-inline-flex"
                          ></settings-switch>
                        </td>
                        <!-- 语言名称 -->
                        <td>
                          <div class="font-weight-bold text-slate-800">{{ lang.name }}</div>
                          <div class="text-caption text-medium-emphasis font-mono">{{ lang.code }}</div>
                        </td>
                        <!-- 操作 -->
                        <td class="text-center">
                          <div class="d-flex align-center justify-center gap-1">
                            <v-btn
                              icon="mdi-pencil-outline"
                              variant="text"
                              color="primary"
                              size="small"
                              @click="openLangEditDialog(index)"
                            ></v-btn>
                            <v-btn
                              icon="mdi-trash-can-outline"
                              variant="text"
                              color="error"
                              size="small"
                              @click="removeLanguage(index)"
                            ></v-btn>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="languageList.length === 0">
                        <td colspan="4" class="text-center py-8 text-medium-emphasis text-caption">
                          {{ $t('admin.uiText.localeEmptyInstalled') }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>
              </v-card>

              <!-- 主题管理 -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft mb-6">
                <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.themeSectionTitle') }}</h3>
                    <p class="text-caption text-medium-emphasis" v-html="$t('admin.uiText.themeSectionDescHtml')"></p>
                  </div>
                  <div class="d-flex align-center gap-2">
                    <v-btn
                      color="secondary"
                      prepend-icon="mdi-cloud-upload-outline"
                      variant="flat"
                      size="small"
                      class="font-weight-bold rounded-lg px-4"
                      @click="uploadThemeDialog = true"
                    >
                      {{ $t('admin.uiText.themeManagerUploadBtn') }}
                    </v-btn>
                    <v-btn
                      color="primary"
                      prepend-icon="mdi-web"
                      variant="flat"
                      size="small"
                      class="font-weight-bold rounded-lg px-4"
                      @click="openOnlineFetchThemeDialog"
                    >
                      {{ $t('admin.uiText.themeManagerManifestBtn') }}
                    </v-btn>
                  </div>
                </div>

                <v-card elevation="0" border class="rounded-xl overflow-hidden bg-surface">
                  <v-table class="bg-transparent text-slate-800">
                    <thead>
                      <tr class="bg-table-header">
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 120px;">{{ $t('admin.uiText.themeTagWebOn') }}</th>
                        <th class="font-weight-bold text-subtitle-2">{{ $t('admin.uiText.autoJs.k0240') }}</th>
                        <th class="font-weight-bold text-subtitle-2 text-center" style="width: 120px;">{{ $t('admin.uiText.themeManagerUploadActionLabel') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(theme, index) in themeList" :key="index" class="hover-bg-row">
                        <!-- 启用 Web 开关 -->
                        <td class="text-center">
                          <settings-switch
                            v-model="theme.webEnabled"
                            color="primary"
                            hide-details
                            class="d-inline-flex"
                          ></settings-switch>
                        </td>
                        <!-- 主题名称 -->
                        <td>
                          <div class="font-weight-bold text-slate-800">{{ theme.name }}</div>
                          <div class="text-caption text-medium-emphasis font-mono">{{ theme.code }}</div>
                        </td>
                        <!-- 操作 -->
                        <td class="text-center">
                          <div class="d-flex align-center justify-center gap-1">
                            <v-btn
                              icon="mdi-pencil-outline"
                              variant="text"
                              color="primary"
                              size="small"
                              @click="openThemeEditDialog(index)"
                            ></v-btn>
                            <v-btn
                              icon="mdi-trash-can-outline"
                              variant="text"
                              color="error"
                              size="small"
                              @click="removeTheme(index)"
                            ></v-btn>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="themeList.length === 0">
                        <td colspan="3" class="text-center py-8 text-medium-emphasis text-caption">
                          {{ $t('admin.uiText.themeEmptyInstalled') }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card>
              </v-card>

              <!-- 排行榜设置 -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft mb-6">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-1">{{ $t('admin.uiText.autoHtml.k0214') }}</h3>
                <p class="text-caption text-medium-emphasis mb-4">{{ $t('admin.uiText.autoHtml.k0215') }}</p>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="rounded-xl pa-4 bg-surface fill-height d-flex flex-column justify-space-between">
                      <div class="d-flex align-center justify-space-between mb-3 py-2 border-b-dashed">
                        <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0216') }}</span>
                        <settings-switch v-model="frontendSettings.leaderboard.enabled" hide-details></settings-switch>
                      </div>
                      <div class="d-flex align-center justify-space-between py-2">
                        <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0219') }}</span>
                        <settings-switch v-model="frontendSettings.leaderboard.showOnlineStatus" hide-details :disabled="!frontendSettings.leaderboard.enabled"></settings-switch>
                      </div>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="rounded-xl pa-4 bg-surface fill-height">
                      <v-row dense>
                        <v-col cols="12">
                          <v-select
                            v-model="frontendSettings.leaderboard.defaultDimension"
                            :items="[
                              { title: $t('admin.uiText.autoHtml.k0004'), value: 'gold' },
                              { title: $t('admin.uiText.autoHtml.k0223'), value: 'points' },
                              { title: $t('admin.uiText.autoHtml.k0455'), value: 'listings' },
                              { title: $t('admin.uiText.autoHtml.k0192'), value: 'turnover' }
                            ]"
                            :label="$t('admin.uiText.autoHtml.k0222')"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                            :disabled="!frontendSettings.leaderboard.enabled"
                          ></v-select>
                        </v-col>
                        <v-col cols="12" class="mt-3">
                          <v-select
                            v-model="frontendSettings.leaderboard.defaultSortDirection"
                            :items="[
                              { title: $t('admin.uiText.autoHtml.k0225'), value: 'desc' },
                              { title: $t('admin.uiText.autoHtml.k0226'), value: 'asc' }
                            ]"
                            :label="$t('admin.uiText.autoHtml.k0224')"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                            :disabled="!frontendSettings.leaderboard.enabled"
                          ></v-select>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>

              <!-- 站点运行参数 -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft mb-6">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-1">{{ $t('admin.uiText.autoHtml.k0229') }}</h3>
                <p class="text-caption text-medium-emphasis mb-4">{{ $t('admin.uiText.autoHtml.k0230') }}</p>

                <v-row>
                  <!-- 左侧：基础与安全性参数 -->
                  <v-col cols="12" md="8">
                    <v-card variant="outlined" class="rounded-xl pa-4 bg-surface fill-height">
                      <v-row dense>
                        <v-col cols="12" sm="6">
                          <v-select
                            v-model="frontendSettings.siteParams.defaultLanguage"
                            :items="[
                              { title: '简体中文 (zh-CN)', value: 'zh-CN' },
                              { title: 'English (en-US)', value: 'en-US' },
                              { title: '繁體中文 (zh-TW)', value: 'zh-TW' }
                            ]"
                            :label="$t('admin.uiText.autoHtml.k0231')"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          ></v-select>
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-select
                            v-model="frontendSettings.siteParams.timezone"
                            :items="[
                              { title: 'Beijing Time (Asia/Shanghai)', value: 'Asia/Shanghai' },
                              { title: 'Tokyo Time (Asia/Tokyo)', value: 'Asia/Tokyo' },
                              { title: 'UTC', value: 'UTC' },
                              { title: 'New York Time (America/New_York)', value: 'America/New_York' }
                            ]"
                            :label="$t('admin.uiText.autoHtml.k0232')"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          ></v-select>
                        </v-col>

                        <v-col cols="12" sm="6" class="mt-3">
                          <v-text-field
                            v-model.number="frontendSettings.siteParams.sessionExpiryHours"
                            type="number"
                            :label="$t('admin.uiText.autoHtml.k0234')"
                            placeholder="72"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" class="mt-3">
                          <v-text-field
                            v-model.number="frontendSettings.siteParams.bindingRequestExpiryMinutes"
                            type="number"
                            :label="$t('admin.uiText.autoHtml.k0235')"
                            placeholder="15"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" sm="6" class="mt-3">
                          <v-text-field
                            v-model.number="frontendSettings.siteParams.accessTokenLength"
                            type="number"
                            :label="$t('admin.uiText.autoHtml.k0236')"
                            placeholder="48"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" class="mt-3">
                          <v-text-field
                            v-model.number="frontendSettings.siteParams.deliveryBatchSize"
                            type="number"
                            :label="$t('admin.uiText.autoHtml.k0237')"
                            placeholder="20"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" sm="6" class="mt-3">
                          <v-text-field
                            v-model.number="frontendSettings.siteParams.deliveryRetryIntervalSeconds"
                            type="number"
                            :label="$t('admin.uiText.autoHtml.k0238')"
                            placeholder="30"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" class="mt-3">
                          <v-text-field
                            v-model.number="frontendSettings.siteParams.orderCooldownSeconds"
                            type="number"
                            :label="$t('admin.uiText.autoHtml.k0239')"
                            placeholder="15"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>

                  <!-- 右侧：开关选项 -->
                  <v-col cols="12" md="4">
                    <v-card variant="outlined" class="rounded-xl pa-4 bg-surface fill-height d-flex flex-column justify-center gap-y-4">
                      <div class="d-flex align-center justify-space-between py-2 border-b-dashed">
                        <div>
                          <span class="text-caption font-weight-bold text-slate-800 d-block">{{ $t('admin.uiText.autoHtml.k0240') }}</span>
                          <span class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0240') }}</span>
                        </div>
                        <settings-switch v-model="frontendSettings.siteParams.allowSubstituteCommand" hide-details></settings-switch>
                      </div>

                      <div class="d-flex align-center justify-space-between py-2">
                        <div>
                          <span class="text-caption font-weight-bold text-slate-800 d-block">{{ $t('admin.uiText.autoHtml.k0243') }}</span>
                          <span class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0243') }}</span>
                        </div>
                        <settings-switch v-model="frontendSettings.siteParams.allowRefundUnshipped" hide-details></settings-switch>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>

              <!-- 广播模板 -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-1">{{ $t('admin.uiText.autoHtml.k0323') }}</h3>
                <p class="text-caption text-medium-emphasis mb-4">{{ $t('admin.uiText.autoHtml.k0324') }}</p>

                <v-row>
                  <v-col cols="12">
                    <v-card variant="outlined" class="rounded-xl pa-4 bg-surface">
                      <div class="d-flex align-center justify-space-between mb-4 pb-2 border-b-dashed">
                        <div>
                          <span class="text-subtitle-2 font-weight-bold text-slate-800 d-block">{{ $t('admin.uiText.autoHtml.k0325') }}</span>
                          <span class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0325') }}</span>
                        </div>
                        <settings-switch v-model="frontendSettings.broadcast.enabled" hide-details></settings-switch>
                      </div>

                      <v-row dense class="gap-y-3">
                        <v-col cols="12">
                          <v-textarea
                            v-model="frontendSettings.broadcast.listTemplate"
                            :label="$t('admin.uiText.autoHtml.k0328')"
                            placeholder="&amp;6[市场] &amp;e{seller}&amp;r 上架了 &amp;b{item}&amp;r x{quantity}，单价 {priceText}"
                            variant="outlined"
                            rows="2"
                            density="comfortable"
                            hide-details="auto"
                            :disabled="!frontendSettings.broadcast.enabled"
                          ></v-textarea>
                        </v-col>

                        <v-col cols="12" class="mt-2">
                          <v-textarea
                            v-model="frontendSettings.broadcast.dealTemplate"
                            :label="$t('admin.uiText.autoHtml.k0329')"
                            placeholder="&amp;6[市场] &amp;e{buyer}&amp;r 购买了 &amp;b{item}&amp;r x{quantity}，成交总价 {totalText}"
                            variant="outlined"
                            rows="2"
                            density="comfortable"
                            hide-details="auto"
                            :disabled="!frontendSettings.broadcast.enabled"
                          ></v-textarea>
                        </v-col>

                        <v-col cols="12" class="mt-2">
                          <v-textarea
                            v-model="frontendSettings.broadcast.bidTemplate"
                            :label="$t('admin.uiText.autoHtml.k0330')"
                            placeholder="&amp;6[拍卖] &amp;e{bidder}&amp;r 对拍卖 #{listingId} 出价 {bidAmountText}"
                            variant="outlined"
                            rows="2"
                            density="comfortable"
                            hide-details="auto"
                            :disabled="!frontendSettings.broadcast.enabled"
                          ></v-textarea>
                        </v-col>

                        <v-col cols="12" class="mt-2">
                          <v-textarea
                            v-model="frontendSettings.broadcast.sealedBidTemplate"
                            :label="$t('admin.uiText.autoHtml.k0331')"
                            placeholder="&amp;6[拍卖] &amp;e 拍卖 #{listingId} 收到新的密封出价"
                            variant="outlined"
                            rows="2"
                            density="comfortable"
                            hide-details="auto"
                            :disabled="!frontendSettings.broadcast.enabled"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 5. 后端设置 -->
            <div v-else-if="activeTab[0] === 'backend'">
              <!-- 部署模式 -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft mb-6">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-1">{{ $t('admin.uiText.autoHtml.k0207') }}</h3>
                <p class="text-caption text-medium-emphasis mb-4">{{ $t('admin.uiText.autoHtml.k0208') }}</p>

                <v-row>
                  <!-- 数据库类型 -->
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field
                      v-model="backendSettings.deploymentMode.dbType"
                      :label="$t('admin.uiText.autoHtml.k0209')"
                      readonly
                      append-inner-icon="mdi-lock-outline"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 集群角色 -->
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field
                      v-model="backendSettings.deploymentMode.clusterRole"
                      :label="$t('admin.uiText.autoHtml.k0210')"
                      readonly
                      append-inner-icon="mdi-lock-outline"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- Redis 集群总线 -->
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field
                      v-model="backendSettings.deploymentMode.redisBus"
                      :label="$t('admin.uiText.autoHtml.k0211')"
                      readonly
                      append-inner-icon="mdi-lock-outline"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 跨服配置同步 -->
                  <v-col cols="12" sm="6" md="3">
                    <v-text-field
                      v-model="backendSettings.deploymentMode.crossServerSync"
                      :label="$t('admin.uiText.autoHtml.k0212')"
                      readonly
                      append-inner-icon="mdi-lock-outline"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 6. 其它设置 -->
            <div v-else-if="activeTab[0] === 'other'">
              <!-- 维护任务 -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft mb-6">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-1">{{ $t('admin.uiText.autoHtml.k0258') }}</h3>
                <p class="text-caption text-medium-emphasis mb-4">{{ $t('admin.uiText.autoHtml.k0259') }}</p>

                <v-row dense class="gap-y-2">
                  <!-- 清理间隔（分钟） -->
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="otherSettings.maintenance.cleanupIntervalMinutes"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0260')"
                      placeholder="30"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 待绑定保留（小时） -->
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="otherSettings.maintenance.pendingBindExpiryHours"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0261')"
                      placeholder="6"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 待密码设置保留（小时） -->
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model.number="otherSettings.maintenance.pendingPasswordExpiryHours"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0262')"
                      placeholder="6"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 绑定请求保留（小时） -->
                  <v-col cols="12" sm="6" md="4" class="mt-md-2">
                    <v-text-field
                      v-model.number="otherSettings.maintenance.bindRequestExpiryHours"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0263')"
                      placeholder="24"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <!-- 兑换码保留（天） -->
                  <v-col cols="12" sm="6" md="4" class="mt-md-2">
                    <v-text-field
                      v-model.number="otherSettings.maintenance.redeemCodeExpiryDays"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0264')"
                      placeholder="7"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-card>

              <!-- 日志设置 -->
              <v-card variant="flat" border class="rounded-xl pa-5 bg-light-soft">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-1">{{ $t('admin.uiText.autoHtml.k0310') }}</h3>
                <p class="text-caption text-medium-emphasis mb-4">{{ $t('admin.uiText.autoHtml.k0311') }}</p>

                <v-row>
                  <!-- 启用文件日志与日志级别 -->
                  <v-col cols="12" md="4">
                    <v-card variant="outlined" class="rounded-xl pa-4 bg-surface fill-height d-flex flex-column justify-space-between">
                      <div class="d-flex align-center justify-space-between mb-4 py-2 border-b-dashed">
                        <div>
                          <span class="text-caption font-weight-bold text-slate-800 d-block">{{ $t('admin.uiText.autoHtml.k0312') }}</span>
                          <span class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0312') }}</span>
                        </div>
                        <settings-switch v-model="otherSettings.logging.fileLogEnabled" hide-details></settings-switch>
                      </div>

                      <div>
                        <v-select
                          v-model="otherSettings.logging.logLevel"
                          :items="['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']"
                          :label="$t('admin.uiText.autoHtml.k0315')"
                          variant="outlined"
                          density="comfortable"
                          hide-details="auto"
                          :disabled="!otherSettings.logging.fileLogEnabled"
                        ></v-select>
                      </div>
                    </v-card>
                  </v-col>

                  <!-- 日志文件存储参数 -->
                  <v-col cols="12" md="8">
                    <v-card variant="outlined" class="rounded-xl pa-4 bg-surface">
                      <v-row dense>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="otherSettings.logging.logDirectory"
                            :label="$t('admin.uiText.autoHtml.k0316')"
                            placeholder="logs"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                            :disabled="!otherSettings.logging.fileLogEnabled"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model.number="otherSettings.logging.maxFileSizeMB"
                            type="number"
                            :label="$t('admin.uiText.autoHtml.k0318')"
                            placeholder="8"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                            :disabled="!otherSettings.logging.fileLogEnabled"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" sm="6" class="mt-3">
                          <v-text-field
                            v-model.number="otherSettings.logging.maxBackupFiles"
                            type="number"
                            :label="$t('admin.uiText.autoHtml.k0319')"
                            placeholder="8"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                            :disabled="!otherSettings.logging.fileLogEnabled"
                          ></v-text-field>
                        </v-col>

                        <v-col cols="12" sm="6" class="mt-3">
                          <v-text-field
                            v-model.number="otherSettings.logging.retentionDays"
                            type="number"
                            :label="$t('admin.uiText.autoHtml.k0320')"
                            placeholder="14"
                            variant="outlined"
                            density="comfortable"
                            hide-details="auto"
                            :disabled="!otherSettings.logging.fileLogEnabled"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- 其它设置分类空白版 -->
            <div v-else>
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-8 text-center border-dashed mt-4">
                <v-icon size="48" color="medium-emphasis" class="mb-2">mdi-cog-outline</v-icon>
                <div class="text-subtitle-1 font-weight-bold text-slate-800">{{ $t(getTabTitleKey(activeTab[0])) }} - {{ $t('admin.uiText.emptyState') }}</div>
                <div class="text-caption text-medium-emphasis mt-1">{{ $t('admin.uiText.emptyState') }}</div>
              </v-card>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- 悬浮保存警告横幅 (Sticky Glassmorphic Alert Banner) -->
      <v-slide-y-reverse-transition>
        <div v-if="hasUnsavedChanges" class="unsaved-banner-container">
          <v-card class="unsaved-banner d-flex align-center justify-space-between px-6 py-3 rounded-xl elevation-6 border">
            <div class="d-flex align-center gap-3">
              <v-icon color="warning" size="24" class="pulse-icon">mdi-alert-circle-outline</v-icon>
              <div>
                <div class="text-subtitle-2 font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0383') }}</div>
                <div class="text-caption text-medium-emphasis">发现未保存的修改，请即时保存以防丢失。</div>
              </div>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                variant="outlined"
                color="secondary"
                rounded="lg"
                class="text-caption font-weight-bold px-4"
                :disabled="saving"
                @click="discardAllChanges"
              >
                {{ $t('admin.uiText.manifestSourceCancelBtn') }}
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                rounded="lg"
                class="text-caption font-weight-bold px-6"
                :loading="saving"
                @click="saveAllSettings"
              >
                {{ $t('admin.uiText.autoHtml.k0554') }}
              </v-btn>
            </div>
          </v-card>
        </div>
      </v-slide-y-reverse-transition>

      <!-- 悬浮保存按钮 (FAB) - 当没有未保存修改时展示 -->
      <v-slide-y-reverse-transition>
        <div v-if="(mdAndUp || showDetail) && !hasUnsavedChanges" class="fab-container">
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save"
            size="large"
            :class="['hover-scale', 'border', 'rounded-pill', 'font-weight-bold', 'px-6']"
            variant="elevated"
            elevation="4"
            :loading="saving"
            @click="saveAllSettings"
          >
            {{ $t('admin.uiText.autoHtml.k0383') }}
          </v-btn>
        </div>
      </v-slide-y-reverse-transition>

      <!-- 保存成功通知气泡 -->
      <v-snackbar v-model="snackbar" color="success" location="bottom right" :timeout="3000" class="rounded-lg">
        <div class="d-flex align-center">
          <v-icon start class="mr-2">mdi-check-circle</v-icon>
          <span class="font-weight-bold">{{ $t('admin.uiText.autoJs.k0010') }}</span>
        </div>
      </v-snackbar>

      <!-- 标签高级编辑对话框 -->
      <v-dialog v-model="tagEditDialog" max-width="550" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-surface border">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-black text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-tag-outline</v-icon>{{ $t('admin.uiText.autoHtml.k0503') }}: {{ editingTag.name }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="tagEditDialog = false"></v-btn>
          </div>

          <v-form class="d-flex flex-column gap-4">
            <!-- 优先级 -->
            <v-text-field
              v-model.number="editingTag.priority"
              type="number"
              :label="$t('admin.uiText.autoHtml.k0512')"
              placeholder="1"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            ></v-text-field>

            <!-- 材质白名单 -->
            <v-textarea
              v-model="editingTag.materialWhitelist"
              :label="$t('admin.uiText.autoHtml.k0513')"
              :placeholder="$t('admin.uiText.autoHtml.k0514')"
              variant="outlined"
              rows="3"
              class="mt-2"
            ></v-textarea>

            <!-- NBT关键词 -->
            <v-textarea
              v-model="editingTag.nbtKeywords"
              :label="$t('admin.uiText.autoHtml.k0515')"
              :placeholder="$t('admin.uiText.autoHtml.k0516')"
              variant="outlined"
              rows="3"
              class="mt-2"
            ></v-textarea>
          </v-form>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-end gap-2">
            <v-btn variant="text" color="secondary" rounded="lg" class="text-caption font-weight-bold" @click="tagEditDialog = false">{{ $t('admin.uiText.autoHtml.k0553') }}</v-btn>
            <v-btn color="primary" variant="flat" rounded="lg" class="text-caption font-weight-bold px-6" @click="saveTagDetails">{{ $t('admin.uiText.autoHtml.k0554') }}</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- 上架限制规则编辑对话框 -->
      <v-dialog v-model="limitEditDialog" max-width="850" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-surface border">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-black text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-shield-check-outline</v-icon>
              {{ editingLimitIndex === -1 ? $t('admin.uiText.autoHtml.k0303') : $t('admin.uiText.autoHtml.k0519') + ': ' + editingLimit.id }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="limitEditDialog = false"></v-btn>
          </div>

          <v-form>
            <v-row>
              <!-- 左侧列 -->
              <v-col cols="12" md="6" class="border-r-md">
                <div class="text-subtitle-2 font-weight-bold mb-3 text-primary">{{ $t('admin.uiText.autoHtml.k0057') }}</div>
                
                <v-row dense class="gap-y-2">
                  <v-col cols="12">
                    <v-text-field
                      v-model="editingLimit.id"
                      :label="$t('admin.uiText.autoHtml.k0522')"
                      :placeholder="$t('admin.uiText.autoHtml.k0523')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                      :disabled="editingLimitIndex !== -1"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6" class="mt-2">
                    <v-text-field
                      v-model.number="editingLimit.priority"
                      type="number"
                      :label="$t('admin.uiText.autoHtml.k0524')"
                      placeholder="1"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="6" class="mt-2">
                    <v-select
                      v-model="editingLimit.actionType"
                      :items="[
                        { title: $t('admin.uiText.autoHtml.k0527'), value: 'reject' },
                        { title: $t('admin.uiText.autoHtml.k0526'), value: 'whitelist' }
                      ]"
                      :label="$t('admin.uiText.autoHtml.k0525')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-text-field
                      v-model="editingLimit.rejectErrorCode"
                      :label="$t('admin.uiText.autoHtml.k0528')"
                      :placeholder="$t('admin.uiText.autoHtml.k0529')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-select
                      v-model="editingLimit.triggerDirection"
                      :items="[
                        { title: `${$t('admin.uiText.autoHtml.k0280')} (LIST)`, value: 'LIST' },
                        { title: 'BUY', value: 'BUY' },
                        { title: 'SELL', value: 'SELL' }
                      ]"
                      :label="$t('admin.uiText.autoHtml.k0530')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-textarea
                      v-model="editingLimit.triggerMaterial"
                      :label="$t('admin.uiText.autoHtml.k0532')"
                      :placeholder="$t('admin.uiText.autoHtml.k0533')"
                      variant="outlined"
                      rows="2"
                      density="comfortable"
                      hide-details="auto"
                    ></v-textarea>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-textarea
                      v-model="editingLimit.triggerNbt"
                      :label="$t('admin.uiText.autoHtml.k0534')"
                      :placeholder="$t('admin.uiText.autoHtml.k0535')"
                      variant="outlined"
                      rows="2"
                      density="comfortable"
                      hide-details="auto"
                    ></v-textarea>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-text-field
                      v-model="editingLimit.missingPermission"
                      :label="$t('admin.uiText.autoHtml.k0536')"
                      :placeholder="$t('admin.uiText.autoHtml.k0537')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>

              <!-- 右侧列 -->
              <v-col cols="12" md="6" class="pl-md-6">
                <div class="text-subtitle-2 font-weight-bold mb-3 text-secondary">{{ $t('admin.uiText.autoHtml.k0058') }}</div>

                <v-row dense class="gap-y-2">
                  <v-col cols="12">
                    <v-text-field
                      v-model="editingLimit.directionWhitelist"
                      :label="$t('admin.uiText.autoHtml.k0538')"
                      :placeholder="$t('admin.uiText.autoHtml.k0539')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-text-field
                      v-model="editingLimit.tradeModeWhitelist"
                      :label="$t('admin.uiText.autoHtml.k0540')"
                      :placeholder="$t('admin.uiText.autoHtml.k0541')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-text-field
                      v-model="editingLimit.currencyWhitelist"
                      :label="$t('admin.uiText.autoHtml.k0542')"
                      :placeholder="$t('admin.uiText.autoHtml.k0543')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-text-field
                      v-model="editingLimit.tagWhitelist"
                      :label="$t('admin.uiText.autoHtml.k0544')"
                      :placeholder="$t('admin.uiText.autoHtml.k0545')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-text-field
                      v-model="editingLimit.enforcedTag"
                      :label="$t('admin.uiText.autoHtml.k0546')"
                      :placeholder="$t('admin.uiText.autoHtml.k0547')"
                      variant="outlined"
                      density="comfortable"
                      hide-details="auto"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" class="mt-2">
                    <v-card class="pa-3 rounded-lg border bg-light-soft" variant="flat">
                      <div class="d-flex align-center justify-space-between mb-2">
                        <span class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0548') }}</span>
                        <settings-switch
                          v-model="editingLimit.costEnabled"
                          color="primary"
                          hide-details
                        ></settings-switch>
                      </div>
                      <v-row dense>
                        <v-col cols="6">
                          <v-select
                            v-model="editingLimit.costCurrency"
                            :items="[
                              { title: `${$t('admin.uiText.autoHtml.k0193')} (SC)`, value: 'SC' },
                              { title: `${$t('admin.uiText.autoHtml.k0197')} (GC)`, value: 'GC' }
                            ]"
                            :label="$t('admin.uiText.autoHtml.k0551')"
                            variant="outlined"
                            density="compact"
                            hide-details="auto"
                            :disabled="!editingLimit.costEnabled"
                          ></v-select>
                        </v-col>
                        <v-col cols="6">
                          <v-text-field
                            v-model.number="editingLimit.costAmount"
                            type="number"
                            :label="$t('admin.uiText.autoHtml.k0552')"
                            placeholder="10"
                            variant="outlined"
                            density="compact"
                            hide-details="auto"
                            :disabled="!editingLimit.costEnabled"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-end gap-2">
            <v-btn variant="text" color="secondary" rounded="lg" class="text-caption font-weight-bold" @click="limitEditDialog = false">{{ $t('admin.uiText.autoHtml.k0553') }}</v-btn>
            <v-btn color="primary" variant="flat" rounded="lg" class="text-caption font-weight-bold px-6" @click="saveLimitDetails">{{ $t('admin.uiText.autoHtml.k0554') }}</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- 上传语言包对话框 -->
      <v-dialog v-model="uploadDialog" max-width="500" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-surface border">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-black text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-cloud-upload-outline</v-icon>{{ $t('admin.uiText.localeManagerUploadPackageLabel') }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="uploadDialog = false"></v-btn>
          </div>

          <v-sheet
            border
            rounded="xl"
            class="pa-8 text-center border-dashed d-flex flex-column align-center justify-center cursor-pointer hover-bg-row transition-all"
            :style="dragOver ? 'border-color: rgb(var(--v-theme-primary)) !important; background-color: rgba(var(--v-theme-primary), 0.05) !important;' : ''"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop"
            @click="fileInputRef?.click()"
          >
            <v-icon size="48" color="primary" class="mb-3" :loading="uploading">
              {{ uploading ? 'mdi-loading mdi-spin' : 'mdi-cloud-upload-outline' }}
            </v-icon>
            <div class="text-subtitle-2 font-weight-black text-slate-800">{{ $t('admin.uiText.localeStatePickUploadFile') }}</div>
            <div class="text-caption text-medium-emphasis mt-1">{{ $t('admin.uiText.localeStatePickUploadFile') }}</div>
            <input type="file" ref="fileInputRef" style="display: none" accept=".json" @change="handleFileSelect" />
          </v-sheet>

          <div class="d-flex justify-end gap-2 mt-6">
            <v-btn variant="text" color="secondary" rounded="lg" class="text-caption font-weight-bold" @click="uploadDialog = false">{{ $t('admin.uiText.manifestSourceCancelBtn') }}</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- 在线获取语言包对话框 -->
      <v-dialog v-model="onlineFetchDialog" max-width="650" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-surface border">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-black text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-web</v-icon>{{ $t('admin.uiText.localeManifestTitle') }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="onlineFetchDialog = false"></v-btn>
          </div>

          <v-form>
            <v-row class="align-center mb-4 ma-0">
              <v-col cols="6" class="pa-1">
                <v-text-field
                  v-model="manifestUrl"
                  :label="$t('admin.uiText.localeManifestUrlLabel')"
                  placeholder="https://example.com/translations/manifest.json"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                ></v-text-field>
                <div v-if="selectedMirror !== 'none'" class="text-caption text-primary mt-1 d-flex align-center font-weight-bold">
                  <v-icon size="14" class="mr-1">mdi-rocket-launch-outline</v-icon>
                  {{ $t('admin.uiText.manifestSourceDialogTitle') }}：{{ selectedMirror === 'custom' ? customMirrorUrl : selectedMirror }}
                </div>
              </v-col>
              <v-col cols="3" class="pa-1">
                <v-btn
                  color="secondary"
                  block
                  height="48"
                  variant="outlined"
                  class="font-weight-bold rounded-lg"
                  prepend-icon="mdi-rocket-launch-outline"
                  @click="mirrorDialog = true"
                >
                  {{ $t('admin.uiText.localeManifestSourceBtn') }}
                </v-btn>
              </v-col>
              <v-col cols="3" class="pa-1">
                <v-btn
                  color="primary"
                  block
                  height="48"
                  variant="flat"
                  class="font-weight-bold rounded-lg"
                  :loading="fetchingOnlineList"
                  @click="fetchOnlineLanguages"
                >
                  {{ $t('admin.uiText.localeManifestFetchBtn') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <!-- 在线列表展示 -->
          <v-card elevation="0" border class="rounded-xl overflow-hidden mt-2 bg-surface">
            <v-table class="bg-transparent text-slate-800" density="comfortable">
              <thead>
                <tr class="bg-table-header">
                  <th class="font-weight-bold text-subtitle-2">{{ $t('admin.uiText.autoJs.k0240') }}</th>
                  <th class="font-weight-bold text-subtitle-2">{{ $t('admin.uiText.autoHtml.k0505') }}</th>
                  <th class="font-weight-bold text-subtitle-2 text-center" style="width: 120px;">{{ $t('admin.uiText.localeManagerUploadActionLabel') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(olang, oindex) in onlineLanguages" :key="oindex" class="hover-bg-row">
                  <td>{{ olang.name }}</td>
                  <td class="font-mono text-caption">{{ olang.code }}</td>
                  <td class="text-center">
                    <v-btn
                      v-if="!olang.imported"
                      color="primary"
                      size="x-small"
                      variant="flat"
                      class="font-weight-bold rounded-lg"
                      @click="importOnlineLanguage(olang)"
                    >
                      {{ $t('admin.uiText.localeManifestDownloadBtn') }}
                    </v-btn>
                    <v-chip v-else color="success" size="x-small" variant="tonal" class="font-weight-bold">
                      {{ $t('admin.uiText.localeTagBuiltIn') }}
                    </v-chip>
                  </td>
                </tr>
                <tr v-if="onlineLanguages.length === 0">
                  <td colspan="3" class="text-center py-6 text-medium-emphasis text-caption">
                    {{ $t('admin.uiText.localeManifestPromptFetchFirst') }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-end gap-2">
            <v-btn variant="text" color="secondary" rounded="lg" class="text-caption font-weight-bold" @click="onlineFetchDialog = false">{{ $t('admin.uiText.manifestSourceCancelBtn') }}</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- 语言编辑对话框 -->
      <v-dialog v-model="langEditDialog" max-width="500" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-surface border">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-black text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-pencil-outline</v-icon>{{ $t('admin.uiText.localeManagerInstalledLocalesTitle') }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="langEditDialog = false"></v-btn>
          </div>

          <v-form class="d-flex flex-column gap-4">
            <v-text-field
              v-model="editingLang.name"
              :label="$t('admin.uiText.autoJs.k0240')"
              placeholder="zh-CN"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            ></v-text-field>

            <v-text-field
              v-model="editingLang.code"
              :label="$t('admin.uiText.autoHtml.k0505')"
              placeholder="zh-CN"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            ></v-text-field>
          </v-form>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-end gap-2">
            <v-btn variant="text" color="secondary" rounded="lg" class="text-caption font-weight-bold" @click="langEditDialog = false">{{ $t('admin.uiText.manifestSourceCancelBtn') }}</v-btn>
            <v-btn color="primary" variant="flat" rounded="lg" class="text-caption font-weight-bold px-6" @click="saveLangDetails">{{ $t('admin.uiText.autoHtml.k0554') }}</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- 镜像加速设置对话框 -->
      <v-dialog v-model="mirrorDialog" max-width="450" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-surface border">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-black text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-rocket-launch-outline</v-icon>{{ $t('admin.uiText.manifestSourceDialogTitle') }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="mirrorDialog = false"></v-btn>
          </div>

          <p class="text-caption text-medium-emphasis mb-4">
            {{ $t('admin.uiText.manifestSourceDialogDesc') }}
          </p>

          <v-radio-group v-model="selectedMirror" class="mt-2" hide-details>
            <v-radio :label="$t('admin.uiText.manifestSourceModeOff')" value="none" color="primary"></v-radio>
            <v-radio label="https://edgeone.gh-proxy.com/" value="https://edgeone.gh-proxy.com/" color="primary"></v-radio>
            <v-radio label="https://hk.gh-proxy.com/" value="https://hk.gh-proxy.com/" color="primary"></v-radio>
            <v-radio label="https://gh-proxy.com/" value="https://gh-proxy.com/" color="primary"></v-radio>
            <v-radio label="https://gh.llkk.cc/" value="https://gh.llkk.cc/" color="primary"></v-radio>
            <v-radio :label="$t('admin.uiText.autoHtml.k0474')" value="custom" color="primary"></v-radio>
          </v-radio-group>

          <!-- 选择自定义时展示输入框 -->
          <v-expand-transition>
            <div v-if="selectedMirror === 'custom'" class="mt-4">
              <v-text-field
                v-model="customMirrorUrl"
                :label="$t('admin.uiText.manifestSourceProxyLabel')"
                placeholder="https://your-proxy-domain.com/"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              ></v-text-field>
            </div>
          </v-expand-transition>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-end gap-2">
            <v-btn variant="text" color="secondary" rounded="lg" class="text-caption font-weight-bold" @click="mirrorDialog = false">{{ $t('admin.uiText.manifestSourceCancelBtn') }}</v-btn>
            <v-btn color="primary" variant="flat" rounded="lg" class="text-caption font-weight-bold px-6" @click="mirrorDialog = false">{{ $t('admin.uiText.autoHtml.k0554') }}</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- 上传主题包对话框 -->
      <v-dialog v-model="uploadThemeDialog" max-width="500" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-surface border">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-black text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-cloud-upload-outline</v-icon>{{ $t('admin.uiText.themeManagerUploadPackageLabel') }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="uploadThemeDialog = false"></v-btn>
          </div>

          <v-sheet
            border
            rounded="xl"
            class="pa-8 text-center border-dashed d-flex flex-column align-center justify-center cursor-pointer hover-bg-row transition-all"
            :style="themeDragOver ? 'border-color: rgb(var(--v-theme-primary)) !important; background-color: rgba(var(--v-theme-primary), 0.05) !important;' : ''"
            @dragover.prevent="themeDragOver = true"
            @dragleave.prevent="themeDragOver = false"
            @drop.prevent="handleThemeDrop"
            @click="themeFileInputRef?.click()"
          >
            <v-icon size="48" color="primary" class="mb-3" :loading="themeUploading">
              {{ themeUploading ? 'mdi-loading mdi-spin' : 'mdi-cloud-upload-outline' }}
            </v-icon>
            <div class="text-subtitle-2 font-weight-black text-slate-800">{{ $t('admin.uiText.themeStatePickUploadFile') }}</div>
            <div class="text-caption text-medium-emphasis mt-1">{{ $t('admin.uiText.themeStatePickUploadFile') }}</div>
            <input type="file" ref="themeFileInputRef" style="display: none" accept=".json" @change="handleThemeFileSelect" />
          </v-sheet>

          <div class="d-flex justify-end gap-2 mt-6">
            <v-btn variant="text" color="secondary" rounded="lg" class="text-caption font-weight-bold" @click="uploadThemeDialog = false">{{ $t('admin.uiText.manifestSourceCancelBtn') }}</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- 在线获取主题包对话框 -->
      <v-dialog v-model="onlineFetchThemeDialog" max-width="650" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-surface border">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-black text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-web</v-icon>{{ $t('admin.uiText.themeManifestTitle') }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="onlineFetchThemeDialog = false"></v-btn>
          </div>

          <v-form>
            <v-row class="align-center mb-4 ma-0">
              <v-col cols="6" class="pa-1">
                <v-text-field
                  v-model="themeManifestUrl"
                  :label="$t('admin.uiText.themeManifestUrlLabel')"
                  placeholder="https://example.com/themes/manifest.json"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                ></v-text-field>
                <div v-if="selectedThemeMirror !== 'none'" class="text-caption text-primary mt-1 d-flex align-center font-weight-bold">
                  <v-icon size="14" class="mr-1">mdi-rocket-launch-outline</v-icon>
                  {{ $t('admin.uiText.manifestSourceDialogTitle') }}：{{ selectedThemeMirror === 'custom' ? customThemeMirrorUrl : selectedThemeMirror }}
                </div>
              </v-col>
              <v-col cols="3" class="pa-1">
                <v-btn
                  color="secondary"
                  block
                  height="48"
                  variant="outlined"
                  class="font-weight-bold rounded-lg"
                  prepend-icon="mdi-rocket-launch-outline"
                  @click="themeMirrorDialog = true"
                >
                  {{ $t('admin.uiText.localeManifestSourceBtn') }}
                </v-btn>
              </v-col>
              <v-col cols="3" class="pa-1">
                <v-btn
                  color="primary"
                  block
                  height="48"
                  variant="flat"
                  class="font-weight-bold rounded-lg"
                  :loading="fetchingOnlineThemeList"
                  @click="fetchOnlineThemes"
                >
                  {{ $t('admin.uiText.themeManifestFetchBtn') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>

          <!-- 在线列表展示 -->
          <v-card elevation="0" border class="rounded-xl overflow-hidden mt-2 bg-surface">
            <v-table class="bg-transparent text-slate-800" density="comfortable">
              <thead>
                <tr class="bg-table-header">
                  <th class="font-weight-bold text-subtitle-2">{{ $t('admin.uiText.autoJs.k0240') }}</th>
                  <th class="font-weight-bold text-subtitle-2">{{ $t('admin.uiText.autoHtml.k0505') }}</th>
                  <th class="font-weight-bold text-subtitle-2 text-center" style="width: 120px;">{{ $t('admin.uiText.themeManagerUploadActionLabel') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(otheme, oindex) in onlineThemes" :key="oindex" class="hover-bg-row">
                  <td>{{ otheme.name }}</td>
                  <td class="font-mono text-caption">{{ otheme.code }}</td>
                  <td class="text-center">
                    <v-btn
                      v-if="!otheme.imported"
                      color="primary"
                      size="x-small"
                      variant="flat"
                      class="font-weight-bold rounded-lg"
                      @click="importOnlineTheme(otheme)"
                    >
                      {{ $t('admin.uiText.themeManifestDownloadBtn') }}
                    </v-btn>
                    <v-chip v-else color="success" size="x-small" variant="tonal" class="font-weight-bold">
                      {{ $t('admin.uiText.themeTagBuiltIn') }}
                    </v-chip>
                  </td>
                </tr>
                <tr v-if="onlineThemes.length === 0">
                  <td colspan="3" class="text-center py-6 text-medium-emphasis text-caption">
                    {{ $t('admin.uiText.themeManifestPromptFetchFirst') }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-end gap-2">
            <v-btn variant="text" color="secondary" rounded="lg" class="text-caption font-weight-bold" @click="onlineFetchThemeDialog = false">{{ $t('admin.uiText.manifestSourceCancelBtn') }}</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- 主题编辑对话框 -->
      <v-dialog v-model="themeEditDialog" max-width="500" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-surface border">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-black text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-pencil-outline</v-icon>{{ $t('admin.uiText.themeManagerInstalledThemesTitle') }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="themeEditDialog = false"></v-btn>
          </div>

          <v-form class="d-flex flex-column gap-4">
            <v-text-field
              v-model="editingTheme.name"
              :label="$t('admin.uiText.autoJs.k0240')"
              placeholder="sakura-pink"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            ></v-text-field>

            <v-text-field
              v-model="editingTheme.code"
              :label="$t('admin.uiText.autoHtml.k0505')"
              placeholder="sakura-pink"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
            ></v-text-field>
          </v-form>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-end gap-2">
            <v-btn variant="text" color="secondary" rounded="lg" class="text-caption font-weight-bold" @click="themeEditDialog = false">{{ $t('admin.uiText.manifestSourceCancelBtn') }}</v-btn>
            <v-btn color="primary" variant="flat" rounded="lg" class="text-caption font-weight-bold px-6" @click="saveThemeDetails">{{ $t('admin.uiText.autoHtml.k0554') }}</v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- 主题镜像加速设置对话框 -->
      <v-dialog v-model="themeMirrorDialog" max-width="450" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 bg-surface border">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-black text-slate-800">
              <v-icon color="primary" class="mr-2">mdi-rocket-launch-outline</v-icon>{{ $t('admin.uiText.manifestSourceDialogTitle') }}
            </h3>
            <v-btn icon="mdi-close" variant="text" size="small" @click="themeMirrorDialog = false"></v-btn>
          </div>

          <p class="text-caption text-medium-emphasis mb-4">
            {{ $t('admin.uiText.manifestSourceDialogDesc') }}
          </p>

          <v-radio-group v-model="selectedThemeMirror" class="mt-2" hide-details>
            <v-radio :label="$t('admin.uiText.manifestSourceModeOff')" value="none" color="primary"></v-radio>
            <v-radio label="https://edgeone.gh-proxy.com/" value="https://edgeone.gh-proxy.com/" color="primary"></v-radio>
            <v-radio label="https://hk.gh-proxy.com/" value="https://hk.gh-proxy.com/" color="primary"></v-radio>
            <v-radio label="https://gh-proxy.com/" value="https://gh-proxy.com/" color="primary"></v-radio>
            <v-radio label="https://gh.llkk.cc/" value="https://gh.llkk.cc/" color="primary"></v-radio>
            <v-radio :label="$t('admin.uiText.autoHtml.k0474')" value="custom" color="primary"></v-radio>
          </v-radio-group>

          <!-- 选择自定义时展示输入框 -->
          <v-expand-transition>
            <div v-if="selectedThemeMirror === 'custom'" class="mt-4">
              <v-text-field
                v-model="customThemeMirrorUrl"
                :label="$t('admin.uiText.manifestSourceProxyLabel')"
                placeholder="https://your-proxy-domain.com/"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              ></v-text-field>
            </div>
          </v-expand-transition>

          <v-divider class="my-6"></v-divider>

          <div class="d-flex justify-end gap-2">
            <v-btn variant="text" color="secondary" rounded="lg" class="text-caption font-weight-bold" @click="themeMirrorDialog = false">{{ $t('admin.uiText.manifestSourceCancelBtn') }}</v-btn>
            <v-btn color="primary" variant="flat" rounded="lg" class="text-caption font-weight-bold px-6" @click="themeMirrorDialog = false">{{ $t('admin.uiText.autoHtml.k0554') }}</v-btn>
          </div>
        </v-card>
      </v-dialog>

    </v-container>
  </admin-gate>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import AdminGate from '@/components/AdminGate.vue'
import { adminApi } from '@/api/admin'
import { resolveAssetUrl } from '@/utils/texture'
import { onBeforeRouteLeave } from 'vue-router'

const { mdAndUp } = useDisplay()
const { t } = useI18n()
const showDetail = ref(false)

const activeTab = ref(['economy'])
const saving = ref(false)
const snackbar = ref(false)
const loading = ref(false)

// Baseline lists for diff tracking
let initialMaterialOverrides: any[] = []
let initialLanguageList: any[] = []
let initialThemeList: any[] = []

// Vault 对接状态
const vaultStatus = ref({
  connected: false,
  vaultPluginPresent: false,
  provider: '',
  gameCoinBackedByVault: false
})

const checkingVault = ref(false)

async function checkVaultStatus() {
  checkingVault.value = true
  try {
    const res = await adminApi.getEconomySettings()
    if (res && res.data) {
      const vaultData = res.data.vault || {}
      vaultStatus.value = {
        connected: !!vaultData.hooked,
        vaultPluginPresent: !!vaultData.vaultPluginPresent,
        provider: vaultData.provider || '',
        gameCoinBackedByVault: !!vaultData.gameCoinBackedByVault
      }
    }
  } catch (error) {
    console.error('Failed to check Vault status:', error)
  } finally {
    checkingVault.value = false
  }
}

// 经济设置绑定的数据状态
const economySettings = ref({
  webToGameEnabled: true,
  webToGameRate: 100,
  gameToWebEnabled: false,
  gameToWebRate: 0.01,
  marketFeeEnabled: true,
  marketFeePercent: 5,
  marketTaxEnabled: true,
  marketTaxPercent: 2,
  treasuryEnabled: false,
  treasuryAccountId: '',
  webCoinName: '网页币',
  webCoinSymbol: 'SC',
  gameCoinName: '游戏币',
  gameCoinSymbol: 'GC'
})

// 商品设置绑定的数据状态
const productSettings = ref({
  materialOverrides: [] as any[],
  tags: [] as any[]
})

// 权限设置绑定的数据状态 (支持详细的16个属性、商品自定义权限、以及市场运行参数)
const permissionSettings = ref({
  listingLimits: [] as any[],
  customPermissions: {
    globalCustomIconEnabled: true,
    iconPolicy: 'SOFT',
    globalCustomNameEnabled: true,
    namePolicy: 'SOFT',
    officialAllowCustomIcon: true,
    officialAllowCustomName: true,
    officialAllowUploadImage: false,
    playerAllowCustomIcon: true,
    playerAllowCustomName: true,
    playerAllowUploadImage: true
  },
  marketParams: {
    defaultMaxListings: 10,
    autoRestockThreshold: 8,
    defaultSingleExtraction: 64,
    maxSingleExtraction: 256,
    defaultTransitStock: 256,
    maxTransitStock: 1024
  }
})

// 前端设置绑定的数据状态
const frontendSettings = ref({
  leaderboard: {
    enabled: true,
    showOnlineStatus: true,
    defaultDimension: 'gold',
    defaultSortDirection: 'desc'
  },
  siteParams: {
    defaultLanguage: 'zh-CN',
    timezone: 'Asia/Shanghai',
    sessionExpiryHours: 72,
    bindingRequestExpiryMinutes: 15,
    accessTokenLength: 48,
    deliveryBatchSize: 20,
    deliveryRetryIntervalSeconds: 30,
    orderCooldownSeconds: 15,
    allowSubstituteCommand: false,
    allowRefundUnshipped: true
  },
  broadcast: {
    enabled: true,
    listTemplate: '&6[市场] &e{seller}&r 上架了 &b{item}&r x{quantity}，单价 {priceText}',
    dealTemplate: '&6[市场] &e{buyer}&r 购买了 &b{item}&r x{quantity}，成交总价 {totalText}',
    bidTemplate: '&6[拍卖] &e{bidder}&r 对拍卖 #{listingId} 出价 {bidAmountText}',
    sealedBidTemplate: '&6[拍卖] &e 拍卖 #{listingId} 收到新的密封出价'
  }
})

// 后端设置绑定的数据状态
const backendSettings = ref({
  deploymentMode: {
    dbType: 'MYSQL',
    clusterRole: 'STANDALONE',
    redisBus: 'OFF',
    crossServerSync: 'Disabled'
  }
})

// 其它设置绑定的数据状态
const otherSettings = ref({
  maintenance: {
    cleanupIntervalMinutes: 30,
    pendingBindExpiryHours: 6,
    pendingPasswordExpiryHours: 6,
    bindRequestExpiryHours: 24,
    redeemCodeExpiryDays: 7
  },
  logging: {
    fileLogEnabled: true,
    logLevel: 'INFO',
    logDirectory: 'logs',
    maxFileSizeMB: 8,
    maxBackupFiles: 8,
    retentionDays: 14
  }
})


// 语言管理数据状态
const languageList = ref<any[]>([])

const uploadDialog = ref(false)
const onlineFetchDialog = ref(false)
const langEditDialog = ref(false)

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const dragOver = ref(false)

const manifestUrl = ref('https://api.webshopx.org/translations/manifest.json')
const fetchingOnlineList = ref(false)
const onlineLanguages = ref<any[]>([])

const mirrorDialog = ref(false)
const selectedMirror = ref('none')
const customMirrorUrl = ref('')

const editingLangIndex = ref(-1)
const editingLang = ref({
  name: '',
  code: '',
  webEnabled: true,
  gameEnabled: false
})

// 主题管理数据状态
const themeList = ref<any[]>([])

const uploadThemeDialog = ref(false)
const onlineFetchThemeDialog = ref(false)
const themeEditDialog = ref(false)
const themeMirrorDialog = ref(false)

const themeFileInputRef = ref<HTMLInputElement | null>(null)
const themeUploading = ref(false)
const themeDragOver = ref(false)

const themeManifestUrl = ref('https://api.webshopx.org/themes/manifest.json')
const fetchingOnlineThemeList = ref(false)
const onlineThemes = ref<any[]>([])

const selectedThemeMirror = ref('none')
const customThemeMirrorUrl = ref('')

const editingThemeIndex = ref(-1)
const editingTheme = ref({
  name: '',
  code: '',
  webEnabled: true,
  gameEnabled: false
})




// 标签与限制修改对话框状态
const tagEditDialog = ref(false)
const editingTagIndex = ref(-1)
const editingTag = ref({
  name: '',
  priority: 0,
  materialWhitelist: '',
  nbtKeywords: ''
})

const limitEditDialog = ref(false)
const editingLimitIndex = ref(-1)
const editingLimit = ref<any>({
  id: '',
  enabled: true,
  priority: 10,
  actionType: 'reject',
  rejectErrorCode: 'LIMIT_TRIGGERED',
  triggerDirection: 'LIST',
  triggerMaterial: '',
  triggerNbt: '',
  missingPermission: '',
  directionWhitelist: '',
  tradeModeWhitelist: '',
  currencyWhitelist: '',
  tagWhitelist: '',
  enforcedTag: '',
  costEnabled: false,
  costCurrency: 'SC',
  costAmount: 0
})

// ---- Unsaved changes detection ----
const originalLimitationConfig = ref<any>({})
const originalWebshopRuntime = ref<any>({})
const initialSettingsSnapshot = ref('')

function getCurrentSettingsSnapshot(): string {
  return JSON.stringify({
    economy: economySettings.value,
    products: {
      materialOverrides: productSettings.value.materialOverrides.map(({ iconFile, ...rest }: any) => rest),
      tags: productSettings.value.tags
    },
    permissions: permissionSettings.value,
    frontend: frontendSettings.value,
    backend: backendSettings.value,
    other: otherSettings.value,
    languages: languageList.value,
    themes: themeList.value
  })
}

const hasUnsavedChanges = computed(() => {
  if (!initialSettingsSnapshot.value) return false
  return getCurrentSettingsSnapshot() !== initialSettingsSnapshot.value
})

function isModuleDirty(moduleName: string): boolean {
  if (!initialSettingsSnapshot.value) {
    console.log(`[isModuleDirty] Module '${moduleName}' baseline snapshot is empty, returning false.`);
    return false;
  }
  try {
    const parsed = JSON.parse(initialSettingsSnapshot.value)
    let dirty = false
    let currentStr = ''
    let baselineStr = ''
    
    if (moduleName === 'economy') {
      currentStr = JSON.stringify(economySettings.value)
      baselineStr = JSON.stringify(parsed.economy)
      dirty = currentStr !== baselineStr
    } else if (moduleName === 'products') {
      const currentProducts = {
        materialOverrides: productSettings.value.materialOverrides.map(({ iconFile, ...rest }: any) => rest),
        tags: productSettings.value.tags
      }
      currentStr = JSON.stringify(currentProducts)
      baselineStr = JSON.stringify(parsed.products)
      dirty = currentStr !== baselineStr
    } else if (moduleName === 'permissions') {
      currentStr = JSON.stringify(permissionSettings.value)
      baselineStr = JSON.stringify(parsed.permissions)
      dirty = currentStr !== baselineStr
    } else if (moduleName === 'frontend') {
      const baseDirty = JSON.stringify(frontendSettings.value) !== JSON.stringify(parsed.frontend)
      const langDirty = JSON.stringify(languageList.value) !== JSON.stringify(parsed.languages)
      const themeDirty = JSON.stringify(themeList.value) !== JSON.stringify(parsed.themes)
      dirty = baseDirty || langDirty || themeDirty
      
      console.log(`[isModuleDirty] Frontend sub-modules check:`, { baseDirty, langDirty, themeDirty })
    } else if (moduleName === 'backend') {
      currentStr = JSON.stringify(backendSettings.value)
      baselineStr = JSON.stringify(parsed.backend)
      dirty = currentStr !== baselineStr
    } else if (moduleName === 'other') {
      currentStr = JSON.stringify(otherSettings.value)
      baselineStr = JSON.stringify(parsed.other)
      dirty = currentStr !== baselineStr
    }
    
    console.log(`[isModuleDirty] Module '${moduleName}' dirty check result: ${dirty}`);
    if (dirty && currentStr && baselineStr) {
      console.log(`[isModuleDirty] Diff details for '${moduleName}':`, {
        current: JSON.parse(currentStr),
        baseline: JSON.parse(baselineStr)
      });
    }
    return dirty
  } catch (e) {
    console.error('Failed to parse settings snapshot for dirty check', e)
  }
  return false
}

function discardAllChanges() {
  if (!initialSettingsSnapshot.value) return
  try {
    const parsed = JSON.parse(initialSettingsSnapshot.value)
    
    economySettings.value = JSON.parse(JSON.stringify(parsed.economy))
    
    productSettings.value.materialOverrides = JSON.parse(JSON.stringify(parsed.products.materialOverrides))
    initialMaterialOverrides = JSON.parse(JSON.stringify(productSettings.value.materialOverrides))
    
    productSettings.value.tags = JSON.parse(JSON.stringify(parsed.products.tags))
    
    permissionSettings.value = JSON.parse(JSON.stringify(parsed.permissions))
    frontendSettings.value = JSON.parse(JSON.stringify(parsed.frontend))
    backendSettings.value = JSON.parse(JSON.stringify(parsed.backend))
    otherSettings.value = JSON.parse(JSON.stringify(parsed.other))
    
    languageList.value = JSON.parse(JSON.stringify(parsed.languages))
    initialLanguageList = JSON.parse(JSON.stringify(languageList.value))
    
    themeList.value = JSON.parse(JSON.stringify(parsed.themes))
    initialThemeList = JSON.parse(JSON.stringify(themeList.value))
    
    snackbar.value = true
  } catch (e) {
    console.error('Failed to discard changes', e)
  }
}

function handleBeforeUnload(e: BeforeUnloadEvent) {
  if (hasUnsavedChanges.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  loadAllSettings()
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

onBeforeRouteLeave(() => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm(t('admin.uiText.unsavedChangesConfirm'))
    if (!answer) return false
  }
})

async function loadAllSettings() {
  loading.value = true
  try {
    const [economyRes, materialRes, localesRes, themesRes] = await Promise.all([
      adminApi.getEconomySettings(),
      adminApi.getMaterialOverridesList(),
      adminApi.getLocales(),
      adminApi.getThemes()
    ])

    const data = economyRes.data

    const vaultData = data.vault || {}
    vaultStatus.value = {
      connected: !!vaultData.hooked,
      vaultPluginPresent: !!vaultData.vaultPluginPresent,
      provider: vaultData.provider || '',
      gameCoinBackedByVault: !!vaultData.gameCoinBackedByVault
    }

    economySettings.value = {
      webToGameEnabled: !!data.exchange?.shopToGame?.enabled,
      webToGameRate: data.exchange?.shopToGame?.ratio ?? 100,
      gameToWebEnabled: !!data.exchange?.gameToShop?.enabled,
      gameToWebRate: data.exchange?.gameToShop?.ratio ?? 0.01,
      marketFeeEnabled: (data.market?.tradeFeePercent ?? 0) > 0,
      marketFeePercent: data.market?.tradeFeePercent ?? 5,
      marketTaxEnabled: (data.market?.tradeTaxPercent ?? 0) > 0,
      marketTaxPercent: data.market?.tradeTaxPercent ?? 2,
      treasuryEnabled: (data.inflation?.mode === 'TREASURY'),
      treasuryAccountId: data.inflation?.treasuryUserId ? String(data.inflation.treasuryUserId) : '',
      webCoinName: data.currency?.shopCoinName ?? '网页币',
      webCoinSymbol: data.currency?.shopCoinShort ?? 'SC',
      gameCoinName: data.currency?.gameCoinName ?? '游戏币',
      gameCoinSymbol: data.currency?.gameCoinShort ?? 'GC'
    }

    const overridesArray = Array.isArray(materialRes.data)
      ? materialRes.data
      : (materialRes.data?.overrides || [])
    productSettings.value.materialOverrides = overridesArray.map((item: any) => ({
      id: item.material || '',
      customName: item.customName || '',
      iconUrl: item.iconUrl || '',
      iconFile: null,
      enabled: item.enabled !== false
    }))
    initialMaterialOverrides = JSON.parse(JSON.stringify(productSettings.value.materialOverrides))

    productSettings.value.tags = (data.marketTagsConfig?.tags || []).map((t: any) => ({
      name: t.name || '',
      color: t.color || 'primary',
      description: t.description || '',
      visible: t.visible !== false,
      priority: t.priority ?? 10,
      materialWhitelist: t.materialWhitelist ? t.materialWhitelist.join(',') : '',
      nbtKeywords: t.nbtKeywords ? t.nbtKeywords.join(',') : ''
    }))

    permissionSettings.value.listingLimits = (data.marketLimitationConfig?.rules || []).map((r: any) => ({
      id: r.id || '',
      enabled: r.enabled !== false,
      priority: r.priority ?? 10,
      actionType: r.actionType || 'reject',
      rejectErrorCode: r.rejectErrorCode || 'LIMIT_TRIGGERED',
      triggerDirection: r.triggerDirection || 'LIST',
      triggerMaterial: r.triggerMaterial ? r.triggerMaterial.join(',') : '',
      triggerNbt: r.triggerNbt ? r.triggerNbt.join(',') : '',
      missingPermission: r.missingPermission || '',
      directionWhitelist: r.directionWhitelist ? r.directionWhitelist.join(',') : '',
      tradeModeWhitelist: r.tradeModeWhitelist ? r.tradeModeWhitelist.join(',') : '',
      currencyWhitelist: r.currencyWhitelist ? r.currencyWhitelist.join(',') : '',
      tagWhitelist: r.tagWhitelist ? r.tagWhitelist.join(',') : '',
      enforcedTag: r.enforcedTag || '',
      costEnabled: !!r.costEnabled,
      costCurrency: r.costCurrency || 'SC',
      costAmount: r.costAmount ?? 0
    }))

    permissionSettings.value.customPermissions = {
      globalCustomIconEnabled: !!data.visual?.globalCustomIconEnabled,
      iconPolicy: data.visual?.iconPolicyMode || 'SOFT',
      globalCustomNameEnabled: !!data.visual?.globalCustomNameEnabled,
      namePolicy: data.visual?.namePolicyMode || 'SOFT',
      officialAllowCustomIcon: !!data.visual?.officialProductCustomIconEnabled,
      officialAllowCustomName: !!data.visual?.officialProductCustomNameEnabled,
      officialAllowUploadImage: !!data.visual?.officialProductUploadImageEnabled,
      playerAllowCustomIcon: !!data.visual?.marketListingCustomIconEnabled,
      playerAllowCustomName: !!data.visual?.marketListingCustomNameEnabled,
      playerAllowUploadImage: !!data.visual?.marketListingUploadImageEnabled
    }

    permissionSettings.value.marketParams = {
      defaultMaxListings: data.marketRuntime?.marketMaxActiveListings ?? 10,
      autoRestockThreshold: data.marketRuntime?.autoRefreshThreshold ?? 8,
      defaultSingleExtraction: data.marketRuntime?.defaultTransferBatchSize ?? 64,
      maxSingleExtraction: data.marketRuntime?.maxTransferBatchSize ?? 256,
      defaultTransitStock: data.marketRuntime?.defaultTransitStock ?? 256,
      maxTransitStock: data.marketRuntime?.maxTransitStock ?? 1024
    }

    frontendSettings.value.leaderboard = {
      enabled: !!data.leaderboard?.enabled,
      showOnlineStatus: !!data.leaderboard?.showOnlineStatus,
      defaultDimension: data.leaderboard?.defaultMetric ? data.leaderboard.defaultMetric.toLowerCase() : 'gold',
      defaultSortDirection: data.leaderboard?.defaultOrder ? data.leaderboard.defaultOrder.toLowerCase() : 'desc'
    }

    frontendSettings.value.siteParams = {
      defaultLanguage: data.webshopRuntime?.defaultLocale || 'zh-CN',
      timezone: data.webshopRuntime?.timeZone || 'Asia/Shanghai',
      sessionExpiryHours: data.webshopRuntime?.sessionExpireHours ?? 72,
      bindingRequestExpiryMinutes: data.webshopRuntime?.bindRequestExpireMinutes ?? 15,
      accessTokenLength: data.webshopRuntime?.accessTokenLength ?? 48,
      deliveryBatchSize: data.webshopRuntime?.deliveryBatchSize ?? 20,
      deliveryRetryIntervalSeconds: data.webshopRuntime?.deliveryRetrySeconds ?? 30,
      orderCooldownSeconds: data.webshopRuntime?.orderCooldownSeconds ?? 15,
      allowSubstituteCommand: !!data.webshopRuntime?.allowSharedClaimCommand,
      allowRefundUnshipped: !!data.webshopRuntime?.refundUndeliveredEnabled
    }

    const templates = data.broadcast?.templates || {}
    frontendSettings.value.broadcast = {
      enabled: !!data.broadcast?.enabled,
      listTemplate: templates['listing-created'] || '&6[市场] &e{seller}&r 上架了 &b{item}&r x{quantity}，单价 {priceText}',
      dealTemplate: templates['trade-success'] || '&6[市场] &e{buyer}&r 购买了 &b{item}&r x{quantity}，成交总价 {totalText}',
      bidTemplate: templates['auction-bid'] || '&6[拍卖] &e{bidder}&r 对拍卖 #{listingId} 出价 {bidAmountText}',
      sealedBidTemplate: templates['auction-sealed-bid'] || '&6[拍卖] &e 拍卖 #{listingId} 收到新的密封出价'
    }

    backendSettings.value.deploymentMode = {
      dbType: data.deployment?.dbType || 'MYSQL',
      clusterRole: data.deployment?.clusterRole || 'STANDALONE',
      redisBus: data.deployment?.redisBusEnabled ? 'ON' : 'OFF',
      crossServerSync: data.deployment?.crossServerSyncEnabled ? 'Enabled' : 'Disabled'
    }

    otherSettings.value.maintenance = {
      cleanupIntervalMinutes: data.maintenance?.cleanupIntervalMinutes ?? 30,
      pendingBindExpiryHours: data.maintenance?.pendingBindRetentionHours ?? 6,
      pendingPasswordExpiryHours: data.maintenance?.pendingPasswordRetentionHours ?? 6,
      bindRequestExpiryHours: data.maintenance?.bindRequestRetentionHours ?? 24,
      redeemCodeExpiryDays: data.maintenance?.redeemCodeRetentionDays ?? 7
    }

    otherSettings.value.logging = {
      fileLogEnabled: !!data.logging?.enabled,
      logLevel: data.logging?.level || 'INFO',
      logDirectory: data.logging?.directory || 'logs',
      maxFileSizeMB: data.logging?.maxFileSizeMb ?? 8,
      maxBackupFiles: data.logging?.maxFiles ?? 8,
      retentionDays: data.logging?.retentionDays ?? 14
    }

    const localesArray = Array.isArray(localesRes.data)
      ? localesRes.data
      : (localesRes.data?.locales || [])
    languageList.value = localesArray.map((l: any) => ({
      webEnabled: !!l.webEnabled,
      gameEnabled: !!l.gameEnabled,
      code: l.code || '',
      name: l.name || ''
    }))
    initialLanguageList = JSON.parse(JSON.stringify(languageList.value))

    const themesArray = Array.isArray(themesRes.data)
      ? themesRes.data
      : (themesRes.data?.themes || [])
    themeList.value = themesArray.map((t: any) => ({
      webEnabled: !!t.webEnabled,
      gameEnabled: !!t.gameEnabled,
      code: t.code || '',
      name: t.name || ''
    }))
    initialThemeList = JSON.parse(JSON.stringify(themeList.value))

    // Store original configurations
    originalLimitationConfig.value = data.marketLimitationConfig || {}
    originalWebshopRuntime.value = data.webshopRuntime || {}

    // Take initial snapshot for unsaved changes detection
    initialSettingsSnapshot.value = getCurrentSettingsSnapshot()

  } catch (error) {
    console.error('Failed to load settings:', error)
  } finally {
    loading.value = false
  }
}

function getTabTitleKey(tabValue: string) {
  const keys: Record<string, string> = {
    economy: 'admin.uiText.tabLabelEconomy',
    products: 'admin.uiText.tabLabelProducts',
    permissions: 'admin.uiText.tabLabelMarket',
    frontend: 'admin.uiText.tabLabelFrontend',
    backend: 'admin.uiText.tabLabelBackend',
    other: 'admin.uiText.tabLabelOther'
  }
  return keys[tabValue] ?? 'admin.uiText.page.navSystem'
}

// 对照表操作
function addMaterialOverride() {
  productSettings.value.materialOverrides.push({
    id: '',
    customName: '',
    iconUrl: '',
    iconFile: null,
    enabled: true
  })
}

// 移除对照关系
function removeMaterialOverride(index: number) {
  productSettings.value.materialOverrides.splice(index, 1)
}

async function handleIconUpload(file: File | File[] | null, index: number) {
  const targetFile = Array.isArray(file) ? file[0] : file
  if (targetFile) {
    const item = productSettings.value.materialOverrides[index]
    if (!item.id) {
      alert(t('admin.uiText.materialIdRequiredBeforeUpload'))
      item.iconFile = null
      return
    }
    try {
      saving.value = true
      const uploadRes = await adminApi.uploadMaterialOverrideIcon(
        { material: item.id, filename: targetFile.name },
        targetFile
      )
      if (uploadRes.data?.iconUrl) {
        item.iconUrl = uploadRes.data.iconUrl
      }
    } catch (err) {
      console.error(err)
      alert(t('admin.uiText.iconUploadFailed'))
    } finally {
      saving.value = false
    }
  }
}

// 标签操作
function addTag() {
  productSettings.value.tags.push({
    name: 'NEW_TAG',
    color: 'primary',
    description: '自定义标签描述',
    visible: true,
    priority: 10,
    materialWhitelist: '',
    nbtKeywords: ''
  })
}

function removeTag(index: number) {
  productSettings.value.tags.splice(index, 1)
}

function openTagEditDialog(index: number) {
  editingTagIndex.value = index
  const tag = productSettings.value.tags[index]
  editingTag.value = {
    name: tag.name,
    priority: tag.priority ?? 0,
    materialWhitelist: tag.materialWhitelist ?? '',
    nbtKeywords: tag.nbtKeywords ?? ''
  }
  tagEditDialog.value = true
}

// 保存标签规则配置
function saveTagDetails() {
  if (editingTagIndex.value > -1) {
    const tag = productSettings.value.tags[editingTagIndex.value]
    tag.priority = editingTag.value.priority
    tag.materialWhitelist = editingTag.value.materialWhitelist
    tag.nbtKeywords = editingTag.value.nbtKeywords
  }
  tagEditDialog.value = false
}

// 权限限制规则操作
function addListingLimit() {
  editingLimitIndex.value = -1
  editingLimit.value = {
    id: 'rule_' + Math.floor(Math.random() * 10000),
    enabled: true,
    priority: 10,
    actionType: 'reject',
    rejectErrorCode: 'LIMIT_TRIGGERED',
    triggerDirection: 'LIST',
    triggerMaterial: '',
    triggerNbt: '',
    missingPermission: '',
    directionWhitelist: '',
    tradeModeWhitelist: '',
    currencyWhitelist: '',
    tagWhitelist: '',
    enforcedTag: '',
    costEnabled: false,
    costCurrency: 'SC',
    costAmount: 0
  }
  limitEditDialog.value = true
}

function removeListingLimit(index: number) {
  permissionSettings.value.listingLimits.splice(index, 1)
}

function openLimitEditDialog(index: number) {
  editingLimitIndex.value = index
  const rule = permissionSettings.value.listingLimits[index]
  editingLimit.value = { ...rule }
  limitEditDialog.value = true
}

function saveLimitDetails() {
  if (editingLimitIndex.value === -1) {
    permissionSettings.value.listingLimits.push({ ...editingLimit.value })
  } else {
    permissionSettings.value.listingLimits[editingLimitIndex.value] = { ...editingLimit.value }
  }
  limitEditDialog.value = false
}

// 语言管理操作
function openLangEditDialog(index: number) {
  editingLangIndex.value = index
  const lang = languageList.value[index]
  editingLang.value = {
    name: lang.name,
    code: lang.code,
    webEnabled: lang.webEnabled,
    gameEnabled: lang.gameEnabled
  }
  langEditDialog.value = true
}

function saveLangDetails() {
  if (editingLangIndex.value > -1) {
    const lang = languageList.value[editingLangIndex.value]
    lang.name = editingLang.value.name
    lang.code = editingLang.value.code
  }
  langEditDialog.value = false
}

function removeLanguage(index: number) {
  languageList.value.splice(index, 1)
}

function handleDrop(e: DragEvent) {
  dragOver.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processUploadedFile(files[0])
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    processUploadedFile(files[0])
  }
}

async function processUploadedFile(file: File) {
  if (!file.name.endsWith('.json') && !file.name.endsWith('.zip')) {
    alert(t('admin.uiText.localeStatePickUploadFile'))
    return
  }
  uploading.value = true
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const result = e.target?.result as string
      const base64Content = result.substring(result.indexOf(',') + 1)
      await adminApi.uploadLocale({
        fileName: file.name,
        contentBase64: base64Content,
        source: 'upload'
      })
      // reload locales
      const localesRes = await adminApi.getLocales()
      const localesArray = Array.isArray(localesRes.data)
        ? localesRes.data
        : (localesRes.data?.locales || [])
      languageList.value = localesArray.map((l: any) => ({
        webEnabled: !!l.webEnabled,
        gameEnabled: !!l.gameEnabled,
        code: l.code || '',
        name: l.name || ''
      }))
      initialLanguageList = JSON.parse(JSON.stringify(languageList.value))
      initialSettingsSnapshot.value = getCurrentSettingsSnapshot()
      uploadDialog.value = false
    }
    reader.readAsDataURL(file)
  } catch (error) {
    console.error(error)
    alert(t('admin.uiText.localeUploadFailed'))
  } finally {
    uploading.value = false
  }
}

function openOnlineFetchDialog() {
  onlineLanguages.value = []
  onlineFetchDialog.value = true
}

function getProxyParams(mirrorValue: string, customUrl: string) {
  if (mirrorValue === 'none' || mirrorValue === 'off') {
    return { githubProxy: 'off', githubProxyPrefix: '' }
  }
  if (mirrorValue === 'custom') {
    return { githubProxy: 'on', githubProxyPrefix: customUrl }
  }
  return { githubProxy: 'on', githubProxyPrefix: mirrorValue }
}

async function fetchOnlineLanguages() {
  if (!manifestUrl.value) return
  fetchingOnlineList.value = true
  try {
    const proxyParams = getProxyParams(selectedMirror.value, customMirrorUrl.value)
    const res = await adminApi.getL10nManifest({
      url: manifestUrl.value,
      githubProxy: proxyParams.githubProxy,
      githubProxyPrefix: proxyParams.githubProxyPrefix
    })
    const manifest = res.data || {}
    const locales = manifest.locales || []
    onlineLanguages.value = locales.map((l: any) => ({
      name: l.name || l.locale || '',
      code: l.code || l.locale || '',
      imported: languageList.value.some(el => el.code === (l.code || l.locale))
    }))
  } catch (err) {
    console.error(err)
    alert(t('admin.uiText.localeFetchOnlineFailed'))
  } finally {
    fetchingOnlineList.value = false
  }
}

async function importOnlineLanguage(lang: any) {
  fetchingOnlineList.value = true
  try {
    const proxyParams = getProxyParams(selectedMirror.value, customMirrorUrl.value)
    await adminApi.syncLocalesManifest({
      url: manifestUrl.value,
      githubProxy: proxyParams.githubProxy,
      githubProxyPrefix: proxyParams.githubProxyPrefix,
      locales: [lang.code]
    })
    lang.imported = true
    // Reload locales list
    const localesRes = await adminApi.getLocales()
    const localesArray = Array.isArray(localesRes.data)
      ? localesRes.data
      : (localesRes.data?.locales || [])
    languageList.value = localesArray.map((l: any) => ({
      webEnabled: !!l.webEnabled,
      gameEnabled: !!l.gameEnabled,
      code: l.code || '',
      name: l.name || ''
    }))
    initialLanguageList = JSON.parse(JSON.stringify(languageList.value))
    initialSettingsSnapshot.value = getCurrentSettingsSnapshot()
  } catch (err) {
    console.error(err)
    alert(t('admin.uiText.localeImportOnlineFailed'))
  } finally {
    fetchingOnlineList.value = false
  }
}

// 主题管理操作
function openThemeEditDialog(index: number) {
  editingThemeIndex.value = index
  const theme = themeList.value[index]
  editingTheme.value = {
    name: theme.name,
    code: theme.code,
    webEnabled: theme.webEnabled,
    gameEnabled: theme.gameEnabled
  }
  themeEditDialog.value = true
}

// 保存主题详情
function saveThemeDetails() {
  if (editingThemeIndex.value > -1) {
    const theme = themeList.value[editingThemeIndex.value]
    theme.name = editingTheme.value.name
    theme.code = editingTheme.value.code
  }
  themeEditDialog.value = false
}

function removeTheme(index: number) {
  themeList.value.splice(index, 1)
}

function handleThemeDrop(e: DragEvent) {
  themeDragOver.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processThemeUploadedFile(files[0])
  }
}

// 处理主题文件选择
function handleThemeFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    processThemeUploadedFile(files[0])
  }
}

async function processThemeUploadedFile(file: File) {
  if (!file.name.endsWith('.zip')) {
    alert(t('admin.uiText.themeStatePickUploadFile'))
    return
  }
  themeUploading.value = true
  try {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string
        const base64Content = result.substring(result.indexOf(',') + 1)
        await adminApi.uploadTheme({
          fileName: file.name,
          contentBase64: base64Content,
          source: 'upload'
        })
        // reload themes
        const themesRes = await adminApi.getThemes()
        const themesArray = Array.isArray(themesRes.data)
          ? themesRes.data
          : (themesRes.data?.themes || [])
        themeList.value = themesArray.map((t: any) => ({
          webEnabled: !!t.webEnabled,
          gameEnabled: !!t.gameEnabled,
          code: t.code || '',
          name: t.name || ''
        }))
        initialThemeList = JSON.parse(JSON.stringify(themeList.value))
        initialSettingsSnapshot.value = getCurrentSettingsSnapshot()
        uploadThemeDialog.value = false
      } catch (error: any) {
        console.error(error)
        alert(t('admin.uiText.themeUploadFailed') + (error.response?.data?.message || error.message))
      } finally {
        themeUploading.value = false
      }
    }
    reader.readAsDataURL(file)
  } catch (error: any) {
    console.error(error)
    alert(t('admin.uiText.themeReadFailed'))
    themeUploading.value = false
  }
}

function openOnlineFetchThemeDialog() {
  onlineThemes.value = []
  onlineFetchThemeDialog.value = true
}

async function fetchOnlineThemes() {
  if (!themeManifestUrl.value) return
  fetchingOnlineThemeList.value = true
  try {
    const proxyParams = getProxyParams(selectedThemeMirror.value, customThemeMirrorUrl.value)
    const res = await adminApi.getL10nManifest({
      url: themeManifestUrl.value,
      githubProxy: proxyParams.githubProxy,
      githubProxyPrefix: proxyParams.githubProxyPrefix
    })
    const manifest = res.data || {}
    const themes = manifest.themes || []
    onlineThemes.value = themes.map((t: any) => ({
      name: t.name || t.themeId || '',
      code: t.themeId || '',
      imported: themeList.value.some(el => el.code === t.themeId)
    }))
  } catch (err: any) {
    console.error(err)
    alert(t('admin.uiText.themeFetchOnlineFailed'))
  } finally {
    fetchingOnlineThemeList.value = false
  }
}

async function importOnlineTheme(theme: any) {
  fetchingOnlineThemeList.value = true
  try {
    const proxyParams = getProxyParams(selectedThemeMirror.value, customThemeMirrorUrl.value)
    await adminApi.syncThemesManifest({
      url: themeManifestUrl.value,
      githubProxy: proxyParams.githubProxy,
      githubProxyPrefix: proxyParams.githubProxyPrefix,
      themes: [theme.code]
    })
    theme.imported = true
    // Reload themes list
    const themesRes = await adminApi.getThemes()
    const themesArray = Array.isArray(themesRes.data)
      ? themesRes.data
      : (themesRes.data?.themes || [])
    themeList.value = themesArray.map((t: any) => ({
      webEnabled: !!t.webEnabled,
      gameEnabled: !!t.gameEnabled,
      code: t.code || '',
      name: t.name || ''
    }))
    initialThemeList = JSON.parse(JSON.stringify(themeList.value))
    initialSettingsSnapshot.value = getCurrentSettingsSnapshot()
  } catch (err: any) {
    console.error(err)
    alert(t('admin.uiText.themeImportOnlineFailed'))
  } finally {
    fetchingOnlineThemeList.value = false
  }
}

async function saveAllSettings() {
  console.log('[saveAllSettings] Starting settings save procedure...');
  saving.value = true
  try {
    const tasks: { name: string; run: () => Promise<any> }[] = []

    // 1. Economy Settings
    if (isModuleDirty('economy')) {
      tasks.push({
        name: 'exchange',
        run: () => adminApi.saveExchangeSettings({
          shopToGameEnabled: economySettings.value.webToGameEnabled,
          shopToGameRatio: Number(economySettings.value.webToGameRate),
          gameToShopEnabled: economySettings.value.gameToWebEnabled,
          gameToShopRatio: Number(economySettings.value.gameToWebRate)
        })
      })

      tasks.push({
        name: 'marketEconomy',
        run: () => adminApi.saveMarketEconomySettings({
          tradeFeePercent: economySettings.value.marketFeeEnabled ? Number(economySettings.value.marketFeePercent) : 0,
          tradeTaxPercent: economySettings.value.marketTaxEnabled ? Number(economySettings.value.marketTaxPercent) : 0,
          inflationMode: economySettings.value.treasuryEnabled ? 'TREASURY' : 'BURN',
          inflationTreasuryUserId: Number(economySettings.value.treasuryAccountId || 0)
        })
      })

      tasks.push({
        name: 'currencyDisplay',
        run: () => adminApi.saveCurrencyDisplaySettings({
          shopCoinName: economySettings.value.webCoinName,
          shopCoinShort: economySettings.value.webCoinSymbol,
          gameCoinName: economySettings.value.gameCoinName,
          gameCoinShort: economySettings.value.gameCoinSymbol
        })
      })
    }

    // 2. Product Settings
    if (isModuleDirty('products')) {
      const tagsPayload = {
        config: {
          tags: productSettings.value.tags.map((t: any) => ({
            code: t.name,
            displayName: t.name,
            enabled: t.visible !== false,
            priority: Number(t.priority ?? 10),
            materialIn: t.materialWhitelist ? t.materialWhitelist.split(',').map((x: string) => x.trim()).filter(Boolean) : [],
            nbtHasAny: t.nbtKeywords ? t.nbtKeywords.split(',').map((x: string) => x.trim()).filter(Boolean) : []
          }))
        }
      }
      tasks.push({
        name: 'marketTags',
        run: () => adminApi.saveMarketTagsConfig(tagsPayload)
      })

      const currentOverrides = productSettings.value.materialOverrides
      const initialOverrides = initialMaterialOverrides

      // Deletes
      const deletes = initialOverrides.filter(init => !currentOverrides.some(curr => curr.id === init.id))
      for (const del of deletes) {
        if (del.id) {
          tasks.push({
            name: `deleteOverride_${del.id}`,
            run: () => adminApi.deleteMaterialOverride({ materialKey: del.id })
          })
        }
      }

      // Upserts
      for (const curr of currentOverrides) {
        if (!curr.id) continue
        const init = initialOverrides.find(i => i.id === curr.id)
        const hasChanged = !init || init.customName !== curr.customName || init.iconUrl !== curr.iconUrl || init.enabled !== curr.enabled
        if (hasChanged) {
          tasks.push({
            name: `upsertOverride_${curr.id}`,
            run: () => adminApi.upsertMaterialOverride({
              materialKey: curr.id,
              displayNameOverride: curr.customName,
              iconPath: curr.iconUrl,
              enabled: curr.enabled !== false
            })
          })
        }
      }
    }

    // 3. Permission Settings
    if (isModuleDirty('permissions')) {
      const limitPayload = {
        config: {
          ...originalLimitationConfig.value,
          rules: permissionSettings.value.listingLimits.map((r: any) => ({
            id: r.id,
            enabled: r.enabled !== false,
            priority: Number(r.priority ?? 10),
            actionType: r.actionType,
            rejectErrorCode: r.rejectErrorCode,
            triggerDirection: r.triggerDirection,
            triggerMaterial: r.triggerMaterial ? r.triggerMaterial.split(',').map((x: string) => x.trim()).filter(Boolean) : [],
            triggerNbt: r.triggerNbt ? r.triggerNbt.split(',').map((x: string) => x.trim()).filter(Boolean) : [],
            missingPermission: r.missingPermission,
            directionWhitelist: r.directionWhitelist ? r.directionWhitelist.split(',').map((x: string) => x.trim()).filter(Boolean) : [],
            tradeModeWhitelist: r.tradeModeWhitelist ? r.tradeModeWhitelist.split(',').map((x: string) => x.trim()).filter(Boolean) : [],
            currencyWhitelist: r.currencyWhitelist ? r.currencyWhitelist.split(',').map((x: string) => x.trim()).filter(Boolean) : [],
            tagWhitelist: r.tagWhitelist ? r.tagWhitelist.split(',').map((x: string) => x.trim()).filter(Boolean) : [],
            enforcedTag: r.enforcedTag,
            costEnabled: !!r.costEnabled,
            costCurrency: r.costCurrency,
            costAmount: Number(r.costAmount ?? 0)
          }))
        }
      }
      tasks.push({
        name: 'marketLimitation',
        run: () => adminApi.saveMarketLimitationConfig(limitPayload)
      })

      tasks.push({
        name: 'visualSettings',
        run: () => adminApi.saveVisualSettings({
          globalCustomIconEnabled: permissionSettings.value.customPermissions.globalCustomIconEnabled,
          globalCustomNameEnabled: permissionSettings.value.customPermissions.globalCustomNameEnabled,
          officialProductCustomIconEnabled: permissionSettings.value.customPermissions.officialAllowCustomIcon,
          officialProductCustomNameEnabled: permissionSettings.value.customPermissions.officialAllowCustomName,
          officialProductUploadImageEnabled: permissionSettings.value.customPermissions.officialAllowUploadImage,
          marketListingCustomIconEnabled: permissionSettings.value.customPermissions.playerAllowCustomIcon,
          marketListingCustomNameEnabled: permissionSettings.value.customPermissions.playerAllowCustomName,
          marketListingUploadImageEnabled: permissionSettings.value.customPermissions.playerAllowUploadImage,
          iconPolicyMode: permissionSettings.value.customPermissions.iconPolicy,
          namePolicyMode: permissionSettings.value.customPermissions.namePolicy
        })
      })

      tasks.push({
        name: 'marketRuntime',
        run: () => adminApi.saveMarketRuntimeSettings({
          marketMaxActiveListings: Number(permissionSettings.value.marketParams.defaultMaxListings),
          autoRefreshThreshold: Number(permissionSettings.value.marketParams.autoRestockThreshold),
          defaultTransferBatchSize: Number(permissionSettings.value.marketParams.defaultSingleExtraction),
          maxTransferBatchSize: Number(permissionSettings.value.marketParams.maxSingleExtraction),
          defaultTransitStock: Number(permissionSettings.value.marketParams.defaultTransitStock),
          maxTransitStock: Number(permissionSettings.value.marketParams.maxTransitStock)
        })
      })
    }

    // 4. Frontend Settings
    if (isModuleDirty('frontend')) {
      tasks.push({
        name: 'leaderboard',
        run: () => adminApi.saveLeaderboardSettings({
          enabled: frontendSettings.value.leaderboard.enabled,
          showOnlineStatus: frontendSettings.value.leaderboard.showOnlineStatus,
          defaultMetric: frontendSettings.value.leaderboard.defaultDimension.toUpperCase(),
          defaultOrder: frontendSettings.value.leaderboard.defaultSortDirection.toUpperCase()
        })
      })

      tasks.push({
        name: 'webshopRuntime',
        run: () => adminApi.saveWebshopRuntimeSettings({
          ...originalWebshopRuntime.value,
          defaultLocale: frontendSettings.value.siteParams.defaultLanguage,
          timeZone: frontendSettings.value.siteParams.timezone,
          sessionExpireHours: Number(frontendSettings.value.siteParams.sessionExpiryHours),
          bindRequestExpireMinutes: Number(frontendSettings.value.siteParams.bindingRequestExpiryMinutes),
          accessTokenLength: Number(frontendSettings.value.siteParams.accessTokenLength),
          defaultTransitStock: Number(frontendSettings.value.siteParams.sessionExpiryHours),
          deliveryBatchSize: Number(frontendSettings.value.siteParams.deliveryBatchSize),
          deliveryRetrySeconds: Number(frontendSettings.value.siteParams.deliveryRetryIntervalSeconds),
          orderCooldownSeconds: Number(frontendSettings.value.siteParams.orderCooldownSeconds),
          allowSharedClaimCommand: frontendSettings.value.siteParams.allowSubstituteCommand,
          refundUndeliveredEnabled: frontendSettings.value.siteParams.allowRefundUnshipped
        })
      })

      tasks.push({
        name: 'broadcast',
        run: () => adminApi.saveBroadcastSettings({
          enabled: frontendSettings.value.broadcast.enabled,
          listingCreatedTemplate: frontendSettings.value.broadcast.listTemplate,
          tradeSuccessTemplate: frontendSettings.value.broadcast.dealTemplate,
          auctionBidTemplate: frontendSettings.value.broadcast.bidTemplate,
          auctionSealedBidTemplate: frontendSettings.value.broadcast.sealedBidTemplate
        })
      })

      if (frontendSettings.value.siteParams.defaultLanguage && frontendSettings.value.siteParams.defaultLanguage !== originalWebshopRuntime.value.defaultLocale) {
        tasks.push({
          name: 'setDefaultLocale',
          run: () => adminApi.setDefaultLocale({ defaultLocale: frontendSettings.value.siteParams.defaultLanguage })
        })
      }

      const currentLangs = languageList.value
      const initialLangs = initialLanguageList

      // Deletes
      const langDeletes = initialLangs.filter(init => !currentLangs.some(curr => curr.code === init.code))
      for (const del of langDeletes) {
        if (del.code) {
          tasks.push({
            name: `deleteLang_${del.code}`,
            run: () => adminApi.localeAction({ locale: del.code, action: 'remove' })
          })
        }
      }

      // Toggles
      for (const curr of currentLangs) {
        const init = initialLangs.find(i => i.code === curr.code)
        if (init) {
          if (!!init.webEnabled !== !!curr.webEnabled) {
            tasks.push({
              name: `toggleWebLang_${curr.code}`,
              run: () => adminApi.localeAction({ locale: curr.code, action: 'toggleWeb' })
            })
          }
          if (!!init.gameEnabled !== !!curr.gameEnabled) {
            tasks.push({
              name: `toggleGameLang_${curr.code}`,
              run: () => adminApi.localeAction({ locale: curr.code, action: 'toggleGame' })
            })
          }
        }
      }

      const currentThemesList = themeList.value
      const initialThemes = initialThemeList

      // Deletes
      const themeDeletes = initialThemes.filter(init => !currentThemesList.some(curr => curr.code === init.code))
      for (const del of themeDeletes) {
        if (del.code) {
          tasks.push({
            name: `deleteTheme_${del.code}`,
            run: () => adminApi.themeAction({ themeId: del.code, action: 'remove' })
          })
        }
      }

      // Toggles
      for (const curr of currentThemesList) {
        const init = initialThemes.find(i => i.code === curr.code)
        if (init) {
          if (!!init.webEnabled !== !!curr.webEnabled) {
            tasks.push({
              name: `toggleWebTheme_${curr.code}`,
              run: () => adminApi.themeAction({ themeId: curr.code, action: 'toggleWeb' })
            })
          }
        }
      }
    }

    // 5. Other Settings
    if (isModuleDirty('other')) {
      tasks.push({
        name: 'maintenance',
        run: () => adminApi.saveMaintenanceSettings({
          cleanupIntervalMinutes: Number(otherSettings.value.maintenance.cleanupIntervalMinutes),
          pendingBindRetentionHours: Number(otherSettings.value.maintenance.pendingBindExpiryHours),
          pendingPasswordRetentionHours: Number(otherSettings.value.maintenance.pendingPasswordExpiryHours),
          bindRequestRetentionHours: Number(otherSettings.value.maintenance.bindRequestExpiryHours),
          redeemCodeRetentionDays: Number(otherSettings.value.maintenance.redeemCodeExpiryDays)
        })
      })

      tasks.push({
        name: 'logging',
        run: () => adminApi.saveLoggingSettings({
          enabled: otherSettings.value.logging.fileLogEnabled,
          level: otherSettings.value.logging.logLevel.toUpperCase(),
          directory: otherSettings.value.logging.logDirectory,
          maxFileSizeMb: Number(otherSettings.value.logging.maxFileSizeMB),
          maxFiles: Number(otherSettings.value.logging.maxBackupFiles),
          retentionDays: Number(otherSettings.value.logging.retentionDays)
        })
      })
    }

    console.log('[saveAllSettings] Registered dirty tasks to execute:', tasks.map(t => t.name));
    
    if (tasks.length > 0) {
      let executedCount = 0;
      for (const task of tasks) {
        try {
          console.log(`[saveAllSettings] Executing save task (${++executedCount}/${tasks.length}): ${task.name}...`);
          await task.run()
          console.log(`[saveAllSettings] Task completed successfully: ${task.name}`);
          await new Promise(resolve => setTimeout(resolve, 80))
        } catch (taskErr) {
          console.error(`[saveAllSettings] Failed to execute save task: ${task.name}`, taskErr)
          throw taskErr
        }
      }
      console.log('[saveAllSettings] All settings save tasks executed successfully!');
    } else {
      console.log('[saveAllSettings] No changes detected in any modules. Skipping save requests.');
    }

    snackbar.value = true
    console.log('[saveAllSettings] Reloading settings from database to synchronize baseline...');
    await loadAllSettings()
    console.log('[saveAllSettings] Synchronized baseline settings successfully!');
  } catch (err: any) {
    console.error(err)
    alert(t('admin.uiText.saveSettingsFailed') + (err.response?.data?.message || err.message || '未知错误'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(var(--v-theme-surface), 0.8) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-secondary), 0.08) !important;
}

.bg-light-soft {
  background-color: rgba(var(--v-theme-secondary), 0.02) !important;
}

.border-r {
  border-right: 1px solid rgba(var(--v-theme-secondary), 0.08) !important;
}

.border-dashed {
  border: 2px dashed rgba(var(--v-theme-secondary), 0.15) !important;
}

.fab-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 99;
}

.hover-scale {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-scale:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.25) !important;
}

/* table-demo 表格增强设计风格 */
.bg-table-header {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}

.hover-bg-row {
  transition: all 0.2s ease;
}

.hover-bg-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.02) !important;
}

@keyframes fab-pulse {
  0%, 100% { box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.3); }
  50% { box-shadow: 0 8px 28px rgba(var(--v-theme-primary), 0.55); }
}

.fab-pulse {
  animation: fab-pulse 2s ease-in-out infinite;
}

.unsaved-banner-container {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 650px;
  z-index: 100;
}

.unsaved-banner {
  background: rgba(var(--v-theme-surface), 0.9) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(var(--v-theme-warning), 0.3) !important;
}

.pulse-icon {
  animation: warning-pulse 2.5s infinite;
}

@keyframes warning-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.93); }
}
</style>
