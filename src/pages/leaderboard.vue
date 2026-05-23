<template>
  <v-container fluid class="pa-6" style="max-width: 1400px; min-height: 100vh;">
    <!-- Filters Panel Card -->
    <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 mb-6 glass-card">
      <v-row align="center" dense>
        <!-- Metric Selection Tab -->
        <v-col cols="12" lg="5" md="12" class="mb-3 mb-lg-0">
          <v-tabs
            v-model="activeMetric"
            color="primary"
            align-tabs="start"
            density="comfortable"
            class="rounded-lg bg-surface pa-1"
            @update:model-value="handleLoadList"
          >
            <v-tab value="GAME_COIN" prepend-icon="mdi-sword" class="rounded-lg font-weight-bold text-none">
              {{ $t('app.uiText.autoHtml.k0075') }}
            </v-tab>
            <v-tab value="SHOP_COIN" prepend-icon="mdi-database-outline" class="rounded-lg font-weight-bold text-none">
              {{ $t('app.uiText.autoHtml.k0076') }}
            </v-tab>
            <v-tab value="ONLINE_TIME" prepend-icon="mdi-clock-outline" class="rounded-lg font-weight-bold text-none">
              {{ $t('app.uiText.autoHtml.k0077') }}
            </v-tab>
          </v-tabs>
        </v-col>

        <!-- Time Range Selection -->
        <v-col cols="12" sm="6" md="3" lg="2">
          <v-select
            v-model="timeRange"
            :items="rangeOptions"
            item-title="title"
            item-value="value"
            :label="$t('app.uiText.autoHtml.k0085')"
            prepend-inner-icon="mdi-calendar-clock"
            variant="outlined"
            density="comfortable"
            hide-details
            rounded="lg"
            color="primary"
            @update:model-value="handleLoadList"
          ></v-select>
        </v-col>

        <!-- Sorting Order -->
        <v-col cols="12" sm="6" md="3" lg="2">
          <v-select
            v-model="sortOrder"
            :items="orderOptions"
            item-title="title"
            item-value="value"
            :label="$t('app.uiText.autoHtml.k0081')"
            prepend-inner-icon="mdi-sort"
            variant="outlined"
            density="comfortable"
            hide-details
            rounded="lg"
            color="primary"
            @update:model-value="handleLoadList"
          ></v-select>
        </v-col>

        <!-- Online Switch -->
        <v-col cols="12" sm="6" md="3" lg="2" class="d-flex align-center justify-center">
          <settings-switch
            v-model="showOnlineStatusState"
            color="success"
            :label="$t('app.uiText.page.leaderboardOnlineToggle')"
            hide-details
            density="compact"
          ></settings-switch>
        </v-col>

        <!-- Actions -->
        <v-col cols="12" sm="6" md="3" lg="1" class="d-flex align-center justify-end">
          <v-btn
            icon="mdi-refresh"
            variant="outlined"
            color="secondary"
            class="rounded-lg"
            :loading="loading"
            @click="handleLoadList"
          ></v-btn>
        </v-col>
      </v-row>

    </v-card>

    <!-- Loading Skeleton Grid -->
    <v-row v-if="loading" justify="center" align="end" class="mb-6">
      <v-col cols="12" sm="4" class="order-sm-1 order-2">
        <v-skeleton-loader type="card" class="rounded-xl glass-card pa-4"></v-skeleton-loader>
      </v-col>
      <v-col cols="12" sm="4" class="order-sm-2 order-1 mb-4 mb-sm-6">
        <v-skeleton-loader type="card" height="300" class="rounded-xl glass-card pa-4"></v-skeleton-loader>
      </v-col>
      <v-col cols="12" sm="4" class="order-sm-3 order-3">
        <v-skeleton-loader type="card" class="rounded-xl glass-card pa-4"></v-skeleton-loader>
      </v-col>
    </v-row>

    <!-- 3D Podium Grid (Top 3) -->
    <v-row
      v-else-if="!searchQuery && hasTopThree"
      justify="center"
      align="end"
      class="mb-6 px-2 podium-row"
    >
      <!-- Rank 2: Runner-up (Silver) -->
      <v-col cols="12" sm="4" class="order-sm-1 order-2">
        <v-card
          v-if="runnerUp"
          elevation="0"
          variant="outlined"
          class="rounded-xl pa-4 text-center glass-card podium-card podium-silver hover-lift"
          :class="{ 'user-highlight-card': isCurrentUser(runnerUp.username) }"
          :id="'podium-card-' + runnerUp.username"
        >
          <!-- Silver Trophy Badge -->
          <div class="podium-badge bg-grey-lighten-2 text-grey-darken-3 font-weight-bold elevation-2">
            2
          </div>
          
          <!-- Minecraft Skin Avatar Bust -->
          <div class="avatar-container my-4">
            <v-badge
              v-if="showOnlineStatusState && runnerUp.online"
              dot
              color="success"
              location="bottom right"
              offset-x="6"
              offset-y="6"
              class="online-badge-pulse"
            >
              <v-img
                :src="getBustUrl(runnerUp.username)"
                height="110"
                width="110"
                class="mx-auto"
                alt="Runner Up Skin"
              >
                <template #placeholder>
                  <v-skeleton-loader type="avatar" class="mx-auto"></v-skeleton-loader>
                </template>
              </v-img>
            </v-badge>
            <v-img
              v-else
              :src="getBustUrl(runnerUp.username)"
              height="110"
              width="110"
              class="mx-auto"
              alt="Runner Up Skin"
            >
              <template #placeholder>
                <v-skeleton-loader type="avatar" class="mx-auto"></v-skeleton-loader>
              </template>
            </v-img>
          </div>

          <h3 class="text-h6 font-weight-bold text-slate-800 text-truncate">
            {{ runnerUp.username }}
          </h3>
          
          

          <div class="text-h5 font-weight-black text-secondary mt-1">
            {{ formatValue(runnerUp.score, activeMetric) }}
          </div>

          <div class="text-caption font-weight-bold text-grey-darken-1 mt-1 d-flex align-center justify-center">
            <v-icon color="grey-lighten-1" size="16" class="mr-1">mdi-trophy</v-icon>
            {{ $t('app.uiText.autoPhrase.p0003') }}
          </div>
        </v-card>
      </v-col>

      <!-- Rank 1: Champion (Gold) -->
      <v-col cols="12" sm="4" class="order-sm-2 order-1 mb-4 mb-sm-6">
        <v-card
          v-if="champion"
          elevation="0"
          variant="outlined"
          class="rounded-xl pa-5 text-center glass-card podium-card podium-gold hover-lift champion-card"
          :class="{ 'user-highlight-card': isCurrentUser(champion.username) }"
          :id="'podium-card-' + champion.username"
        >
          <!-- Gold Crown/Trophy Badge -->
          <div class="podium-badge bg-amber text-amber-darken-4 font-weight-black elevation-4">
            1
          </div>
          
          <div class="crown-overlay">
            <v-icon color="amber" size="36">mdi-crown</v-icon>
          </div>

          <!-- Minecraft Skin Avatar Bust -->
          <div class="avatar-container my-4">
            <v-badge
              v-if="showOnlineStatusState && champion.online"
              dot
              color="success"
              location="bottom right"
              offset-x="8"
              offset-y="8"
              class="online-badge-pulse"
            >
              <v-img
                :src="getBustUrl(champion.username)"
                height="140"
                width="140"
                class="mx-auto"
                alt="Champion Skin"
              >
                <template #placeholder>
                  <v-skeleton-loader type="avatar" class="mx-auto"></v-skeleton-loader>
                </template>
              </v-img>
            </v-badge>
            <v-img
              v-else
              :src="getBustUrl(champion.username)"
              height="140"
              width="140"
              class="mx-auto"
              alt="Champion Skin"
            >
              <template #placeholder>
                <v-skeleton-loader type="avatar" class="mx-auto"></v-skeleton-loader>
              </template>
            </v-img>
          </div>

          <h3 class="text-h5 font-weight-black text-slate-800 text-truncate">
            {{ champion.username }}
          </h3>

          

          <div class="text-h4 font-weight-black text-primary mt-1">
            {{ formatValue(champion.score, activeMetric) }}
          </div>

          <div class="text-caption font-weight-bold text-amber-darken-3 mt-1 d-flex align-center justify-center">
            <v-icon color="amber" size="18" class="mr-1">mdi-crown</v-icon>
            {{ $t('app.uiText.autoPhrase.p0006') }}
          </div>
        </v-card>
      </v-col>

      <!-- Rank 3: Third Place (Bronze) -->
      <v-col cols="12" sm="4" class="order-sm-3 order-3">
        <v-card
          v-if="thirdPlace"
          elevation="0"
          variant="outlined"
          class="rounded-xl pa-4 text-center glass-card podium-card podium-bronze hover-lift"
          :class="{ 'user-highlight-card': isCurrentUser(thirdPlace.username) }"
          :id="'podium-card-' + thirdPlace.username"
        >
          <!-- Bronze Trophy Badge -->
          <div class="podium-badge bg-orange-lighten-2 text-orange-darken-4 font-weight-bold elevation-2">
            3
          </div>

          <!-- Minecraft Skin Avatar Bust -->
          <div class="avatar-container my-4">
            <v-badge
              v-if="showOnlineStatusState && thirdPlace.online"
              dot
              color="success"
              location="bottom right"
              offset-x="6"
              offset-y="6"
              class="online-badge-pulse"
            >
              <v-img
                :src="getBustUrl(thirdPlace.username)"
                height="100"
                width="100"
                class="mx-auto"
                alt="Third Place Skin"
              >
                <template #placeholder>
                  <v-skeleton-loader type="avatar" class="mx-auto"></v-skeleton-loader>
                </template>
              </v-img>
            </v-badge>
            <v-img
              v-else
              :src="getBustUrl(thirdPlace.username)"
              height="100"
              width="100"
              class="mx-auto"
              alt="Third Place Skin"
            >
              <template #placeholder>
                <v-skeleton-loader type="avatar" class="mx-auto"></v-skeleton-loader>
              </template>
            </v-img>
          </div>

          <h3 class="text-h6 font-weight-bold text-slate-800 text-truncate">
            {{ thirdPlace.username }}
          </h3>

          

          <div class="text-h5 font-weight-black text-secondary mt-1">
            {{ formatValue(thirdPlace.score, activeMetric) }}
          </div>

          <div class="text-caption font-weight-bold text-orange-darken-3 mt-1 d-flex align-center justify-center">
            <v-icon color="orange-darken-1" size="16" class="mr-1">mdi-trophy-variant</v-icon>
            {{ $t('app.uiText.autoPhrase.p0017') }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Rankings Table Card -->
    <v-card v-if="!loading && hasData" elevation="0" variant="outlined" class="rounded-xl glass-card overflow-hidden">
      <v-table class="bg-transparent text-slate-800">
        <thead>
          <tr class="bg-table-header">
            <th class="font-weight-bold text-subtitle-2 text-center width-80">{{ $t('app.uiText.leaderboardMyRankBtn').substring(0, 2) }}</th>
            <th class="font-weight-bold text-subtitle-2">{{ $t('app.uiText.page.authUsernameLabel') }}</th>

            <th class="font-weight-bold text-subtitle-2 text-right pr-6">排行数值</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="player in tableEntries"
            :key="player.username"
            :id="'player-row-' + player.username"
            class="hover-bg-row align-center text-body-2"
            :class="{
              'user-rank-row': isCurrentUser(player.username),
              'flash-highlight': highlightedUser === player.username
            }"
          >
            <!-- Rank Column -->
            <td class="text-center">
              <v-avatar
                :color="getRankColor(player.rank)"
                class="font-weight-bold"
                :class="getRankTextColorClass(player.rank)"
                size="30"
              >
                {{ player.rank }}
              </v-avatar>
            </td>

            <!-- Player Column -->
            <td>
              <div class="d-flex align-center py-2">
                <!-- Avatar with Online Badge -->
                <v-badge
                  v-if="showOnlineStatusState"
                  dot
                  :color="player.online ? 'success' : 'grey-lighten-1'"
                  location="bottom right"
                  offset-x="2"
                  offset-y="2"
                  :class="{ 'online-badge-pulse': player.online }"
                  class="mr-3"
                >
                  <v-avatar size="36" class="border-avatar">
                    <v-img :src="getAvatarUrl(player.username)"></v-img>
                  </v-avatar>
                </v-badge>
                <v-avatar v-else size="36" class="border-avatar mr-3">
                  <v-img :src="getAvatarUrl(player.username)"></v-img>
                </v-avatar>

                <div>
                  <div class="font-weight-bold d-flex align-center text-slate-800">
                    {{ player.username }}
                    <v-chip
                      v-if="isCurrentUser(player.username)"
                      size="x-small"
                      color="primary"
                      variant="flat"
                      class="ml-2 font-weight-bold"
                    >
                      ME
                    </v-chip>
                  </div>
                  
                </div>
              </div>
            </td>

            <!-- UUID Column -->
            

            <!-- Value/Score Column -->
            <td class="text-right font-weight-black pr-6" :class="isCurrentUser(player.username) ? 'text-primary' : 'text-slate-800'">
              {{ formatValue(player.score, activeMetric) }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Empty State -->
    <v-card v-else-if="!loading" elevation="0" variant="outlined" class="rounded-xl pa-10 text-center glass-card">
      <v-icon size="64" color="medium-emphasis" class="mb-4">mdi-trophy-off-outline</v-icon>
      <h3 class="text-h6 font-weight-bold text-slate-800 mb-2">
        {{ $t('app.uiText.autoPhrase.p0383') }}
      </h3>
      <p class="text-caption text-medium-emphasis">
        没有找到符合条件的排行数据。可以尝试更改过滤条件或刷新榜单。
      </p>
      <v-btn
        color="primary"
        variant="flat"
        class="mt-4 font-weight-bold rounded-lg"
        prepend-icon="mdi-refresh"
        @click="handleLoadList"
      >
        {{ $t('app.uiText.leaderboardRefreshBtn') }}
      </v-btn>
    </v-card>

    <!-- Toast Notification -->
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

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  isLoggedIn,
  refreshWallet,
  username
} from '@/api/authStore'
import { shopApi } from '@/api/shop'

