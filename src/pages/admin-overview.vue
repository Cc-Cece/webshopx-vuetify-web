<template>
  <admin-gate>
    <v-container fluid class="pa-6 animate-fade-in">
      <!-- Premium Hero Greeting Banner -->
      <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 mb-6 glass-card header-card hero-gradient overflow-hidden position-relative border-primary-light">
        <div class="hero-overlay"></div>
        <v-row align="center" no-gutters class="z-index-1">
          <v-col cols="12" sm="8" class="d-flex align-center flex-wrap">
            <v-avatar size="48" color="primary-lighten-5" class="mr-4 border-primary border-white-glow">
              <v-icon size="24" color="primary">mdi-shield-crown-outline</v-icon>
            </v-avatar>
            <div>
              <h2 class="text-h5 font-weight-black text-slate-800 leading-tight mb-1">
                {{ greetingText }}，管理员
              </h2>
              <p class="text-caption text-medium-emphasis mb-0 font-weight-medium">
                欢迎回来。系统当前运行平稳，您可以实时监控在线玩家、商店营收和市场运行。
              </p>
            </div>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex justify-start justify-sm-end align-center mt-3 mt-sm-0">
            <v-tabs
              v-model="activeTab"
              color="primary"
              density="comfortable"
              class="rounded-lg bg-grey-lighten-4 pa-1"
            >
              <v-tab value="status" prepend-icon="mdi-pulse" class="rounded-lg font-weight-bold text-caption">监控</v-tab>
              <v-tab value="redeem" prepend-icon="mdi-ticket-percent-outline" class="rounded-lg font-weight-bold text-caption">{{ $t('admin.uiText.tabLabelRedeem') }}</v-tab>
              <v-tab value="audit" prepend-icon="mdi-text-box-search-outline" class="rounded-lg font-weight-bold text-caption">{{ $t('admin.uiText.tabLabelAudit') }}</v-tab>
            </v-tabs>
          </v-col>
        </v-row>
      </v-card>

      <!-- Tabs Contents -->
      <v-window v-model="activeTab">
        <!-- Status Tab -->
        <v-window-item value="status">
          <!-- Real-time Stats Grid -->
          <v-row class="mb-4">
            <!-- 1. Player Status -->
            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height hover-lift">
                <div class="d-flex align-center justify-between mb-2">
                  <span class="text-caption font-weight-bold text-medium-emphasis">全服在线玩家</span>
                  <v-avatar color="success-lighten-5" size="32">
                    <v-icon color="success" size="18">mdi-account-multiple</v-icon>
                  </v-avatar>
                </div>
                <div class="d-flex align-center justify-between mt-1">
                  <div class="text-h4 font-weight-black text-slate-800">{{ statsData.onlinePlayers }} <span class="text-caption text-medium-emphasis">/ {{ statsData.maxPlayers }}</span></div>
                  <v-progress-circular
                    :model-value="playerPercentage"
                    size="36"
                    width="4"
                    color="success"
                    class="ml-2"
                  >
                    <span class="text-xxs font-weight-bold">{{ Math.round(playerPercentage) }}%</span>
                  </v-progress-circular>
                </div>
                <div class="text-caption text-grey-darken-1 mt-3 d-flex align-center">
                  <v-icon color="success" size="14" class="mr-1">mdi-link</v-icon>
                  <span class="text-truncate">{{ statsData.boundUsers }} 绑定角色 (共 {{ statsData.totalUsers }} 注册)</span>
                </div>
              </v-card>
            </v-col>

            <!-- 2. Official Shop -->
            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height hover-lift">
                <div class="d-flex align-center justify-between mb-2">
                  <span class="text-caption font-weight-bold text-medium-emphasis">官方商城运营</span>
                  <v-avatar color="primary-lighten-5" size="32">
                    <v-icon color="primary" size="18">mdi-storefront-outline</v-icon>
                  </v-avatar>
                </div>
                <div class="text-h4 font-weight-black text-slate-800 text-truncate" :title="`${statsData.totalRevenue} ${shopCoinShort}`">
                  {{ statsData.totalRevenue.toLocaleString() }} <span class="text-caption text-medium-emphasis">{{ shopCoinShort }}</span>
                </div>
                <v-progress-linear
                  :model-value="orderCompletionRate"
                  color="primary"
                  height="4"
                  rounded
                  class="mt-3"
                ></v-progress-linear>
                <div class="text-caption text-grey-darken-1 mt-2 d-flex align-center">
                  <v-icon color="primary" size="14" class="mr-1">mdi-cart-check</v-icon>
                  <span class="text-truncate">已完成订单 {{ statsData.completedOrders }} / {{ statsData.totalOrders }}</span>
                </div>
              </v-card>
            </v-col>

            <!-- 3. C2C Market -->
            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height hover-lift">
                <div class="d-flex align-center justify-between mb-2">
                  <span class="text-caption font-weight-bold text-medium-emphasis">C2C 市场交易额</span>
                  <v-avatar color="warning-lighten-5" size="32">
                    <v-icon color="warning" size="18">mdi-scale-balance</v-icon>
                  </v-avatar>
                </div>
                <div class="text-h4 font-weight-black text-slate-800 text-truncate" :title="`${statsData.totalTradeVolume} ${shopCoinShort}`">
                  {{ statsData.totalTradeVolume.toLocaleString() }} <span class="text-caption text-medium-emphasis">{{ shopCoinShort }}</span>
                </div>
                <v-progress-linear
                  :model-value="c2cCompletionRate"
                  color="warning"
                  height="4"
                  rounded
                  class="mt-3"
                ></v-progress-linear>
                <div class="text-caption text-grey-darken-1 mt-2 d-flex align-center">
                  <v-icon color="warning" size="14" class="mr-1">mdi-basket-outline</v-icon>
                  <span class="text-truncate">寄售中 {{ statsData.activeListings }} 件 / 成交 {{ statsData.completedTrades }} 笔</span>
                </div>
              </v-card>
            </v-col>

            <!-- 4. Redeem Coupons -->
            <v-col cols="12" sm="6" md="3">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card fill-height hover-lift">
                <div class="d-flex align-center justify-between mb-2">
                  <span class="text-caption font-weight-bold text-medium-emphasis">系统兑换卡券</span>
                  <v-avatar color="secondary-lighten-5" size="32">
                    <v-icon color="secondary" size="18">mdi-ticket-percent-outline</v-icon>
                  </v-avatar>
                </div>
                <div class="text-h4 font-weight-black text-slate-800">
                  {{ statsData.totalRedeemUses }} <span class="text-caption text-medium-emphasis">次兑换</span>
                </div>
                <v-progress-linear
                  :model-value="Math.min(100, (statsData.totalRedeemUses / (statsData.totalRedeemCodes || 1)) * 10)"
                  color="secondary"
                  height="4"
                  rounded
                  class="mt-3"
                ></v-progress-linear>
                <div class="text-caption text-grey-darken-1 mt-2 d-flex align-center">
                  <v-icon color="secondary" size="14" class="mr-1">mdi-qrcode</v-icon>
                  <span class="text-truncate">已生成 {{ statsData.totalRedeemCodes }} 种优惠兑换码</span>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <!-- Announcement Broadcaster -->
            <v-col cols="12" md="6">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card fill-height d-flex flex-column border-primary-light">
                <div class="d-flex align-center mb-4">
                  <v-avatar color="primary-lighten-5" size="38" class="mr-3">
                    <v-icon color="primary" size="20">mdi-bullhorn-outline</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-black text-slate-800">全服系统通知公告</h3>
                    <p class="text-caption text-medium-emphasis">即时推送公告消息至游戏端聊天框与 Web 消息盒子。</p>
                  </div>
                </div>

                <v-form ref="announceFormRef" v-model="announceValid" class="flex-grow-1 d-flex flex-column" @submit.prevent="handleAnnounce">
                  <v-text-field
                    v-model="announceTitle"
                    :label="$t('admin.uiText.autoHtml.k0342')"
                    :placeholder="$t('admin.uiText.autoHtml.k0343')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="primary"
                    class="mb-3"
                    :rules="[v => !!v || '请输入公告标题']"
                    required
                  ></v-text-field>

                  <v-textarea
                    v-model="announceContent"
                    :label="$t('admin.uiText.autoHtml.k0344')"
                    :placeholder="$t('admin.uiText.autoHtml.k0345')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="primary"
                    rows="4"
                    class="mb-4 flex-grow-1"
                    :rules="[v => !!v || '请输入公告内容']"
                    required
                  ></v-textarea>

                  <v-btn
                    type="submit"
                    color="primary"
                    variant="flat"
                    block
                    height="44"
                    rounded="lg"
                    class="font-weight-black text-none text-caption"
                    :loading="announceLoading"
                    prepend-icon="mdi-send-outline"
                  >
                    {{ $t('admin.uiText.autoHtml.k0348') }}
                  </v-btn>
                </v-form>
              </v-card>
            </v-col>

            <!-- Technical overview parameters -->
            <v-col cols="12" md="6">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card fill-height">
                <div class="d-flex align-center mb-4">
                  <v-avatar color="secondary-lighten-5" size="38" class="mr-3">
                    <v-icon color="secondary" size="20">mdi-server</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-black text-slate-800">服务集群部署状态</h3>
                    <p class="text-caption text-medium-emphasis">提供当前微服务后端与 Redis 同步总线的节点参数。</p>
                  </div>
                </div>

                <v-list class="bg-transparent pa-0">
                  <v-list-item class="px-0 py-2 border-b-dashed">
                    <template #prepend>
                      <v-icon color="secondary" size="18" class="mr-2">mdi-database</v-icon>
                    </template>
                    <v-list-item-title class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0209') }}</v-list-item-title>
                    <template #append>
                      <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">SQLite / MySQL</v-chip>
                    </template>
                  </v-list-item>

                  <v-list-item class="px-0 py-2 border-b-dashed">
                    <template #prepend>
                      <v-icon color="secondary" size="18" class="mr-2">mdi-lan</v-icon>
                    </template>
                    <v-list-item-title class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0210') }}</v-list-item-title>
                    <template #append>
                      <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">集群主节点 (Cluster-Master)</v-chip>
                    </template>
                  </v-list-item>

                  <v-list-item class="px-0 py-2 border-b-dashed">
                    <template #prepend>
                      <v-icon color="secondary" size="18" class="mr-2">mdi-cached</v-icon>
                    </template>
                    <v-list-item-title class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0211') }}</v-list-item-title>
                    <template #append>
                      <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">健康在线 (Healthy)</v-chip>
                    </template>
                  </v-list-item>

                  <v-list-item class="px-0 py-2 border-b-dashed">
                    <template #prepend>
                      <v-icon color="secondary" size="18" class="mr-2">mdi-sync</v-icon>
                    </template>
                    <v-list-item-title class="text-caption font-weight-bold text-slate-800">{{ $t('admin.uiText.autoHtml.k0212') }}</v-list-item-title>
                    <template #append>
                      <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">跨服秒级同步中</v-chip>
                    </template>
                  </v-list-item>

                  <v-list-item class="px-0 py-2 border-b-dashed">
                    <template #prepend>
                      <v-icon color="secondary" size="18" class="mr-2">mdi-web</v-icon>
                    </template>
                    <v-list-item-title class="text-caption font-weight-bold text-slate-800">API 根域名</v-list-item-title>
                    <template #append>
                      <span class="text-caption font-mono text-medium-emphasis">{{ apiBaseUrl }}</span>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>

          <!-- Recent Audit Logs Timeline Quickview -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card border-warning-light">
                <div class="d-flex align-center justify-between mb-4 flex-wrap">
                  <div class="d-flex align-center">
                    <v-avatar color="warning-lighten-5" size="38" class="mr-3">
                      <v-icon color="warning" size="20">mdi-history</v-icon>
                    </v-avatar>
                    <div>
                      <h3 class="text-subtitle-1 font-weight-black text-slate-800">近期管理员审计日志</h3>
                      <p class="text-caption text-medium-emphasis">展示最近发生的安全审计与操作事件，确保运维可追溯性。</p>
                    </div>
                  </div>
                  <v-btn
                    variant="text"
                    color="primary"
                    class="font-weight-bold text-caption rounded-lg mt-2 mt-sm-0"
                    append-icon="mdi-arrow-right"
                    @click="activeTab = 'audit'"
                  >
                    查看完整日志
                  </v-btn>
                </div>

                <v-skeleton-loader v-if="auditLoading && auditList.length === 0" type="list-item-three-line@3" class="bg-transparent"></v-skeleton-loader>

                <div v-else class="timeline-container px-2">
                  <v-timeline side="end" align="start" density="compact" class="px-0">
                    <v-timeline-item
                      v-for="log in auditList.slice(0, 5)"
                      :key="log.id"
                      :dot-color="getActionColor(log.action)"
                      size="small"
                      class="mb-2"
                    >
                      <div class="d-flex justify-between flex-wrap align-center w-100">
                        <div class="text-left">
                          <span class="font-weight-black text-slate-800 mr-2">{{ log.username }}</span>
                          <v-chip size="x-small" :color="getActionColor(log.action)" variant="tonal" class="mr-2 font-weight-bold font-mono">
                            {{ log.action }}
                          </v-chip>
                          <span class="text-caption text-slate-800">{{ log.description }}</span>
                        </div>
                        <span class="text-caption text-medium-emphasis font-mono ml-sm-4">{{ formatTime(log.createdAt) }}</span>
                      </div>
                    </v-timeline-item>
                  </v-timeline>
                  <div v-if="auditList.length === 0" class="text-center py-4 text-medium-emphasis text-caption">
                    暂无安全审计记录。
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Redeem Codes Tab -->
        <v-window-item value="redeem">
          <v-row>
            <!-- Generator card -->
            <v-col cols="12" md="4">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card fill-height border-warning-light">
                <div class="d-flex align-center mb-4">
                  <v-avatar color="warning-lighten-5" size="38" class="mr-3">
                    <v-icon color="warning" size="20">mdi-ticket-percent-outline</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.autoHtml.k0011') }}</h3>
                    <p class="text-caption text-medium-emphasis">支持生成指定奖励的多次/一次性通用卡券兑换码。</p>
                  </div>
                </div>

                <v-form ref="redeemFormRef" v-model="redeemValid" class="d-flex flex-column" @submit.prevent="handleCreateRedeem">
                  <!-- Custom code prefix -->
                  <v-text-field
                    v-model="redeemCode"
                    :label="$t('admin.uiText.autoHtml.k0009')"
                    :placeholder="$t('admin.uiText.autoHtml.k0010')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="warning"
                    class="mb-3"
                  ></v-text-field>

                  <!-- Reward amounts -->
                  <v-row dense>
                    <v-col cols="6">
                      <v-text-field
                        v-model.number="redeemShopCoin"
                        type="number"
                        :label="$t('admin.uiText.autoHtml.k0003')"
                        placeholder="0"
                        prepend-inner-icon="mdi-database-outline"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="warning"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model.number="redeemGameCoin"
                        type="number"
                        :label="$t('admin.uiText.autoHtml.k0004')"
                        placeholder="0"
                        prepend-inner-icon="mdi-sword"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="warning"
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <!-- Max usages -->
                  <v-text-field
                    v-model.number="redeemMaxUsages"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0005')"
                    placeholder="1"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="warning"
                    class="mb-3"
                    :rules="[v => v >= 1 || '必须大于或等于 1']"
                  ></v-text-field>

                  <!-- User limits -->
                  <v-text-field
                    v-model.number="redeemUserMaxUsages"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0006')"
                    placeholder="1"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="warning"
                    class="mb-3"
                    :rules="[v => v >= 1 || '必须大于或等于 1']"
                  ></v-text-field>

                  <!-- Expiration -->
                  <v-text-field
                    v-model.number="redeemDuration"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0007')"
                    :placeholder="$t('admin.uiText.autoHtml.k0008')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="warning"
                    class="mb-4"
                  ></v-text-field>

                  <v-alert type="info" variant="tonal" class="rounded-lg mb-4 text-caption" density="comfortable" :title="$t('admin.uiText.autoHtml.k0014')">
                    {{ $t('admin.uiText.autoHtml.k0015') }}
                  </v-alert>

                  <v-btn
                    type="submit"
                    color="warning"
                    variant="flat"
                    block
                    height="44"
                    rounded="lg"
                    class="font-weight-black text-none text-caption"
                    :loading="redeemLoading"
                  >
                    {{ $t('admin.uiText.autoHtml.k0011') }}
                  </v-btn>

                  <!-- Output Area -->
                  <v-fade-transition>
                    <div v-if="generatedCode" class="mt-4 pa-3 bg-warning-lighten-5 border-warning-dashed rounded-lg text-center">
                      <div class="text-caption font-weight-bold text-warning-darken-4 mb-2">生成成功！最新激活券码如下：</div>
                      <code class="text-h6 font-weight-black text-warning-darken-3 font-mono block mb-2">{{ generatedCode }}</code>
                      <v-btn
                        size="small"
                        color="warning"
                        variant="tonal"
                        class="font-weight-bold rounded-lg"
                        prepend-icon="mdi-content-copy"
                        @click="handleCopyCode(generatedCode)"
                      >
                        {{ $t('admin.uiText.autoHtml.k0012') }}
                      </v-btn>
                    </div>
                  </v-fade-transition>
                </v-form>
              </v-card>
            </v-col>

            <!-- List table card -->
            <v-col cols="12" md="8">
              <v-card elevation="0" variant="outlined" class="rounded-xl glass-card fill-height overflow-hidden d-flex flex-column">
                <!-- Header toolbar -->
                <div class="pa-4 border-b d-flex justify-between align-center flex-wrap">
                  <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.autoHtml.k0001') }}</h3>
                  <v-btn
                    variant="outlined"
                    size="small"
                    color="secondary"
                    prepend-icon="mdi-refresh"
                    class="rounded-lg font-weight-bold text-caption mt-2 mt-sm-0"
                    :loading="redeemListLoading"
                    @click="handleLoadRedeemList"
                  >
                    {{ $t('admin.uiText.autoHtml.k0002') }}
                  </v-btn>
                </div>

                <v-skeleton-loader v-if="redeemListLoading && redeemList.length === 0" type="table-row-divider@6" class="bg-transparent"></v-skeleton-loader>

                <div v-else class="table-container flex-grow-1 overflow-y-auto" style="max-height: 520px;">
                  <v-table class="bg-transparent text-slate-800">
                    <thead>
                      <tr class="bg-table-header">
                        <th class="font-weight-bold text-caption">兑换券码</th>
                        <th class="font-weight-bold text-caption text-right">{{ shopCoinName }}({{ shopCoinShort }})</th>
                        <th class="font-weight-bold text-caption text-right">{{ gameCoinName }}({{ gameCoinShort }})</th>
                        <th class="font-weight-bold text-caption text-center">最大数 / 单限</th>
                        <th class="font-weight-bold text-caption text-center">已兑次数</th>
                        <th class="font-weight-bold text-caption text-center">截止有效期</th>
                        <th class="font-weight-bold text-caption text-center">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in redeemList" :key="item.code" class="hover-bg-row text-caption">
                        <td class="font-weight-bold font-mono">{{ item.code }}</td>
                        <td class="text-right text-primary font-weight-bold">{{ item.shopCoin || 0 }} {{ shopCoinShort }}</td>
                        <td class="text-right text-success font-weight-bold">{{ item.gameCoin || 0 }} {{ gameCoinShort }}</td>
                        <td class="text-center font-mono">{{ item.maxUsages }} / {{ item.userMaxUsages }}</td>
                        <td class="text-center">
                          <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">
                            {{ item.usedUsages || 0 }}
                          </v-chip>
                        </td>
                        <td class="text-center text-medium-emphasis">
                          {{ item.expireTime ? formatTime(item.expireTime) : '永久有效' }}
                        </td>
                        <td class="text-center">
                          <v-btn
                            size="x-small"
                            variant="text"
                            color="primary"
                            icon="mdi-content-copy"
                            @click="handleCopyCode(item.code)"
                          ></v-btn>
                        </td>
                      </tr>
                      <tr v-if="redeemList.length === 0">
                        <td colspan="7" class="text-center py-6 text-medium-emphasis">
                          {{ $t('admin.uiText.page.emptyState') }}
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- Audit Log Tab -->
        <v-window-item value="audit">
          <v-card elevation="0" variant="outlined" class="rounded-xl glass-card overflow-hidden">
            <!-- Table Toolbar -->
            <div class="pa-4 border-b d-flex justify-between align-center flex-wrap">
              <div>
                <h3 class="text-subtitle-1 font-weight-black text-slate-800">操作审计控制台</h3>
                <p class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0487') }}</p>
              </div>
              <v-btn
                variant="outlined"
                size="small"
                color="secondary"
                prepend-icon="mdi-refresh"
                class="rounded-lg font-weight-bold text-caption mt-2 mt-sm-0"
                :loading="auditLoading"
                @click="handleLoadAuditList"
              >
                刷新日志
              </v-btn>
            </div>

            <!-- Search Field -->
            <div class="pa-4 bg-grey-lighten-4 border-b">
              <v-row align="center" dense>
                <v-col cols="12" sm="6" md="4">
                  <v-text-field
                    v-model="auditSearch"
                    placeholder="输入操作人、模块名、具体描述搜索..."
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    rounded="lg"
                    clearable
                    color="primary"
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>

            <v-skeleton-loader v-if="auditLoading && auditList.length === 0" type="table-row-divider@8" class="bg-transparent"></v-skeleton-loader>

            <!-- Table -->
            <div v-else class="table-container overflow-y-auto" style="max-height: 520px;">
              <v-table class="bg-transparent text-slate-800">
                <thead>
                  <tr class="bg-table-header">
                    <th class="font-weight-bold text-caption text-center width-60">ID</th>
                    <th class="font-weight-bold text-caption">时间</th>
                    <th class="font-weight-bold text-caption">操作人</th>
                    <th class="font-weight-bold text-caption">模块/领域</th>
                    <th class="font-weight-bold text-caption">动作类型</th>
                    <th class="font-weight-bold text-caption">详细说明</th>
                    <th class="font-weight-bold text-caption text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in filteredAuditList" :key="log.id" class="hover-bg-row text-caption">
                    <td class="text-center font-mono font-weight-bold">{{ log.id }}</td>
                    <td class="text-no-wrap font-mono">{{ formatTime(log.createdAt) }}</td>
                    <td>
                      <v-chip size="x-small" color="secondary" variant="flat" class="font-weight-bold font-mono">
                        {{ log.username }}
                      </v-chip>
                    </td>
                    <td>
                      <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">
                        {{ log.domain }}
                      </v-chip>
                    </td>
                    <td>
                      <v-chip size="x-small" :color="getActionColor(log.action)" variant="tonal" class="font-weight-bold font-mono">
                        {{ log.action }}
                      </v-chip>
                    </td>
                    <td class="text-truncate" style="max-width: 320px;" :title="log.description">
                      {{ log.description }}
                    </td>
                    <td class="text-center">
                      <v-btn
                        size="x-small"
                        color="primary"
                        variant="tonal"
                        class="rounded-lg font-weight-bold text-caption"
                        prepend-icon="mdi-code-json"
                        @click="handleShowAuditJson(log)"
                      >
                        详情
                      </v-btn>
                    </td>
                  </tr>
                  <tr v-if="filteredAuditList.length === 0">
                    <td colspan="7" class="text-center py-8 text-medium-emphasis">
                      没有找到符合条件的审计记录。
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </v-card>
        </v-window-item>
      </v-window>

      <!-- Code Inspector Dialog -->
      <v-dialog v-model="jsonDialog" max-width="650" scrollable>
        <v-card elevation="0" variant="outlined" class="rounded-xl glass-card border-card-top pa-4">
          <div class="d-flex align-center justify-between mb-4">
            <div class="d-flex align-center">
              <v-avatar color="primary-lighten-5" size="36" class="mr-3">
                <v-icon color="primary" size="18">mdi-code-json</v-icon>
              </v-avatar>
              <h3 class="text-subtitle-1 font-weight-black text-slate-800">审计日志完整上下文</h3>
            </div>
            <v-btn icon="mdi-close" variant="text" size="small" @click="jsonDialog = false"></v-btn>
          </div>

          <v-divider class="mb-4"></v-divider>

          <v-card-text class="pa-0">
            <div class="code-block-wrapper pa-3 rounded-lg overflow-x-auto font-mono text-caption text-slate-800">
              <pre>{{ JSON.stringify(selectedAuditLog, null, 2) }}</pre>
            </div>
          </v-card-text>

          <v-divider class="my-4"></v-divider>

          <div class="d-flex justify-end">
            <v-btn
              color="secondary"
              variant="tonal"
              class="rounded-lg font-weight-bold text-caption mr-2"
              prepend-icon="mdi-content-copy"
              @click="handleCopyCode(JSON.stringify(selectedAuditLog, null, 2))"
            >
              复制 JSON
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="rounded-lg font-weight-bold text-caption"
              @click="jsonDialog = false"
            >
              关闭
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
import { adminApi } from '@/api/admin'
import {
  shopCoinName,
  shopCoinShort,
  gameCoinName,
  gameCoinShort
} from '@/api/authStore'
import { apiClient } from '@/api/client'

