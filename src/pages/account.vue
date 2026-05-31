<template>
  <v-container fluid class="pa-4 pa-md-6" style="max-width: 1400px; min-height: 100vh;">
    <!-- Unauthenticated View (Login & Instructions & Connection Settings) -->
    <template v-if="!isLoggedIn">
      <v-row class="justify-center" align="stretch">
        <v-col cols="12" md="6" lg="6">
        <v-card
          elevation="0"
          variant="outlined"
          class="rounded-xl pa-6 glass-card fill-height hover-lift d-flex flex-column"
        >
          <v-card-item class="px-0 pt-0">
            <template #title>
              <div class="text-h5 font-weight-bold d-flex align-center">
                <v-icon color="primary" class="mr-2" size="28">mdi-account-circle-outline</v-icon>
                <span>{{ $t('app.uiText.page.authLoginTitle') }}</span>
              </div>
            </template>
            <template #subtitle>
              <span class="text-caption text-medium-emphasis">
                {{ $t('admin.uiText.page.loginDesc') }}
              </span>
            </template>
          </v-card-item>

          <v-divider class="my-4"></v-divider>

          <v-card-text class="px-0 py-2 flex-grow-1">
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="usernameInput"
                :label="$t('app.uiText.page.authUsernameLabel')"
                :placeholder="$t('app.uiText.page.authUsernamePlaceholder')"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                rounded="lg"
                color="primary"
                hide-details="auto"
                required
              ></v-text-field>

              <v-text-field
                v-model="passwordInput"
                :label="$t('app.uiText.page.authPasswordLabel')"
                :placeholder="$t('app.uiText.page.authPasswordPlaceholder')"
                prepend-inner-icon="mdi-lock-outline"
                type="password"
                variant="outlined"
                density="comfortable"
                class="mb-6"
                rounded="lg"
                color="primary"
                hide-details="auto"
              ></v-text-field>

              <v-btn
                type="submit"
                color="primary"
                variant="flat"
                block
                size="large"
                rounded="lg"
                class="font-weight-bold text-none mt-2"
                prepend-icon="mdi-login"
                :loading="loginLoading"
              >
                {{ $t('app.uiText.page.authLoginBtn') }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6" lg="6">
        <v-card
          elevation="0"
          variant="outlined"
          class="rounded-xl pa-6 glass-card fill-height hover-lift d-flex flex-column justify-space-between"
        >
          <div>
            <v-card-item class="px-0 pt-0">
              <template #title>
                <div class="text-h5 font-weight-bold d-flex align-center text-warning">
                  <v-icon color="warning" class="mr-2" size="28">mdi-alert-decagram-outline</v-icon>
                  <span>{{ $t('app.uiText.page.authTipTitle') }}</span>
                </div>
              </template>
            </v-card-item>

            <v-divider class="my-4"></v-divider>

            <v-card-text class="px-0 py-2">
              <div class="d-flex align-start mb-4">
                <v-avatar color="warning-lighten-5" class="mr-3" size="36">
                  <v-icon color="warning" size="18">mdi-numeric-1</v-icon>
                </v-avatar>
                <div>
                  <h4 class="font-weight-bold mb-1">{{ $t('app.uiText.page.authPasswordTipTitle') }}</h4>
                  <p class="text-body-2 text-medium-emphasis" v-html="$t('app.uiText.page.authTipLine1')"></p>
                </div>
              </div>

              <div class="d-flex align-start">
                <v-avatar color="warning-lighten-5" class="mr-3" size="36">
                  <v-icon color="warning" size="18">mdi-numeric-2</v-icon>
                </v-avatar>
                <div>
                  <h4 class="font-weight-bold mb-1">使用凭证登录</h4>
                  <p class="text-body-2 text-medium-emphasis" v-html="$t('app.uiText.page.authTipLine2')"></p>
                </div>
              </div>
            </v-card-text>
          </div>

          <v-card-actions class="px-0 pb-0 pt-4">
            <v-btn
              color="warning"
              variant="tonal"
              block
              rounded="lg"
              class="font-weight-bold text-none"
              prepend-icon="mdi-help-circle-outline"
              href="/help"
            >
              {{ $t('app.uiText.page.authHelpBtn') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </template>

  <!-- Authenticated View (Profile details, Wallet overview, Redeem, Exchange) -->
  <template v-else>
    <v-row class="justify-center">
      <!-- Left Column: User Profile Card -->
      <v-col cols="12" md="4" lg="3">
        <v-card
          elevation="0"
          variant="outlined"
          class="rounded-xl pa-6 glass-card hover-lift text-center position-relative overflow-hidden d-flex flex-column justify-space-between"
        >
          <div>
            <div class="text-overline font-weight-bold text-primary mb-2">
              {{ $t('app.uiText.page.authProfileTitle') }}
            </div>
            
            <div class="d-flex justify-center my-4">
              <v-avatar size="140" color="transparent" style="overflow: visible;">
                <v-img
                  :src="`https://nmsr.nickac.dev/face/${currentUser?.username || 'Steve'}`"
                  class="align-end"
                >
                  <template #placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-avatar>
            </div>

            <h3 class="text-h5 font-weight-bold text-high-emphasis">{{ currentUser?.username }}</h3>
            
            <v-chip
              size="small"
              :color="isAdmin ? 'secondary' : 'primary'"
              class="mt-2 font-weight-bold rounded-pill"
              variant="tonal"
            >
              {{ userRoleLabel }}
            </v-chip>

            <v-divider class="my-5"></v-divider>

            <v-list density="compact" class="bg-transparent text-left pa-0">
              <v-list-item class="px-0 py-1" min-height="auto">
                <template #prepend>
                  <v-icon size="18" color="medium-emphasis" class="mr-2">mdi-account-outline</v-icon>
                </template>
                <v-list-item-title class="text-caption text-medium-emphasis">
                  {{ currentUser?.username }}
                </v-list-item-title>
              </v-list-item>

              <v-list-item class="px-0 py-1" min-height="auto" v-if="currentUser?.uuid">
                <template #prepend>
                  <v-icon size="18" color="medium-emphasis" class="mr-2">mdi-identifier</v-icon>
                </template>
                <v-list-item-title class="text-caption font-weight-mono text-medium-emphasis d-flex align-center">
                  <span class="text-truncate mr-1" style="max-width: 140px;">{{ currentUser.uuid }}</span>
                  <v-btn
                    icon="mdi-content-copy"
                    size="x-small"
                    variant="text"
                    color="primary"
                    density="comfortable"
                    @click="copyUuid"
                  ></v-btn>
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </div>

          <div class="mt-6">
            <v-btn
              color="error"
              variant="tonal"
              block
              rounded="lg"
              class="font-weight-bold text-none"
              prepend-icon="mdi-logout"
              @click="handleLogout"
            >
              {{ $t('app.uiText.page.authLogoutBtn') }}
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <!-- Right Column: Wallet balances, Exchange and Redeem forms, Admin diagnostics -->
      <v-col cols="12" md="8" lg="9" class="d-flex flex-column ga-y-6">
        <!-- 1. Wallet Balances Summary -->
        <v-row class="mb-1">
          <v-col cols="12" sm="6" class="py-1">
            <v-card
              elevation="0"
              variant="outlined"
              class="rounded-xl pa-5 glass-card border-s-4 border-primary"
              style="background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.07) 0%, rgba(var(--v-theme-surface), 0.6) 100%) !important;"
            >
              <div class="d-flex justify-space-between align-center mb-1">
                <div class="text-overline text-medium-emphasis">
                  {{ shopCoinName }}
                </div>
                <v-avatar color="primary-lighten-5" class="rounded-lg" size="36">
                  <v-icon color="primary" size="18">mdi-database-outline</v-icon>
                </v-avatar>
              </div>
              <div class="text-h3 font-weight-black text-primary d-flex align-baseline">
                <span>{{ shopCoin }}</span>
                <span class="text-caption font-weight-bold text-medium-emphasis ml-3">
                  {{ shopCoinShort }}
                </span>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" class="py-1">
            <v-card
              elevation="0"
              variant="outlined"
              class="rounded-xl pa-5 glass-card border-s-4 border-success"
              style="background: linear-gradient(135deg, rgba(var(--v-theme-success), 0.07) 0%, rgba(var(--v-theme-surface), 0.6) 100%) !important;"
            >
              <div class="d-flex justify-space-between align-center mb-1">
                <div class="text-overline text-medium-emphasis">
                  {{ gameCoinName }}
                </div>
                <v-avatar color="success-lighten-5" class="rounded-lg" size="36">
                  <v-icon color="success" size="18">mdi-sword</v-icon>
                </v-avatar>
              </div>
              <div class="text-h3 font-weight-black text-success d-flex align-baseline">
                <span>{{ gameCoin }}</span>
                <span class="text-caption font-weight-bold text-medium-emphasis ml-1">
                  {{ gameCoinShort }}
                </span>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- 2. Redeem Code Form -->
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 glass-card mb-1 hover-lift">
          <v-card-item class="px-0 pt-0">
            <template #title>
              <div class="text-h6 font-weight-bold d-flex align-center">
                <v-icon color="primary" class="mr-2" size="22">mdi-ticket-percent-outline</v-icon>
                <span>{{ $t('app.uiText.page.redeemTitle') }}</span>
              </div>
            </template>
            <template #subtitle>
              <span class="text-caption text-medium-emphasis">
                {{ $t('app.uiText.page.redeemDesc') }}
              </span>
            </template>
          </v-card-item>

          <v-divider class="my-3"></v-divider>

          <v-card-text class="px-0 py-2">
            <v-row class="align-center">
              <v-col cols="12" sm="8" class="py-1">
                <v-text-field
                  v-model="redeemCodeInput"
                  :placeholder="$t('app.uiText.page.redeemCodePlaceholder')"
                  :label="$t('app.uiText.page.redeemCodeLabel')"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="primary"
                  hide-details
                  prepend-inner-icon="mdi-barcode"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="4" class="py-1">
                <v-btn
                  color="primary"
                  variant="elevated"
                  block
                  rounded="lg"
                  height="48"
                  class="font-weight-bold text-none"
                  prepend-icon="mdi-check"
                  :loading="redeemLoading"
                  @click="handleRedeem"
                >
                  {{ $t('app.uiText.page.redeemBtn') }}
                </v-btn>
              </v-col>
            </v-row>
            <p class="text-caption text-medium-emphasis mt-2 pl-1 d-flex align-center">
              <v-icon size="14" color="medium-emphasis" class="mr-1">mdi-information-outline</v-icon>
              {{ $t('app.uiText.page.redeemTipLine1') }}
            </p>
          </v-card-text>
        </v-card>

        <!-- 3. Currency Exchange Form -->
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 glass-card mb-1 hover-lift">
          <v-card-item class="px-0 pt-0">
            <template #title>
              <div class="text-h6 font-weight-bold d-flex align-center">
                <v-icon color="success" class="mr-2" size="22">mdi-swap-horizontal</v-icon>
                <span>{{ $t('app.uiText.page.exchangeTitle') }}</span>
              </div>
            </template>
            <template #subtitle>
              <span class="text-caption text-medium-emphasis" v-html="$t('app.uiText.page.exchangeDesc')"></span>
              <div class="mt-2 d-flex flex-wrap gap-2">
                <v-chip size="x-small" color="primary" variant="tonal" v-if="shopToGameEnabled" class="font-weight-bold">
                  汇率：1 {{ shopCoinShort }} = {{ shopToGameRatio }} {{ gameCoinShort }}
                </v-chip>
                <v-chip size="x-small" color="success" variant="tonal" v-if="gameToShopEnabled" class="font-weight-bold">
                  汇率：1 {{ gameCoinShort }} = {{ gameToShopRatio }} {{ shopCoinShort }}
                </v-chip>
              </div>
            </template>
          </v-card-item>

          <v-divider class="my-3"></v-divider>

          <v-card-text class="px-0 py-2">
            <v-row>
              <v-col cols="12" sm="4" class="py-1">
                <v-select
                  v-model="exchangeDirection"
                  :items="[
                    { title: `${shopCoinShort} ➔ ${gameCoinShort}`, value: 'SHOP_TO_GAME' },
                    { title: `${gameCoinShort} ➔ ${shopCoinShort}`, value: 'GAME_TO_SHOP' }
                  ]"
                  item-title="title"
                  item-value="value"
                  label="兑换方向"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  color="success"
                  hide-details
                ></v-select>
              </v-col>

              <v-col cols="12" sm="4" class="py-1">
                <v-text-field
                  v-model.number="exchangeAmount"
                  type="number"
                  label="兑换数量"
                  variant="outlined"
                  persistent-hint
                  :hint="exchangePreview"
                  density="comfortable"
                  rounded="lg"
                  color="success"
                  prepend-inner-icon="mdi-cash"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="4" class="py-1">
                <v-btn
                  color="success"
                  variant="elevated"
                  block
                  rounded="lg"
                  height="48"
                  class="font-weight-bold text-none"
                  prepend-icon="mdi-swap-horizontal"
                  :loading="exchangeLoading"
                  @click="handleExchange"
                >
                  {{ $t('app.uiText.page.exchangeBtn') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </template>

    <!-- Global SnackBar Notification -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      timeout="3000"
      rounded="lg"
      elevation="4"
    >
      <div class="d-flex align-center font-weight-bold">
        <v-icon class="mr-2" size="20">
          {{ snackbarColor === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline' }}
        </v-icon>
        <span>{{ snackbarText }}</span>
      </div>
      <template #actions>
        <v-btn variant="text" icon="mdi-close" @click="snackbar = false"></v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiClient } from '@/api/client'
import {
  isLoggedIn,
  currentUser,
  isAdmin,
  userRoleLabel,
  loginUser,
  logoutUser,
  refreshWallet,
  shopCoin,
  gameCoin,
  shopCoinName,
  shopCoinShort,
  gameCoinName,
  gameCoinShort,
  shopToGameEnabled,
  shopToGameRatio,
  gameToShopEnabled,
  gameToShopRatio
} from '@/api/authStore'
import { accountApi } from '@/api/account'

const router = useRouter()
const { t } = useI18n()

// Login form state
const usernameInput = ref('')
const passwordInput = ref('')
const loginLoading = ref(false)

// SnackBar state
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Redeem state
const redeemCodeInput = ref('')
const redeemLoading = ref(false)

// Exchange state
const exchangeAmount = ref<number>(100)
const exchangeDirection = ref<'SHOP_TO_GAME' | 'GAME_TO_SHOP'>('SHOP_TO_GAME')
const exchangeLoading = ref(false)

const exchangePreview = computed(() => {
  const amount = Number(exchangeAmount.value) || 0
  if (amount <= 0) return '请输入兑换数量'
  if (exchangeDirection.value === 'SHOP_TO_GAME') {
    const result = amount * shopToGameRatio.value
    return `预计获得: ${result} ${gameCoinShort.value}`
  } else {
    const result = amount * gameToShopRatio.value
    return `预计获得: ${result} ${shopCoinShort.value}`
  }
})



onMounted(async () => {
  if (isLoggedIn.value) {
    await refreshWallet()
  }
})

// Actions
const handleLogin = async () => {
  if (!usernameInput.value) {
    showSnackbar(t('admin.uiText.templates.loadFailed', { message: '用户名不能为空' }), 'error')
    return
  }
  loginLoading.value = true
  try {
    await loginUser(usernameInput.value, passwordInput.value)
    showSnackbar(t('app.uiText.page.authLoginSuccessTitle'), 'success')
  } catch (err: any) {
    console.error(err)
    const errMsg = err.response?.data?.message || err.message || 'Login failed'
    showSnackbar(t('app.uiText.templates.loginFailed', { message: errMsg }), 'error')
  } finally {
    loginLoading.value = false
  }
}

const handleLogout = async () => {
  try {
    await logoutUser()
    showSnackbar(t('admin.uiText.page.loginStatusSignedOut'), 'success')
  } catch (err: any) {
    showSnackbar(t('app.uiText.templates.logoutFailed', { message: err.message }), 'error')
  }
}

const handleRedeem = async () => {
  if (!redeemCodeInput.value) {
    showSnackbar(t('app.uiText.templates.redeemFailed', { message: '请输入兑换码' }), 'error')
    return
  }
  redeemLoading.value = true
  try {
    const prevShop = shopCoin.value
    const prevGame = gameCoin.value

    const res = await accountApi.useRedeemCode({ code: redeemCodeInput.value })
    const data = res.data
    
    await refreshWallet()

    const status = String(data?.status || 'UNKNOWN').toUpperCase()
    const isSuccess = status === 'SUCCESS'

    const tipText = t(`app.redeemStatusTips.${status}.text`, status)
    
    if (isSuccess) {
      const parts: string[] = []
      const deltaShop = (data.shopCoin !== undefined ? data.shopCoin : prevShop) - prevShop
      const deltaGame = (data.gameCoin !== undefined ? data.gameCoin : prevGame) - prevGame
      
      if (deltaShop > 0) {
        parts.push(`${shopCoinName.value} +${deltaShop}`)
      }
      if (deltaGame > 0) {
        parts.push(`${gameCoinName.value} +${deltaGame}`)
      }
      
      const deltaStr = parts.length > 0 ? ` （入账：${parts.join('，')}）` : ''
      showSnackbar(`${tipText}${deltaStr}`, 'success')
      redeemCodeInput.value = ''
    } else {
      showSnackbar(tipText, 'error')
    }
  } catch (err: any) {
    const errMsg = err.response?.data?.message || err.message || 'Redeem code failed'
    showSnackbar(t('app.uiText.templates.redeemFailed', { message: errMsg }), 'error')
  } finally {
    redeemLoading.value = false
  }
}

const handleExchange = async () => {
  if (exchangeAmount.value <= 0) {
    showSnackbar(t('app.uiText.templates.exchangeFailed', { message: '兑换数额必须大于0' }), 'error')
    return
  }
  
  exchangeLoading.value = true
  try {
    const prevShop = shopCoin.value
    const prevGame = gameCoin.value

    const fromCurrency = exchangeDirection.value === 'SHOP_TO_GAME' ? 'SHOP_COIN' : 'GAME_COIN'
    const toCurrency = exchangeDirection.value === 'SHOP_TO_GAME' ? 'GAME_COIN' : 'SHOP_COIN'

    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
    
    const payload = {
      fromCurrency,
      toCurrency,
      amount: exchangeAmount.value,
      idempotencyKey
    }

    const res = await accountApi.walletExchange(payload)
    const data = res.data
    
    await refreshWallet()

    const deltaShop = (data?.shopCoin !== undefined ? data.shopCoin : prevShop) - prevShop
    const deltaGame = (data?.gameCoin !== undefined ? data.gameCoin : prevGame) - prevGame
    
    const parts: string[] = []
    if (deltaShop !== 0) {
      parts.push(`${shopCoinName.value} ${deltaShop > 0 ? '+' : ''}${deltaShop}`)
    }
    if (deltaGame !== 0) {
      parts.push(`${gameCoinName.value} ${deltaGame > 0 ? '+' : ''}${deltaGame}`)
    }
    
    const deltaStr = parts.length > 0 ? ` （变动：${parts.join('，')}）` : ''
    showSnackbar(`货币兑换成功！${deltaStr}`, 'success')
  } catch (err: any) {
    const errMsg = err.response?.data?.message || err.message || 'Exchange failed'
    showSnackbar(t('app.uiText.templates.exchangeFailed', { message: errMsg }), 'error')
  } finally {
    exchangeLoading.value = false
  }
}



const copyUuid = () => {
  if (currentUser.value?.uuid) {
    navigator.clipboard.writeText(currentUser.value.uuid)
    showSnackbar('UUID 已成功复制到剪贴板！', 'success')
  }
}

const showSnackbar = (text: string, color: string) => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}
</script>