const { t, locale } = useI18n()

// Active Filters
const activeMetric = ref<'GAME_COIN' | 'SHOP_COIN' | 'ONLINE_TIME'>('GAME_COIN')
const timeRange = ref<'TOTAL' | 'WEEK' | 'MONTH'>('TOTAL')
const sortOrder = ref<'DESC' | 'ASC'>('DESC')
const searchQuery = ref('')
const showOnlineStatusState = ref(true)

// API Data states
const entries = ref<any[]>([])
const loading = ref(false)
const walletLoading = ref(false)
const highlightedUser = ref<string | null>(null)

// Toast State
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Filter options mapped to localized labels
const rangeOptions = computed(() => [
  { title: t('app.uiText.autoHtml.k0082'), value: 'TOTAL' },
  { title: t('app.uiText.autoHtml.k0083'), value: 'WEEK' },
  { title: t('app.uiText.autoHtml.k0084'), value: 'MONTH' }
])

const orderOptions = computed(() => [
  { title: t('app.uiText.autoHtml.k0079'), value: 'DESC' },
  { title: t('app.uiText.autoHtml.k0080'), value: 'ASC' }
])

onMounted(async () => {
  await handleLoadList()
  if (isLoggedIn.value) {
    await handleWalletRefreshSilent()
  }
})

