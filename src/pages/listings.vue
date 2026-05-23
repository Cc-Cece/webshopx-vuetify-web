<template>
  <v-container fluid class="pa-6" style="max-width: 1400px; min-height: 100vh;">
    <!-- Main Switcher Block -->
    <v-card v-if="!isLoggedIn" elevation="0" variant="outlined" class="rounded-xl pa-8 text-center glass-card">
      <v-avatar color="warning-lighten-5" class="mb-4" size="72">
        <v-icon color="warning" size="40">mdi-lock-outline</v-icon>
      </v-avatar>
      <h3 class="text-h6 font-weight-bold mb-2">{{ $t('app.uiText.templates.p0299') }}</h3>
      <p class="text-body-2 text-medium-emphasis mb-6">您需要先登录您的 Minecraft 账户才能管理您在市场与拍卖行中的上架项目。</p>
      <v-btn color="primary" prepend-icon="mdi-account" class="font-weight-bold text-none" rounded="lg" size="large" href="/account">
        立即去登录
      </v-btn>
    </v-card>

    <div v-else>
      <!-- Sub-tabs Select Header Card -->
      <div class="d-flex mb-6">
        <v-tabs v-model="activeSubTab" color="primary" align-tabs="start" density="comfortable" class="rounded-lg bg-grey-lighten-4 pa-1">
          <v-tab value="direct" prepend-icon="mdi-tag-text-outline" class="rounded-lg font-weight-bold text-none">
            {{ $t('app.uiText.marketSection.direct.mineBtn') || '我的上架' }}
          </v-tab>
          <v-tab value="auction" prepend-icon="mdi-gavel" class="rounded-lg font-weight-bold text-none">
            {{ $t('app.uiText.marketSection.auction.mineBtn') || '我的拍卖' }}
          </v-tab>
        </v-tabs>
      </div>

      <v-window v-model="activeSubTab">
        <!-- 1. Direct C2C Listings Tab -->
        <v-window-item value="direct">
          <!-- 顶部标题与简报 -->
          <v-row class="mb-4" align="center">
            <v-col cols="12" sm="8">
              <div class="text-h5 font-weight-bold text-slate-800">
                我的直购商品管理
              </div>
              <div class="text-subtitle-2 text-medium-emphasis mt-1">
                管理您在市场大厅上架的所有个人交易项目。包含多维过滤、行内展开详情、快捷置顶与一键下线。
              </div>
            </v-col>
            <v-col cols="12" sm="4" class="text-sm-right d-flex align-center justify-sm-end">
              <v-btn
                prepend-icon="mdi-storefront-outline"
                variant="outlined"
                class="mr-2 rounded-lg text-none font-weight-bold"
                href="/market"
              >
                前往市场大厅
              </v-btn>
              <v-btn
                prepend-icon="mdi-refresh"
                color="primary"
                variant="tonal"
                class="rounded-lg font-weight-bold"
                :loading="myListingsLoading"
                @click="handleLoadMyListings"
              >
                刷新列表
              </v-btn>
            </v-col>
          </v-row>

          <!-- 过滤器与搜索栏卡片 -->
          <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 mb-6 glass-card">
            <v-row align="center">
              <!-- 模糊搜索 -->
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="searchQueryDirect"
                  label="搜索商品名称、ID或交易备注..."
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  hide-details
                  variant="outlined"
                  density="comfortable"
                  class="rounded-lg"
                ></v-text-field>
              </v-col>

              <!-- 交易方向过滤 -->
              <v-col cols="12" md="4" class="d-flex align-center">
                <span class="text-subtitle-2 font-weight-bold text-slate-800 mr-3">交易方向:</span>
                <v-chip-group
                  v-model="selectedSideFilter"
                  mandatory
                  selected-class="text-primary font-weight-bold"
                >
                  <border-chip value="ALL" class="px-3">全部</border-chip>
                  <border-chip value="SELL" class="px-3" color="success">出售单</border-chip>
                  <border-chip value="BUY" class="px-3" color="warning">求购单</border-chip>
                </v-chip-group>
              </v-col>

              <!-- 在售状态过滤 -->
              <v-col cols="12" md="4" class="d-flex align-center">
                <span class="text-subtitle-2 font-weight-bold text-slate-800 mr-3">挂单状态:</span>
                <v-chip-group
                  v-model="selectedActiveFilter"
                  mandatory
                  selected-class="text-primary font-weight-bold"
                >
                  <border-chip value="ALL" class="px-3">全部</border-chip>
                  <border-chip value="ACTIVE" class="px-3" color="success">上架中</border-chip>
                  <border-chip value="PAUSED" class="px-3" color="grey">已暂停</border-chip>
                </v-chip-group>
              </v-col>
            </v-row>
          </v-card>

          <!-- 数据表格卡片 -->
          <v-card elevation="0" variant="outlined" class="rounded-xl glass-card overflow-hidden mb-6">
            <v-table class="bg-transparent text-slate-800">
              <thead>
                <tr class="bg-table-header">
                  <th class="width-50"></th> <!-- 展开把手 -->
                  <th class="font-weight-bold text-subtitle-2">交易单ID</th>
                  <th class="font-weight-bold text-subtitle-2">挂单商品</th>
                  <th class="font-weight-bold text-subtitle-2 text-center">交易方向</th>
                  <th class="font-weight-bold text-subtitle-2 text-right">剩余供货数</th>
                  <th class="font-weight-bold text-subtitle-2 text-right">交易单价</th>
                  <th class="font-weight-bold text-subtitle-2 text-center">当前状态</th>
                  <th class="font-weight-bold text-subtitle-2 text-center">快捷管理</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="item in filteredDirectListings" :key="item.id">
                  <tr class="hover-bg-row align-center" :class="{ 'row-active': isDirectRowExpanded(item.id) }">
                    <td>
                      <v-btn
                        variant="text"
                        icon
                        density="comfortable"
                        :color="isDirectRowExpanded(item.id) ? 'primary' : 'secondary'"
                        @click="toggleDirectRow(item.id)"
                      >
                        <v-icon>{{ isDirectRowExpanded(item.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                      </v-btn>
                    </td>
                    <td>
                      <border-chip size="x-small" class="font-mono font-weight-bold text-primary px-2">
                        #{{ item.id }}
                      </border-chip>
                    </td>
                    <td>
                      <div class="d-flex align-center py-2">
                        <div class="mc-icon-shell mc-icon-shell-sm mr-3 border rounded bg-white pa-1">
                          <McIcon
                            :material="resolveListingIconMaterial(item)"
                            :icon-url="resolveDisplayIconUrl(item)"
                            size="30"
                            color="primary"
                          />
                        </div>
                        <div>
                          <div class="font-weight-bold text-body-2 text-truncate" style="max-width: 220px;">
                            {{ resolveItemName(item) }}
                          </div>
                          <div class="text-caption text-mono text-medium-emphasis">
                            {{ resolveRawMaterialLabel(item) }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      <v-chip
                        :color="item.side === 'SELL' ? 'success' : 'warning'"
                        size="small"
                        variant="flat"
                        class="font-weight-bold px-3"
                      >
                        {{ item.side === 'SELL' ? '出售' : '求购' }}
                      </v-chip>
                    </td>
                    <td class="text-right font-weight-bold">
                      {{ item.stock }} <span class="text-caption text-medium-emphasis">件</span>
                    </td>
                    <td class="text-right font-weight-black text-primary">
                      {{ item.price }}
                      <span class="text-caption font-weight-bold text-medium-emphasis">
                        {{ item.currency === 'SHOP_COIN' ? shopCoinShort : gameCoinShort }}
                      </span>
                    </td>
                    <td class="text-center">
                      <v-chip
                        :color="item.active ? 'success' : 'grey'"
                        size="small"
                        variant="tonal"
                        class="font-weight-bold px-3"
                      >
                        {{ item.active ? '上架中' : '已暂停' }}
                      </v-chip>
                    </td>
                    <td class="text-center">
                      <div class="d-flex justify-center align-center">
                        <!-- 修改价格与备注 -->
                        <v-btn
                          variant="text"
                          icon="mdi-pencil-outline"
                          color="primary"
                          density="comfortable"
                          class="mr-1"
                          @click.stop="openEditSettingsDialog(item)"
                        >
                          <v-icon>mdi-pencil-outline</v-icon>
                          <v-tooltip activator="parent" location="top">修改单价与备注</v-tooltip>
                        </v-btn>
                        <!-- 暂停/挂起切换 -->
                        <v-btn
                          variant="text"
                          :icon="item.active ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline'"
                          :color="item.active ? 'warning' : 'success'"
                          density="comfortable"
                          class="mr-1"
                          @click.stop="toggleListingActive(item)"
                        >
                          <v-icon>{{ item.active ? 'mdi-pause-circle-outline' : 'mdi-play-circle-outline' }}</v-icon>
                          <v-tooltip activator="parent" location="top">{{ item.active ? '暂停交易' : '恢复交易' }}</v-tooltip>
                        </v-btn>
                        <!-- 供货置顶刷新 -->
                        <v-btn
                          variant="text"
                          icon="mdi-sparkles"
                          color="secondary"
                          density="comfortable"
                          class="mr-1"
                          @click.stop="refreshListingSupply(item)"
                        >
                          <v-icon>mdi-sparkles</v-icon>
                          <v-tooltip activator="parent" location="top">擦亮置顶供货</v-tooltip>
                        </v-btn>
                        <!-- 下架商品 -->
                        <v-btn
                          variant="text"
                          icon="mdi-trash-can-outline"
                          color="error"
                          density="comfortable"
                          @click.stop="confirmUnlistListing(item)"
                        >
                          <v-icon>mdi-trash-can-outline</v-icon>
                          <v-tooltip activator="parent" location="top">下架撤回商品</v-tooltip>
                        </v-btn>
                      </div>
                    </td>
                  </tr>

                  <!-- 展开行详情 -->
                  <tr v-if="isDirectRowExpanded(item.id)" class="expanded-row-bg">
                    <td colspan="8" class="pa-5">
                      <v-card variant="flat" class="bg-white-pure rounded-xl pa-4 border">
                        <v-row>
                          <!-- 道具 Minecraft 详细元数据属性 -->
                          <v-col cols="12" md="6" class="border-r-md">
                            <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                              <v-icon color="primary" class="mr-2" size="18">mdi-minecraft</v-icon>
                              材质与 NBT 信息
                            </div>

                            <v-list class="bg-transparent pa-0 dense-list">
                              <!-- Enchantments Chips -->
                              <div v-if="getEnchantmentsList(item).length > 0" class="mb-3">
                                <span class="text-caption font-weight-bold text-medium-emphasis mr-2 d-block mb-1">附魔效果：</span>
                                <div class="d-flex flex-wrap ga-1">
                                  <v-chip
                                    v-for="ench in getEnchantmentsList(item)"
                                    :key="ench.name"
                                    color="secondary"
                                    size="x-small"
                                    variant="flat"
                                    class="font-weight-bold px-2"
                                  >
                                    {{ ench.name }} LV.{{ ench.level }}
                                  </v-chip>
                                </div>
                              </div>

                              <!-- Minecraft Lore Text -->
                              <div v-if="getLoreLines(item).length > 0" class="mb-3 lore-box pa-3 rounded bg-grey-lighten-4 border">
                                <span class="text-caption font-weight-bold text-medium-emphasis d-block mb-1">道具描述 (Lore)：</span>
                                <div
                                  v-for="(line, idx) in getLoreLines(item)"
                                  :key="idx"
                                  class="text-body-2 font-weight-bold text-indigo-darken-3 mb-1"
                                >
                                  {{ line }}
                                </div>
                              </div>

                              <!-- NBT raw collapse -->
                              <div>
                                <v-expansion-panels variant="accordion" class="border rounded">
                                  <v-expansion-panel elevation="0">
                                    <v-expansion-panel-title class="py-1 px-3 text-caption font-weight-bold">
                                      查看原始 NBT 数据 (JSON)
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text class="pa-0">
                                      <pre class="text-mono text-caption text-slate-800 bg-grey-lighten-4 pa-2 rounded overflow-x-auto" style="max-height: 200px;">{{ parseNbtMeta(item) }}</pre>
                                    </v-expansion-panel-text>
                                  </v-expansion-panel>
                                </v-expansion-panels>
                              </div>
                            </v-list>
                          </v-col>

                          <!-- 挂单交易说明与配置明细 -->
                          <v-col cols="12" md="6" class="pl-md-6">
                            <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                              <v-icon color="secondary" class="mr-2" size="18">mdi-text-box-outline</v-icon>
                              挂单交易备注与明细
                            </div>
                            
                            <div class="mb-3 pa-3 rounded bg-grey-lighten-4 border">
                              <span class="text-caption font-weight-bold text-medium-emphasis d-block mb-1">卖家留言备注：</span>
                              <div class="text-body-2 text-slate-800 font-italic">
                                “ {{ item.remark || '该卖家极其高冷，没有留下任何交易备注说明噢。' }} ”
                              </div>
                            </div>

                            <v-row dense class="text-caption">
                              <v-col cols="6" class="mb-1 text-medium-emphasis">创建日期：</v-col>
                              <v-col cols="6" class="mb-1 text-slate-800 font-weight-bold text-right">{{ item.createdAt }}</v-col>

                              <v-col cols="6" class="mb-1 text-medium-emphasis">最后更新 / 擦亮时间：</v-col>
                              <v-col cols="6" class="mb-1 text-slate-800 font-weight-bold text-right">{{ item.updatedAt || item.createdAt }}</v-col>

                              <v-col cols="6" class="mb-1 text-medium-emphasis">交易结算资产：</v-col>
                              <v-col cols="6" class="mb-1 text-primary font-weight-black text-right">
                                {{ item.currency === 'SHOP_COIN' ? shopCoinName : gameCoinName }}
                              </v-col>
                            </v-row>
                          </v-col>
                        </v-row>
                      </v-card>
                    </td>
                  </tr>
                </template>

                <tr v-if="filteredDirectListings.length === 0">
                  <td colspan="8" class="text-center py-10">
                    <v-icon size="48" class="text-medium-emphasis mb-2">mdi-database-minus</v-icon>
                    <div class="text-subtitle-1 font-weight-bold text-medium-emphasis">暂无符合过滤条件的挂单数据</div>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <!-- 简易分页与条数汇总栏 -->
            <v-divider></v-divider>
            <div class="pa-4 d-flex align-center justify-space-between flex-wrap text-caption text-medium-emphasis">
              <span>
                当前过滤显示 {{ filteredDirectListings.length }} 条挂单，账户直购挂单共计 {{ myDirectListings.length }} 条记录
              </span>
              <div class="d-flex align-center">
                <v-btn disabled variant="text" icon="mdi-chevron-left" density="comfortable" class="mr-2"></v-btn>
                <primary-btn class="rounded font-weight-bold min-width-32 mr-2">1</primary-btn>
                <v-btn disabled variant="text" icon="mdi-chevron-right" density="comfortable"></v-btn>
              </div>
            </div>
          </v-card>
        </v-window-item>

        <!-- 2. C2C Auctions & Bids Tab -->
        <v-window-item value="auction">
          <!-- 顶部标题与简报 -->
          <v-row class="mb-4" align="center">
            <v-col cols="12" sm="8">
              <div class="text-h5 font-weight-bold text-slate-800">
                我的公开拍卖与竞拍监控
              </div>
              <div class="text-subtitle-2 text-medium-emphasis mt-1">
                实时追踪与管理我发布的拍卖品状态，或高亮监控我已参与出价处于领先中的稀世珍宝。
              </div>
            </v-col>
            <v-col cols="12" sm="4" class="text-sm-right d-flex align-center justify-sm-end">
              <v-btn
                prepend-icon="mdi-gavel"
                variant="outlined"
                class="mr-2 rounded-lg text-none font-weight-bold"
                href="/auction"
              >
                去拍卖大厅
              </v-btn>
              <v-btn
                prepend-icon="mdi-refresh"
                color="secondary"
                variant="tonal"
                class="rounded-lg font-weight-bold"
                :loading="myAuctionsLoading"
                @click="handleLoadAuctions"
              >
                刷新竞拍
              </v-btn>
            </v-col>
          </v-row>

          <!-- 过滤器与搜索栏卡片 -->
          <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 mb-6 glass-card">
            <v-row align="center">
              <!-- 模糊搜索 -->
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQueryAuction"
                  label="搜索拍卖品名称、ID或卖家玩家..."
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  hide-details
                  variant="outlined"
                  density="comfortable"
                  class="rounded-lg"
                ></v-text-field>
              </v-col>

              <!-- 算法类型过滤 -->
              <v-col cols="12" md="6" class="d-flex align-center">
                <span class="text-subtitle-2 font-weight-bold text-slate-800 mr-3">拍卖算法:</span>
                <v-chip-group
                  v-model="selectedAlgoFilter"
                  mandatory
                  selected-class="text-primary font-weight-bold"
                >
                  <border-chip value="ALL" class="px-3">全部</border-chip>
                  <border-chip value="ENGLISH_AUCTION_V1" color="primary" class="px-3">英式拍卖</border-chip>
                  <border-chip value="DUTCH_AUCTION_V1" color="success" class="px-3">荷兰式</border-chip>
                  <border-chip value="VICKREY_AUCTION_V1" color="warning" class="px-3">密封式</border-chip>
                </v-chip-group>
              </v-col>
            </v-row>
          </v-card>

          <!-- 堆叠表 1: 我发起的拍卖 (My Created Auctions) -->
          <v-card elevation="0" variant="outlined" class="rounded-xl glass-card overflow-hidden mb-6">
            <div class="px-5 py-4 border-b bg-table-header d-flex align-center">
              <v-avatar color="primary-lighten-5" class="mr-3" size="36">
                <v-icon color="primary">mdi-storefront-outline</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold text-slate-800">我发起的拍卖品 (发售中)</h3>
                <span class="text-caption text-medium-emphasis">由您本人发起的全服公开拍卖，可在行内详情查看算法参数并在此快速下架撤回。</span>
              </div>
            </div>

            <v-table class="bg-transparent text-slate-800">
              <thead>
                <tr>
                  <th class="width-50"></th>
                  <th class="font-weight-bold text-subtitle-2">拍卖ID</th>
                  <th class="font-weight-bold text-subtitle-2">商品信息</th>
                  <th class="font-weight-bold text-subtitle-2 text-center">拍卖算法</th>
                  <th class="font-weight-bold text-subtitle-2 text-center">剩余倒计时</th>
                  <th class="font-weight-bold text-subtitle-2 text-right">起拍价</th>
                  <th class="font-weight-bold text-subtitle-2 text-right">最高出价</th>
                  <th class="font-weight-bold text-subtitle-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="listing in filteredAuctionsCreated" :key="listing.id">
                  <tr class="hover-bg-row align-center" :class="{ 'row-active': isAuctionCreatedRowExpanded(listing.id) }">
                    <td>
                      <v-btn
                        variant="text"
                        icon
                        density="comfortable"
                        :color="isAuctionCreatedRowExpanded(listing.id) ? 'primary' : 'secondary'"
                        @click="toggleAuctionCreatedRow(listing.id)"
                      >
                        <v-icon>{{ isAuctionCreatedRowExpanded(listing.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                      </v-btn>
                    </td>
                    <td>
                      <border-chip size="x-small" class="font-mono font-weight-bold text-primary px-2">
                        #{{ listing.id }}
                      </border-chip>
                    </td>
                    <td>
                      <div class="d-flex align-center py-2">
                        <div class="mc-icon-shell mc-icon-shell-sm mr-3 border rounded bg-white pa-1">
                          <McIcon
                            :material="resolveListingIconMaterial(listing)"
                            :icon-url="resolveDisplayIconUrl(listing)"
                            size="30"
                            :color="getAlgorithmColor(listing.auctionAlgorithm)"
                          />
                        </div>
                        <div>
                          <div class="font-weight-bold text-body-2 text-truncate" style="max-width: 220px;">
                            {{ resolveItemName(listing) }}
                          </div>
                          <div class="text-caption text-mono text-medium-emphasis">
                            {{ resolveRawMaterialLabel(listing) }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      <v-chip
                        :color="getAlgorithmColor(listing.auctionAlgorithm)"
                        size="small"
                        variant="flat"
                        class="font-weight-bold"
                      >
                        {{ getAlgorithmLabel(listing.auctionAlgorithm) }}
                      </v-chip>
                    </td>
                    <td class="text-center font-weight-bold">
                      <v-chip
                        size="small"
                        color="error"
                        variant="tonal"
                        class="font-weight-bold"
                        v-if="!isAuctionExpired(listing)"
                      >
                        <v-icon start size="14">mdi-timer-outline</v-icon>
                        {{ getCountdownText(listing.auctionEndAt) }}
                      </v-chip>
                      <v-chip size="small" color="grey" variant="flat" class="font-weight-bold" v-else>
                        已结束
                      </v-chip>
                    </td>
                    <td class="text-right font-weight-bold text-slate-800">
                      {{ listing.auctionStartPrice || listing.price || 0 }}
                      <span class="text-caption text-medium-emphasis">
                        {{ listing.currency === 'SHOP_COIN' ? shopCoinShort : gameCoinShort }}
                      </span>
                    </td>
                    <td class="text-right font-weight-bold text-primary">
                      <span v-if="listing.auctionAlgorithm === 'VICKREY_AUCTION_V1'" class="text-medium-emphasis text-caption font-italic">
                        密封不可见
                      </span>
                      <span v-else>
                        {{ listing.auctionHighestBid > 0 ? listing.auctionHighestBid : '暂无出价' }}
                        <span v-if="listing.auctionHighestBid > 0" class="text-caption font-weight-bold text-medium-emphasis">
                          ({{ listing.auctionHighestBidder }})
                        </span>
                      </span>
                    </td>
                    <td class="text-center">
                      <v-btn
                        v-if="!listing.auctionHighestBid || listing.auctionHighestBid === 0"
                        color="error"
                        size="small"
                        variant="outlined"
                        rounded="lg"
                        class="font-weight-bold text-none px-3"
                        prepend-icon="mdi-trash-can-outline"
                        :loading="actionSubmitting"
                        @click.stop="handleCancelAuction(listing)"
                      >
                        撤销下架
                      </v-btn>
                      <v-chip
                        v-else
                        color="success"
                        size="small"
                        variant="tonal"
                        class="font-weight-bold px-3"
                      >
                        已锁定出价
                      </v-chip>
                    </td>
                  </tr>

                  <!-- 发起拍卖的展开行 -->
                  <tr v-if="isAuctionCreatedRowExpanded(listing.id)" class="expanded-row-bg">
                    <td colspan="8" class="pa-5">
                      <v-card variant="flat" class="bg-white-pure rounded-xl pa-4 border">
                        <v-row>
                          <v-col cols="12" md="6" class="border-r-md">
                            <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                              <v-icon color="primary" class="mr-2" size="18">mdi-gavel</v-icon>
                              拍卖算法参数配置
                            </div>
                            
                            <div v-if="listing.auctionAlgorithm === 'DUTCH_AUCTION_V1'" class="mb-3 pa-3 rounded bg-green-lighten-5 border-success">
                              <span class="text-caption font-weight-bold text-success d-block mb-1">荷兰式拍卖（减价）：</span>
                              <div class="text-body-2 font-weight-black text-slate-800">
                                当前买断一口价：<span class="text-success text-h6 font-weight-black">{{ getDutchCurrentPrice(listing) }}</span>
                                {{ listing.currency === 'SHOP_COIN' ? shopCoinShort : gameCoinShort }}
                              </div>
                            </div>

                            <v-row dense class="text-caption">
                              <v-col cols="6" class="mb-1 text-medium-emphasis">起拍时间：</v-col>
                              <v-col cols="6" class="mb-1 text-slate-800 font-weight-bold text-right">{{ listing.auctionStartAt || listing.createdAt }}</v-col>

                              <v-col cols="6" class="mb-1 text-medium-emphasis">结束结算时间：</v-col>
                              <v-col cols="6" class="mb-1 text-slate-800 font-weight-bold text-right">{{ listing.auctionEndAt }}</v-col>

                              <v-col cols="6" class="mb-1 text-medium-emphasis">起拍底价：</v-col>
                              <v-col cols="6" class="mb-1 text-slate-800 font-weight-bold text-right">
                                {{ listing.auctionStartPrice || listing.price || 0 }} {{ listing.currency === 'SHOP_COIN' ? shopCoinShort : gameCoinShort }}
                              </v-col>
                            </v-row>

                            <!-- Lore list and enchantments inside auction created -->
                            <div v-if="getEnchantmentsList(listing).length > 0" class="mt-3">
                              <span class="text-caption font-weight-bold text-medium-emphasis mr-2 d-block mb-1">附魔效果：</span>
                              <div class="d-flex flex-wrap ga-1">
                                <v-chip
                                  v-for="ench in getEnchantmentsList(listing)"
                                  :key="ench.name"
                                  color="secondary"
                                  size="x-small"
                                  variant="flat"
                                  class="font-weight-bold px-2"
                                >
                                  {{ ench.name }} LV.{{ ench.level }}
                                </v-chip>
                              </div>
                            </div>

                            <div v-if="getLoreLines(listing).length > 0" class="mt-3 lore-box pa-3 rounded bg-grey-lighten-4 border">
                              <span class="text-caption font-weight-bold text-medium-emphasis d-block mb-1">属性说明 (Lore)：</span>
                              <div
                                v-for="(line, idx) in getLoreLines(listing)"
                                :key="idx"
                                class="text-body-2 font-weight-bold text-indigo-darken-3 mb-1"
                              >
                                {{ line }}
                              </div>
                            </div>
                          </v-col>

                          <v-col cols="12" md="6" class="pl-md-6">
                            <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                              <v-icon color="secondary" class="mr-2" size="18">mdi-minecraft</v-icon>
                              物品元数据详情
                            </div>
                            <pre class="text-mono text-caption text-slate-800 bg-grey-lighten-4 pa-3 rounded overflow-x-auto" style="max-height: 200px;">{{ parseNbtMeta(listing) }}</pre>
                          </v-col>
                        </v-row>
                      </v-card>
                    </td>
                  </tr>
                </template>

                <tr v-if="filteredAuctionsCreated.length === 0">
                  <td colspan="8" class="text-center py-8">
                    <v-icon size="36" class="text-medium-emphasis mb-1">mdi-gavel</v-icon>
                    <div class="text-subtitle-2 font-weight-bold text-medium-emphasis">暂无发起的拍卖挂单</div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <!-- 堆叠表 2: 我领先的竞拍 (My Bids Leading) -->
          <v-card elevation="0" variant="outlined" class="rounded-xl glass-card overflow-hidden mb-6">
            <div class="px-5 py-4 border-b bg-table-header d-flex align-center">
              <v-avatar color="success-lighten-5" class="mr-3" size="36">
                <v-icon color="success">mdi-gavel</v-icon>
              </v-avatar>
              <div>
                <h3 class="text-subtitle-1 font-weight-bold text-slate-800">我领先的竞拍 (加价监控)</h3>
                <span class="text-caption text-medium-emphasis">当前最高出价权在您手中的全服拍卖品。快人一步，锁定至宝！</span>
              </div>
            </div>

            <v-table class="bg-transparent text-slate-800">
              <thead>
                <tr>
                  <th class="width-50"></th>
                  <th class="font-weight-bold text-subtitle-2">拍卖ID</th>
                  <th class="font-weight-bold text-subtitle-2">竞拍商品</th>
                  <th class="font-weight-bold text-subtitle-2">卖家</th>
                  <th class="font-weight-bold text-subtitle-2 text-center">倒计时</th>
                  <th class="font-weight-bold text-subtitle-2 text-right">当前我的出价</th>
                  <th class="font-weight-bold text-subtitle-2 text-center">当前状态</th>
                  <th class="font-weight-bold text-subtitle-2 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="listing in filteredAuctionsBidLeading" :key="listing.id">
                  <tr class="hover-bg-row align-center" :class="{ 'row-active': isAuctionBidLeadingRowExpanded(listing.id) }">
                    <td>
                      <v-btn
                        variant="text"
                        icon
                        density="comfortable"
                        :color="isAuctionBidLeadingRowExpanded(listing.id) ? 'primary' : 'secondary'"
                        @click="toggleAuctionBidLeadingRow(listing.id)"
                      >
                        <v-icon>{{ isAuctionBidLeadingRowExpanded(listing.id) ? 'mdi-chevron-down' : 'mdi-chevron-right' }}</v-icon>
                      </v-btn>
                    </td>
                    <td>
                      <border-chip size="x-small" class="font-mono font-weight-bold text-primary px-2">
                        #{{ listing.id }}
                      </border-chip>
                    </td>
                    <td>
                      <div class="d-flex align-center py-2">
                        <div class="mc-icon-shell mc-icon-shell-sm mr-3 border rounded bg-white pa-1">
                          <McIcon
                            :material="resolveListingIconMaterial(listing)"
                            :icon-url="resolveDisplayIconUrl(listing)"
                            size="30"
                            color="success"
                          />
                        </div>
                        <div>
                          <div class="font-weight-bold text-body-2 text-truncate" style="max-width: 220px;">
                            {{ resolveItemName(listing) }}
                          </div>
                          <div class="text-caption text-mono text-medium-emphasis">
                            {{ resolveRawMaterialLabel(listing) }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{{ listing.sellerName }}</td>
                    <td class="text-center font-weight-bold">
                      <v-chip
                        size="small"
                        color="error"
                        variant="tonal"
                        class="font-weight-bold"
                        v-if="!isAuctionExpired(listing)"
                      >
                        <v-icon start size="14">mdi-timer-outline</v-icon>
                        {{ getCountdownText(listing.auctionEndAt) }}
                      </v-chip>
                      <v-chip size="small" color="grey" variant="flat" class="font-weight-bold" v-else>
                        已结束
                      </v-chip>
                    </td>
                    <td class="text-right font-weight-bold text-success text-body-1">
                      {{ listing.auctionHighestBid }}
                      <span class="text-caption font-weight-bold text-medium-emphasis">
                        {{ listing.currency === 'SHOP_COIN' ? shopCoinShort : gameCoinShort }}
                      </span>
                    </td>
                    <td class="text-center">
                      <v-chip
                        color="success"
                        variant="flat"
                        size="small"
                        class="font-weight-bold px-3"
                        prepend-icon="mdi-trophy-outline"
                      >
                        领先中
                      </v-chip>
                    </td>
                    <td class="text-center">
                      <v-btn
                        color="primary"
                        size="small"
                        variant="flat"
                        rounded="lg"
                        class="font-weight-bold text-none px-3"
                        prepend-icon="mdi-gavel"
                        href="/auction"
                      >
                        追加出价
                      </v-btn>
                    </td>
                  </tr>

                  <!-- 领先竞拍的展开行 -->
                  <tr v-if="isAuctionBidLeadingRowExpanded(listing.id)" class="expanded-row-bg">
                    <td colspan="8" class="pa-5">
                      <v-card variant="flat" class="bg-white-pure rounded-xl pa-4 border">
                        <v-row>
                          <v-col cols="12" md="6" class="border-r-md">
                            <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                              <v-icon color="success" class="mr-2" size="18">mdi-minecraft</v-icon>
                              附魔与 Lore 细节
                            </div>

                            <div v-if="getEnchantmentsList(listing).length > 0" class="mb-3">
                              <span class="text-caption font-weight-bold text-medium-emphasis mr-2 d-block mb-1">附魔效果：</span>
                              <div class="d-flex flex-wrap ga-1">
                                <v-chip
                                  v-for="ench in getEnchantmentsList(listing)"
                                  :key="ench.name"
                                  color="secondary"
                                  size="x-small"
                                  variant="flat"
                                  class="font-weight-bold px-2"
                                >
                                  {{ ench.name }} LV.{{ ench.level }}
                                </v-chip>
                              </div>
                            </div>

                            <div v-if="getLoreLines(listing).length > 0" class="mb-3 lore-box pa-3 rounded bg-grey-lighten-4 border">
                              <span class="text-caption font-weight-bold text-medium-emphasis d-block mb-1">属性说明 (Lore)：</span>
                              <div
                                v-for="(line, idx) in getLoreLines(listing)"
                                :key="idx"
                                class="text-body-2 font-weight-bold text-indigo-darken-3 mb-1"
                              >
                                {{ line }}
                              </div>
                            </div>
                          </v-col>

                          <v-col cols="12" md="6" class="pl-md-6">
                            <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
                              <v-icon color="secondary" class="mr-2" size="18">mdi-information-outline</v-icon>
                              竞买原始 NBT 信息
                            </div>
                            <pre class="text-mono text-caption text-slate-800 bg-grey-lighten-4 pa-3 rounded overflow-x-auto" style="max-height: 200px;">{{ parseNbtMeta(listing) }}</pre>
                          </v-col>
                        </v-row>
                      </v-card>
                    </td>
                  </tr>
                </template>

                <tr v-if="filteredAuctionsBidLeading.length === 0">
                  <td colspan="8" class="text-center py-8">
                    <v-icon size="36" class="text-medium-emphasis mb-1">mdi-shield-alert-outline</v-icon>
                    <div class="text-subtitle-2 font-weight-bold text-medium-emphasis">当前没有您处于领先中的公开竞拍</div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-window-item>
      </v-window>
    </div>

    <!-- Modals & Dialogs -->
    <!-- 1. Edit settings dialog (market price & remark) -->
    <v-dialog v-model="editSettingsDialog" max-width="500" persistent>
      <v-card class="rounded-xl border pa-4" v-if="selectedListing" elevation="24">
        <v-card-title class="d-flex align-center font-weight-bold pb-4 border-b">
          <v-icon color="primary" class="mr-2">mdi-pencil-outline</v-icon>
          修改挂单交易配置
        </v-card-title>
        
        <v-card-text class="pt-6">
          <v-row dense align="center" class="mb-4">
            <v-col cols="12" class="d-flex align-center bg-grey-lighten-4 rounded-lg pa-3 mb-4">
              <div class="mc-icon-shell mc-icon-shell-sm mr-3 border rounded bg-white pa-1">
                <McIcon
                  :material="resolveListingIconMaterial(selectedListing)"
                  :icon-url="resolveDisplayIconUrl(selectedListing)"
                  size="32"
                  color="primary"
                />
              </div>
              <div>
                <span class="text-subtitle-1 font-weight-black d-block leading-tight">{{ resolveItemName(selectedListing) }}</span>
                <span class="text-caption text-medium-emphasis font-mono">{{ resolveRawMaterialLabel(selectedListing) }}</span>
              </div>
            </v-col>

            <!-- Price Input -->
            <v-col cols="12">
              <v-text-field
                v-model.number="editPrice"
                type="number"
                label="单价 (代币金额)"
                prepend-inner-icon="mdi-cash"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="primary"
                :rules="[v => !!v || '单价不能为空', v => v > 0 || '单价必须大于0']"
              >
                <template #append-inner>
                  <span class="text-caption font-weight-bold text-medium-emphasis">
                    {{ selectedListing.currency === 'SHOP_COIN' ? `${shopCoinName} (${shopCoinShort})` : `${gameCoinName} (${gameCoinShort})` }}
                  </span>
                </template>
              </v-text-field>
            </v-col>

            <!-- Remark Input -->
            <v-col cols="12">
              <v-textarea
                v-model="editRemark"
                label="交易备注说明 (选填)"
                prepend-inner-icon="mdi-text-box-outline"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="primary"
                rows="3"
                maxlength="100"
                counter
                hide-details
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 pb-2">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="secondary" class="font-weight-bold" @click="editSettingsDialog = false">
            取消
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="px-6 font-weight-bold rounded-lg"
            :loading="actionSubmitting"
            @click="handleUpdateListingSettings"
          >
            保存配置
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 2. Unlist Listing Confirmation Dialog -->
    <v-dialog v-model="unlistDialog" max-width="450" persistent>
      <v-card class="rounded-xl border pa-4" v-slot:default v-if="selectedListing" elevation="24">
        <v-card-title class="d-flex align-center font-weight-bold border-b pb-4 text-error">
          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          确认下架撤回商品挂单
        </v-card-title>
        
        <v-card-text class="pt-6 text-body-2 text-medium-emphasis leading-relaxed">
          确认要将材质为 <strong>{{ resolveItemName(selectedListing) }}</strong> 的商品挂单下架吗？
          <br /><br />
          确认提交下架后，挂单将直接从大厅下索引，相应托管质押扣除的游戏代币或物资将在10秒内全额退还您的钱包。
        </v-card-text>

        <v-card-actions class="px-6 pb-2">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="secondary" class="font-weight-bold" @click="unlistDialog = false">
            取消
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="px-6 font-weight-bold rounded-lg"
            :loading="actionSubmitting"
            @click="handleUnlistListing"
          >
            确认下架下线
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Toast Notification Snackbars -->
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
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import McIcon from '@/components/McIcon.vue'
import {
  isLoggedIn,
  refreshWallet,
  shopCoin,
  gameCoin,
  username,
  shopCoinName,
  shopCoinShort,
  gameCoinName,
  gameCoinShort
} from '@/api/authStore'
import { shopApi } from '@/api/shop'
import {
  resolveListingDisplayVisual,
  resolveRawMaterialLabel
} from '@/utils/displayVisual'

const { t, tm } = useI18n()

// Active section Tabs state
const activeSubTab = ref<'direct' | 'auction'>('direct')

// Fuzzy search and filter states
const searchQueryDirect = ref('')
const selectedSideFilter = ref('ALL') // 'ALL', 'SELL', 'BUY'
const selectedActiveFilter = ref('ALL') // 'ALL', 'ACTIVE', 'PAUSED'

const searchQueryAuction = ref('')
const selectedAlgoFilter = ref('ALL') // 'ALL', 'ENGLISH_AUCTION_V1', 'DUTCH_AUCTION_V1', 'VICKREY_AUCTION_V1'

// Expandable rows states
const expandedDirectRows = ref<string[]>([])
const expandedAuctionCreatedRows = ref<string[]>([])
const expandedAuctionBidLeadingRows = ref<string[]>([])

// Meta List Data States
const myListings = ref<any[]>([])
const publicListings = ref<any[]>([])

// Loading states
const myListingsLoading = ref(false)
const myAuctionsLoading = ref(false)
const actionSubmitting = ref(false)

// Modals Trigger flags
const editSettingsDialog = ref(false)
const unlistDialog = ref(false)

// Selections
const selectedListing = ref<any>(null)
const editPrice = ref<number>(1)
const editRemark = ref<string>('')

// Snackbar notifications
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const showSnackbar = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// Timer dynamic ticks to keep countdowns alive
const currentTime = ref<number>(Date.now())
let timeInterval: any = null

onMounted(async () => {
  if (isLoggedIn.value) {
    await handleLoadMyListings()
    await handleLoadAuctions()
  }
  timeInterval = setInterval(() => {
    currentTime.value = Date.now()
  }, 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})

// Load market Direct Sell/Buy C2C Listings
const handleLoadMyListings = async () => {
  myListingsLoading.value = true
  try {
    const res = await shopApi.getMyListings()
    myListings.value = res.data?.listings || res.data || []
  } catch (err: any) {
    console.error(err)
    const errMsg = err.response?.data?.message || err.message || 'load listings failed'
    showSnackbar(t('app.uiText.templates.marketLoadFailed', { message: errMsg }), 'error')
  } finally {
    myListingsLoading.value = false
  }
}

// Load C2C Auctions & Leading bids
const handleLoadAuctions = async () => {
  myAuctionsLoading.value = true
  try {
    // 1. Fetch public auctions to check which ones we leading in
    const resPublic = await shopApi.getMarketListings({ mode: 'AUCTION' })
    publicListings.value = resPublic.data?.listings || resPublic.data || []
    
    // 2. Fetch all user listings to populate "My Created Auctions"
    // Since handleLoadMyListings already populates myListings, we can also refresh it here or rely on it
    await handleLoadMyListings()
  } catch (err: any) {
    console.error(err)
  } finally {
    myAuctionsLoading.value = false
  }
}

// Filters direct vs auctions C2C items
const myDirectListings = computed(() => {
  return myListings.value.filter((item: any) => item.tradeMode === 'DIRECT')
})

const myAuctionsCreated = computed(() => {
  return myListings.value.filter((item: any) => item.tradeMode === 'AUCTION' && item.sellerName === username.value)
})

const myAuctionsBidLeading = computed(() => {
  return publicListings.value.filter((item: any) => item.auctionHighestBidder === username.value)
})

// Advanced table-demo filterings
const filteredDirectListings = computed(() => {
  return myDirectListings.value.filter((item: any) => {
    // 1. Search Query
    const name = resolveItemName(item).toLowerCase()
    const search = searchQueryDirect.value.trim().toLowerCase()
    if (search) {
      const matchName = name.includes(search)
      const matchId = item.id?.toString().includes(search)
      const matchRemark = (item.remark || '').toLowerCase().includes(search)
      if (!matchName && !matchId && !matchRemark) return false
    }
    // 2. Side Filter
    if (selectedSideFilter.value !== 'ALL' && item.side !== selectedSideFilter.value) {
      return false
    }
    // 3. Active Status Filter
    if (selectedActiveFilter.value !== 'ALL') {
      if (selectedActiveFilter.value === 'ACTIVE' && !item.active) return false
      if (selectedActiveFilter.value === 'PAUSED' && item.active) return false
    }
    return true
  })
})

const filteredAuctionsCreated = computed(() => {
  return myAuctionsCreated.value.filter((item: any) => {
    const name = resolveItemName(item).toLowerCase()
    const search = searchQueryAuction.value.trim().toLowerCase()
    if (search) {
      const matchName = name.includes(search)
      const matchId = item.id?.toString().includes(search)
      if (!matchName && !matchId) return false
    }
    if (selectedAlgoFilter.value !== 'ALL' && item.auctionAlgorithm !== selectedAlgoFilter.value) {
      return false
    }
    return true
  })
})

const filteredAuctionsBidLeading = computed(() => {
  return myAuctionsBidLeading.value.filter((item: any) => {
    const name = resolveItemName(item).toLowerCase()
    const search = searchQueryAuction.value.trim().toLowerCase()
    if (search) {
      const matchName = name.includes(search)
      const matchId = item.id?.toString().includes(search)
      if (!matchName && !matchId) return false
    }
    if (selectedAlgoFilter.value !== 'ALL' && item.auctionAlgorithm !== selectedAlgoFilter.value) {
      return false
    }
    return true
  })
})

// Row toggle handlers
const toggleDirectRow = (id: string) => {
  const strId = String(id)
  if (expandedDirectRows.value.includes(strId)) {
    expandedDirectRows.value = expandedDirectRows.value.filter(rowId => rowId !== strId)
  } else {
    expandedDirectRows.value.push(strId)
  }
}
const isDirectRowExpanded = (id: string) => expandedDirectRows.value.includes(String(id))

const toggleAuctionCreatedRow = (id: string) => {
  const strId = String(id)
  if (expandedAuctionCreatedRows.value.includes(strId)) {
    expandedAuctionCreatedRows.value = expandedAuctionCreatedRows.value.filter(rowId => rowId !== strId)
  } else {
    expandedAuctionCreatedRows.value.push(strId)
  }
}
const isAuctionCreatedRowExpanded = (id: string) => expandedAuctionCreatedRows.value.includes(String(id))

const toggleAuctionBidLeadingRow = (id: string) => {
  const strId = String(id)
  if (expandedAuctionBidLeadingRows.value.includes(strId)) {
    expandedAuctionBidLeadingRows.value = expandedAuctionBidLeadingRows.value.filter(rowId => rowId !== strId)
  } else {
    expandedAuctionBidLeadingRows.value.push(strId)
  }
}
const isAuctionBidLeadingRowExpanded = (id: string) => expandedAuctionBidLeadingRows.value.includes(String(id))

// Minecraft item metadata NBT parsing helpers
const parseNbtMeta = (listing: any) => {
  try {
    if (listing.itemMetaJson) {
      return JSON.parse(listing.itemMetaJson)
    }
  } catch (e) {}
  return null
}

const getLoreLines = (listing: any): string[] => {
  try {
    const meta = parseNbtMeta(listing)
    if (meta && Array.isArray(meta.lore)) {
      return meta.lore.map((line: string) => stripColorCodes(line))
    }
  } catch (e) {}
  return []
}

const getEnchantmentsList = (listing: any): { name: string; level: number }[] => {
  try {
    const meta = parseNbtMeta(listing)
    if (meta && meta.enchantments && typeof meta.enchantments === 'object') {
      return Object.entries(meta.enchantments).map(([name, level]: [string, any]) => ({
        name: name.replace('minecraft:', '').toUpperCase(),
        level: Number(level)
      }))
    }
  } catch (e) {}
  return []
}

// Action modals open triggers
const openEditSettingsDialog = (listing: any) => {
  selectedListing.value = listing
  editPrice.value = listing.price
  editRemark.value = listing.remark || ''
  editSettingsDialog.value = true
}

const confirmUnlistListing = (listing: any) => {
  selectedListing.value = listing
  unlistDialog.value = true
}

// 1. Toggle Listing pause / resume state
const toggleListingActive = async (listing: any) => {
  const isPause = listing.active
  const apiCall = isPause ? shopApi.pauseMarketListing : shopApi.resumeMarketListing
  try {
    await apiCall({ listingId: listing.id })
    showSnackbar(isPause ? '挂单已成功暂停！' : '挂单已重新恢复上架！', 'success')
    await handleLoadMyListings()
  } catch (err: any) {
    console.error(err)
    const errMsg = err.response?.data?.message || err.message || 'failed'
    showSnackbar(t('app.uiText.templates.marketActionFailed', { message: errMsg }), 'error')
  }
}

// 2. Unlist Listing (下架)
const handleUnlistListing = async () => {
  if (!selectedListing.value) return
  actionSubmitting.value = true
  try {
    await shopApi.unlistMarketListing({ listingId: selectedListing.value.id })
    showSnackbar('挂单已成功下架！托管费用已悉数返还钱包。', 'success')
    unlistDialog.value = false
    await refreshWallet()
    await handleLoadMyListings()
  } catch (err: any) {
    console.error(err)
    const errMsg = err.response?.data?.message || err.message || 'failed'
    showSnackbar(t('app.uiText.templates.marketActionFailed', { message: errMsg }), 'error')
  } finally {
    actionSubmitting.value = false
  }
}

// 3. Edit settings unified parameters saving
const handleUpdateListingSettings = async () => {
  if (!selectedListing.value) return
  actionSubmitting.value = true
  try {
    await shopApi.updateMarketPrice({ listingId: selectedListing.value.id, price: editPrice.value })
    await shopApi.updateMarketRemark({ listingId: selectedListing.value.id, remark: editRemark.value })
    showSnackbar('挂单参数修改成功！', 'success')
    editSettingsDialog.value = false
    await refreshWallet()
    await handleLoadMyListings()
  } catch (err: any) {
    console.error(err)
    const errMsg = err.response?.data?.message || err.message || 'failed'
    showSnackbar(t('app.uiText.templates.marketActionFailed', { message: errMsg }), 'error')
  } finally {
    actionSubmitting.value = false
  }
}

// 4. Polish (擦亮)
const refreshListingSupply = async (listing: any) => {
  try {
    await shopApi.refreshMarketSupply({ listingId: listing.id })
    showSnackbar('挂单已成功擦亮，供货重新刷新并置顶！', 'success')
    await handleLoadMyListings()
  } catch (err: any) {
    console.error(err)
    const errMsg = err.response?.data?.message || err.message || 'failed'
    showSnackbar(t('app.uiText.templates.marketActionFailed', { message: errMsg }), 'error')
  }
}

// 5. Cancel / Unlist Auction (Only allowed when no player has bid yet)
const handleCancelAuction = async (listing: any) => {
  actionSubmitting.value = true
  try {
    await shopApi.unlistMarketListing({ listingId: listing.id })
    showSnackbar('拍卖已成功撤回下架！冻结托管的商品已退回。', 'success')
    await handleLoadAuctions()
  } catch (err: any) {
    console.error(err)
    const errMsg = err.response?.data?.message || err.message || 'unlist failed'
    showSnackbar(t('app.uiText.templates.marketActionFailed', { message: errMsg }), 'error')
  } finally {
    actionSubmitting.value = false
  }
}

// --- Dynamic Countdown Timer Helpers & Alg labelers ---
const getAlgorithmColor = (algo: string | null) => {
  if (!algo) return 'grey'
  if (algo === 'ENGLISH_AUCTION_V1') return 'primary'
  if (algo === 'DUTCH_AUCTION_V1') return 'success'
  if (algo === 'VICKREY_AUCTION_V1') return 'warning'
  if (algo === 'CANDLE_AUCTION_V1') return 'info'
  return 'grey'
}

const getAlgorithmLabel = (algoId: string | null) => {
  if (!algoId) return '普通拍卖'
  const auctionList = tm('marketAlgorithms.auction') as any[]
  if (Array.isArray(auctionList)) {
    const found = auctionList.find((item: any) => item.id === algoId)
    if (found && found.label) return found.label
  }
  return algoId
}

const isAuctionExpired = (listing: any) => {
  if (!listing.auctionEndAt) return false
  const endMs = new Date(listing.auctionEndAt).getTime()
  return currentTime.value >= endMs
}

const getCountdownText = (endAtStr: string | null) => {
  if (!endAtStr) return '无时间限制'
  const endMs = new Date(endAtStr).getTime()
  const diff = endMs - currentTime.value
  if (diff <= 0) return '已结束'
  
  const sec = Math.floor((diff / 1000) % 60)
  const min = Math.floor((diff / 1000 / 60) % 60)
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24)
  const days = Math.floor(diff / 1000 / 60 / 60 / 24)
  
  const parts = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0 || days > 0) parts.push(`${hours}时`)
  if (min > 0 || hours > 0 || days > 0) parts.push(`${min}分`)
  parts.push(`${sec}秒`)
  
  return parts.join('')
}

const getDutchCurrentPrice = (listing: any) => {
  const startPrice = Number(listing.auctionStartPrice || listing.price || 0)
  try {
    const params = listing.auctionParamsJson ? JSON.parse(listing.auctionParamsJson) : {}
    const floorPrice = Number(params.floorPrice || 0)
    const durationSeconds = Number(params.durationSeconds || 3600)
    const startMs = new Date(listing.auctionStartAt || listing.createdAt || Date.now()).getTime()
    const elapsedSec = Math.max(0, (currentTime.value - startMs) / 1000)
    const progress = Math.min(1, elapsedSec / durationSeconds)
    return Math.max(floorPrice, Math.round(startPrice - (startPrice - floorPrice) * progress))
  } catch (e) {
    return startPrice
  }
}

// Strip color codes
const stripColorCodes = (str: string) => {
  if (!str) return ''
  return str.replace(/§[0-9a-fk-or]/ig, '')
}

// Item Display name resolver
const resolveItemName = (listing: any) => {
  if (!listing) return ''
  let metaDisplayName = ''
  try {
    if (listing.itemMetaJson) {
      const meta = JSON.parse(listing.itemMetaJson)
      const name = meta.displayName || meta.localizedName
      if (name) metaDisplayName = stripColorCodes(name)
    }
  } catch (e) {}
  const visual = resolveListingDisplayVisual(listing, metaDisplayName)
  return stripColorCodes(visual.title)
}

// Local helper wrappers ensuring 100% metadata/policy compliance for the template
const resolveListingIconMaterial = (listing: any): string => {
  const visual = resolveListingDisplayVisual(listing)
  return visual.material
}

const resolveDisplayIconUrl = (listing: any): string => {
  const visual = resolveListingDisplayVisual(listing)
  return visual.forceIconPath
}
</script>

<style scoped>
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

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.v-theme--dark .border-bottom,
.v-theme--blackguard .border-bottom,
.v-theme--midnightSakura .border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.border-right {
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}
.v-theme--dark .border-right,
.v-theme--blackguard .border-right,
.v-theme--midnightSakura .border-right {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.mc-icon-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  overflow: visible;
  background: transparent;
  border: 0;
}

.mc-icon-shell-card {
  width: 72px;
  height: 72px;
}

.mc-icon-shell-sm {
  width: 56px;
  height: 56px;
}

.text-slate-800 {
  color: #1e293b;
}
.v-theme--dark .text-slate-800,
.v-theme--blackguard .text-slate-800,
.v-theme--midnightSakura .text-slate-800 {
  color: #f1f5f9;
}

.bg-gradient-text {
  background: linear-gradient(135deg, #1867c0 0%, #5cbbf6 50%, #e57373 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.product-icon-surface {
  background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.product-card-media {
  min-height: 136px;
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

/* Table layout styling imported from table-demo.vue */
.bg-table-header {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}
.hover-bg-row {
  transition: all 0.2s ease;
}
.hover-bg-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.02) !important;
}
.row-active {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}
.expanded-row-bg {
  background-color: rgba(var(--v-theme-on-surface), 0.01) !important;
}
.bg-white-pure {
  background-color: rgb(var(--v-theme-surface)) !important;
}
.border-r-md {
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
@media (max-width: 960px) {
  .border-r-md {
    border-right: none;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    padding-bottom: 16px;
    margin-bottom: 16px;
  }
}
.lore-box {
  background-color: rgba(var(--v-theme-primary), 0.02) !important;
}
.text-slate-800 {
  color: rgba(var(--v-theme-on-surface), 0.87);
}
.width-50 {
  width: 50px;
}
.min-width-32 {
  min-width: 32px !important;
}
</style>