const { t } = useI18n()
const apiBaseUrl = computed(() => apiClient.defaults.baseURL || '未配置')

// Active tab switch
const activeTab = ref<'status' | 'redeem' | 'audit'>('status')

// SnackBar Alert State
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const showSnackbar = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// 1. Status Dashboard State
const announceFormRef = ref<any>(null)
const announceValid = ref(false)
const announceTitle = ref('')
const announceContent = ref('')
const announceLoading = ref(false)

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) return '晨曦微露'
  if (hour < 9) return '早上好'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 17) return '下午好'
  if (hour < 19) return '傍晚好'
  return '晚上好'
})

const statsLoading = ref(false)
const statsData = ref({
  onlinePlayers: 0,
  maxPlayers: 100,
  totalUsers: 0,
  boundUsers: 0,
  totalProducts: 0,
  activeProducts: 0,
  totalOrders: 0,
  completedOrders: 0,
  refundedOrders: 0,
  totalRevenue: 0,
  activeListings: 0,
  totalTrades: 0,
  completedTrades: 0,
  totalTradeVolume: 0,
  totalRedeemCodes: 0,
  totalRedeemUses: 0
})

const playerPercentage = computed(() => {
  if (!statsData.value.maxPlayers) return 0
  return (statsData.value.onlinePlayers / statsData.value.maxPlayers) * 100
})