// Methods
const showSnackbar = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

const handleWalletRefreshSilent = async () => {
  try {
    await refreshWallet()
  } catch (err) {
    console.error('Wallet sync error:', err)
  }
}

const handleWalletRefresh = async () => {
  walletLoading.value = true
  try {
    await refreshWallet()
    showSnackbar('钱包余额同步成功', 'success')
  } catch (err: any) {
    showSnackbar(t('app.uiText.templates.walletRefreshFailed', { message: err.message }), 'error')
  } finally {
    walletLoading.value = false
  }
}

// Load Leaderboard List from 解耦 API
const handleLoadList = async () => {
  loading.value = true
  try {
    const res = await shopApi.getLeaderboardList({
      metric: activeMetric.value,
      order: sortOrder.value,
      range: timeRange.value
    })
    
    if (res && res.data) {
      entries.value = res.data.entries || []
      // Update global config flags if available in response
      if (res.data.leaderboard) {
        showOnlineStatusState.value = res.data.leaderboard.showOnlineStatus !== false
      }
    }
  } catch (err: any) {
    showSnackbar(t('app.uiText.leaderboardLoadFailed', { message: err.message }), 'error')
    entries.value = []
  } finally {
    loading.value = false
  }
}

// Computed Filters
const filteredEntries = computed(() => {
  if (!searchQuery.value) return entries.value
  const query = searchQuery.value.trim().toLowerCase()
  return entries.value.filter(e => e.username.toLowerCase().includes(query))
})

const hasData = computed(() => filteredEntries.value.length > 0)

const hasTopThree = computed(() => {
  return entries.value.some(e => e.rank === 1 || e.rank === 2 || e.rank === 3)
})

// Top 3 Player Extracts
const champion = computed(() => entries.value.find(e => e.rank === 1) || null)
const runnerUp = computed(() => entries.value.find(e => e.rank === 2) || null)
const thirdPlace = computed(() => entries.value.find(e => e.rank === 3) || null)

// Table entries (Rank 4+ if search query is empty; otherwise all filtered rows)
const tableEntries = computed(() => {
  if (!searchQuery.value) {
    return filteredEntries.value.filter(e => e.rank > 3)
  }
  return filteredEntries.value
})

// Minecraft Avatar URLs
const getAvatarUrl = (name: string) => {
  return `https://nmsr.nickac.dev/face/${name}`
}

const getBustUrl = (name: string) => {
  return `https://nmsr.nickac.dev/bust/${name}`
}

const isCurrentUser = (name: string) => {
  if (!username.value) return false
  return name.toLowerCase() === username.value.toLowerCase()
}

// Value Formatting logic
const formatValue = (score: number, metric: string) => {
  const val = score || 0
  if (metric === 'GAME_COIN') {
    return `${val.toLocaleString()} ${t('app.currencyMeta.GAME_COIN.short')}`
  } else if (metric === 'SHOP_COIN') {
    return `${val.toLocaleString()} ${t('app.currencyMeta.SHOP_COIN.short')}`
  } else if (metric === 'ONLINE_TIME') {
    const hours = (val / 60).toFixed(1)
    return locale.value === 'zh-CN' ? `${hours} 小时` : `${hours} hrs`
  }
  return val.toLocaleString()
}