const orderCompletionRate = computed(() => {
  if (!statsData.value.totalOrders) return 0
  return Math.round((statsData.value.completedOrders / statsData.value.totalOrders) * 100)
})

const c2cCompletionRate = computed(() => {
  const total = statsData.value.completedTrades + statsData.value.activeListings
  if (!total) return 0
  return Math.round((statsData.value.completedTrades / total) * 100)
})

const fetchOverviewStats = async () => {
  statsLoading.value = true
  try {
    const res = await adminApi.getOverviewStats()
    if (res && res.data) {
      statsData.value = res.data
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar('加载系统统计数据失败: ' + msg, 'error')
  } finally {
    statsLoading.value = false
  }
}

const refreshDashboard = async () => {
  await Promise.all([
    fetchOverviewStats(),
    handleLoadRedeemList(),
    handleLoadAuditList()
  ])
  showSnackbar('控制台数据刷新成功！', 'success')
}

const handleAnnounce = async () => {
  if (!announceFormRef.value) return
  const { valid } = await announceFormRef.value.validate()
  if (!valid) return

  announceLoading.value = true
  try {
    await adminApi.announceNotification({
      title: announceTitle.value,
      content: announceContent.value
    })
    showSnackbar('全服通知公告发布成功！', 'success')
    announceTitle.value = ''
    announceContent.value = ''
    if (announceFormRef.value) {
      announceFormRef.value.resetValidation()
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.sendFailed', { message: msg }), 'error')
  } finally {
    announceLoading.value = false
  }
}

// 2. Redeem Coupon State
const redeemFormRef = ref<any>(null)
const redeemValid = ref(false)
const redeemCode = ref('')
const redeemShopCoin = ref<number | ''>('')
const redeemGameCoin = ref<number | ''>('')
const redeemMaxUsages = ref<number>(1)
const redeemUserMaxUsages = ref<number>(1)
const redeemDuration = ref<number | ''>('')

const redeemLoading = ref(false)
const generatedCode = ref('')
const redeemList = ref<any[]>([])
const redeemListLoading = ref(false)

const handleCreateRedeem = async () => {
  if (!redeemFormRef.value) return
  const { valid } = await redeemFormRef.value.validate()
  if (!valid) return

  redeemLoading.value = true
  try {
    const res = await adminApi.createRedeemCode({
      code: redeemCode.value.trim() || undefined,
      shopCoin: redeemShopCoin.value || 0,
      gameCoin: redeemGameCoin.value || 0,
      maxUsages: redeemMaxUsages.value,
      userMaxUsages: redeemUserMaxUsages.value,
      durationMinutes: redeemDuration.value || undefined
    })

    if (res && res.data) {
      generatedCode.value = res.data.code || ''
      showSnackbar('兑换码生成成功！', 'success')
      // Reset form variables
      redeemCode.value = ''
      redeemShopCoin.value = ''
      redeemGameCoin.value = ''
      redeemMaxUsages.value = 1
      redeemUserMaxUsages.value = 1
      redeemDuration.value = ''
      if (redeemFormRef.value) {
        redeemFormRef.value.resetValidation()
      }
      // Reload redeem list to reflect immediately
      await handleLoadRedeemList()
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.createFailed', { message: msg }), 'error')
  } finally {
    redeemLoading.value = false
  }
}

const handleLoadRedeemList = async () => {
  redeemListLoading.value = true
  try {
    const res = await adminApi.getRedeemList()
    if (res && res.data) {
      redeemList.value = res.data.list || res.data || []
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.loadFailed', { message: msg }), 'error')
  } finally {
    redeemListLoading.value = false
  }
}

const handleCopyCode = (text: string) => {
  navigator.clipboard.writeText(text)
  showSnackbar('已成功复制到剪贴板！', 'success')
}

// 3. Audit Log Console State
const auditList = ref<any[]>([])
const auditLoading = ref(false)
const auditSearch = ref('')
const jsonDialog = ref(false)
const selectedAuditLog = ref<any>(null)

const handleLoadAuditList = async () => {
  auditLoading.value = true
  try {
    const res = await adminApi.getAuditList()
    if (res && res.data) {
      auditList.value = res.data.list || res.data || []
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.loadFailed', { message: msg }), 'error')
  } finally {
    auditLoading.value = false
  }
}

const filteredAuditList = computed(() => {
  if (!auditSearch.value) return auditList.value
  const query = auditSearch.value.trim().toLowerCase()
  return auditList.value.filter(log => {
    return (
      (log.username || '').toLowerCase().includes(query) ||
      (log.domain || '').toLowerCase().includes(query) ||
      (log.action || '').toLowerCase().includes(query) ||
      (log.description || '').toLowerCase().includes(query)
    )
  })
})

const getActionColor = (action: string) => {
  const act = (action || '').toUpperCase()
  if (act.includes('CREATE') || act.includes('ADD') || act.includes('UPLOAD')) return 'success'
  if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('SAVE') || act.includes('SYNC')) return 'warning'
  if (act.includes('DELETE') || act.includes('REMOVE') || act.includes('FORCE') || act.includes('UNBIND')) return 'error'
  return 'primary'
}

const handleShowAuditJson = (log: any) => {
  selectedAuditLog.value = log
  jsonDialog.value = true
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
    fetchOverviewStats(),
    handleLoadRedeemList(),
    handleLoadAuditList()
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
  border-top: 4px solid rgb(var(--v-theme-primary)) !important;
}

.border-primary-light {
  border-left: 4px solid rgb(var(--v-theme-primary)) !important;
}
.border-warning-light {
  border-left: 4px solid rgb(var(--v-theme-warning)) !important;
}
.border-card-top {
  border-top: 4px solid rgb(var(--v-theme-primary)) !important;
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
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}
.v-theme--dark .bg-table-header,
.v-theme--blackguard .bg-table-header {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

.border-b-dashed {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
}
.v-theme--dark .border-b-dashed,
.v-theme--blackguard .border-b-dashed {
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
}

.border-warning-dashed {
  border: 1px dashed rgba(217, 119, 6, 0.3);
}

.code-block-wrapper {
  background-color: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.v-theme--dark .code-block-wrapper,
.v-theme--blackguard .code-block-wrapper {
  background-color: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hover-bg-row {
  transition: all 0.2s ease;
}
.hover-bg-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.03) !important;
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

.text-xxs {
  font-size: 0.68rem !important;
}

.hero-gradient {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.04) 0%, rgba(var(--v-theme-secondary), 0.04) 100%) !important;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(circle at 100% 0%, rgba(var(--v-theme-primary), 0.06) 0%, transparent 60%);
  pointer-events: none;
}

.border-white-glow {
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.12) !important;
  border: 2px solid rgba(255, 255, 255, 0.45) !important;
}

.text-left {
  text-align: left !important;
}

.w-100 {
  width: 100% !important;
}
</style>