// Row Color helpers based on Rank
const getRankColor = (rank: number) => {
  if (rank === 1) return 'amber'
  if (rank === 2) return 'grey-lighten-2'
  if (rank === 3) return 'orange-lighten-3'
  return 'grey-lighten-4'
}

const getRankTextColorClass = (rank: number) => {
  if (rank === 1) return 'text-amber-darken-4'
  if (rank === 2) return 'text-grey-darken-3'
  if (rank === 3) return 'text-orange-darken-4'
  return 'text-medium-emphasis'
}

// Locate My Rank functionality
const handleLocateMyRank = () => {
  if (!username.value) {
    showSnackbar('请先登录账户！', 'error')
    return
  }

  // Find user row in full entries list
  const userRow = entries.value.find(e => e.username.toLowerCase() === username.value!.toLowerCase())
  
  if (!userRow) {
    showSnackbar('您当前未进入该排行榜中。', 'error')
    return
  }

  // Clear query if active, to ensure row is visible
  if (searchQuery.value) {
    searchQuery.value = ''
  }

  nextTick(() => {
    let targetEl: HTMLElement | null = null
    
    // If user is top 3 overall, scroll to the corresponding podium card
    if (userRow.rank <= 3) {
      targetEl = document.getElementById(`podium-card-${userRow.username}`)
    } else {
      targetEl = document.getElementById(`player-row-${userRow.username}`)
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Trigger a 2-second flash highlight
      highlightedUser.value = userRow.username
      setTimeout(() => {
        if (highlightedUser.value === userRow.username) {
          highlightedUser.value = null
        }
      }, 2000)
    } else {
      showSnackbar(t('app.uiText.autoPhrase.p0323'), 'error') // Please load the leaderboard first before locating.
    }
  })
}
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

.hover-lift {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1) !important;
}

/* Podium styling */
.podium-row {
  position: relative;
  overflow: visible;
}

.podium-card {
  position: relative;
  overflow: visible !important;
}

.podium-badge {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  z-index: 2;
  border: 2px solid white;
}

.podium-gold {
  border: 2px solid rgba(255, 215, 0, 0.6) !important;
  background: rgba(255, 215, 0, 0.03) !important;
}
.v-theme--dark .podium-gold,
.v-theme--blackguard .podium-gold {
  background: rgba(255, 215, 0, 0.06) !important;
}

.podium-silver {
  border: 2px solid rgba(192, 192, 192, 0.6) !important;
  background: rgba(192, 192, 192, 0.02) !important;
}

.podium-bronze {
  border: 2px solid rgba(205, 127, 50, 0.6) !important;
  background: rgba(205, 127, 50, 0.02) !important;
}

.champion-card {
  z-index: 1;
}

.crown-overlay {
  position: absolute;
  top: -42px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  animation: float-crown 2.5s ease-in-out infinite;
}

@keyframes float-crown {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-6px);
  }
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Green online pulse badge */
.online-badge-pulse :deep(.v-badge__badge) {
  animation: online-pulse 1.8s infinite;
  box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
}

@keyframes online-pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

/* Table header styling */
.bg-table-header {
  background-color: rgba(var(--v-theme-primary), 0.04) !important;
}
.v-theme--dark .bg-table-header,
.v-theme--blackguard .bg-table-header {
  background-color: rgba(var(--v-theme-primary), 0.1) !important;
}

/* Row Hover & highlight styling */
.hover-bg-row {
  transition: all 0.2s ease;
}
.hover-bg-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.03) !important;
}

.user-rank-row {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}
.user-highlight-card {
  background-color: rgba(var(--v-theme-primary), 0.06) !important;
  border-color: rgba(var(--v-theme-primary), 0.5) !important;
}

/* Flash highlight micro-animation */
@keyframes flash-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0.4);
    background-color: rgba(var(--v-theme-primary), 0.15) !important;
  }
  50% {
    box-shadow: 0 0 16px 4px rgba(var(--v-theme-primary), 0.5);
    background-color: rgba(var(--v-theme-primary), 0.25) !important;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0);
    background-color: transparent;
  }
}

.flash-highlight {
  animation: flash-glow 2s ease-in-out;
  border: 1px solid rgba(var(--v-theme-primary), 0.8) !important;
}

/* Helper styles */
.text-slate-800 {
  color: #1e293b;
}
.v-theme--dark .text-slate-800,
.v-theme--blackguard .text-slate-800,
.v-theme--midnightSakura .text-slate-800 {
  color: #f1f5f9;
}

.font-mono {
  font-family: monospace;
}

.width-80 {
  width: 80px;
}
.border-avatar {
  border: 1px solid rgba(0, 0, 0, 0.1);
}
.v-theme--dark .border-avatar,
.v-theme--blackguard .border-avatar {
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
