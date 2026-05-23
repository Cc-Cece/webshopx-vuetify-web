<template>
  <v-fade-transition mode="out-in">
    <!-- If authorized, render the page content -->
    <div v-if="isAdmin" :key="1">
      <slot />
    </div>

    <!-- Otherwise, render the security login gate -->
    <v-container v-else :key="2" class="fill-height justify-center align-center py-10">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="6" lg="5">
          <!-- Glassmorphic Login Card -->
          <v-card elevation="0" variant="outlined" class="rounded-xl pa-6 glass-card border-card">
            <!-- Header section -->
            <div class="text-center mb-6">
              <v-avatar color="warning-lighten-5" size="56" class="mb-4">
                <v-icon color="warning" size="32">mdi-shield-lock-outline</v-icon>
              </v-avatar>
              <h2 class="text-h5 font-weight-black text-slate-800">{{ $t('admin.uiText.page.loginTitle') }}</h2>
              <p class="text-caption text-medium-emphasis mt-1">{{ $t('admin.uiText.page.loginDesc') }}</p>
            </div>

            <!-- Form -->
            <v-form ref="formRef" v-model="formValid" @submit.prevent="handleLogin">
              <!-- Username -->
              <v-text-field
                v-model="usernameInput"
                :label="$t('admin.uiText.page.loginAccount')"
                :placeholder="$t('admin.uiText.page.loginAccountPlaceholder')"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="warning"
                class="mb-3"
                :rules="[v => !!v || $t('admin.uiText.page.loginMissingCredentials')]"
                required
              ></v-text-field>

              <!-- Password -->
              <v-text-field
                v-model="passwordInput"
                :label="$t('admin.uiText.page.loginPassword')"
                :placeholder="$t('admin.uiText.page.loginPasswordPlaceholder')"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                color="warning"
                class="mb-4"
                :rules="[v => !!v || $t('admin.uiText.page.loginMissingCredentials')]"
                @click:append-inner="showPassword = !showPassword"
                required
              ></v-text-field>

              <!-- Submit Button -->
              <v-btn
                type="submit"
                color="warning"
                variant="flat"
                block
                height="48"
                rounded="lg"
                class="font-weight-black text-none text-subtitle-1 elevation-2 mt-2"
                :loading="loading"
              >
                {{ $t('admin.uiText.page.loginBtn') }}
              </v-btn>
            </v-form>

            <v-divider class="my-6"></v-divider>

            <!-- Safety Banner -->
            <v-alert
              type="warning"
              variant="tonal"
              border="start"
              class="rounded-lg mb-4 text-caption"
              density="comfortable"
              :title="$t('admin.uiText.page.loginSecurityTitle')"
            >
              {{ $t('admin.uiText.page.loginSecurityDesc') }}
            </v-alert>

            <!-- Local Test Helper Prompt -->
            <div class="bg-amber-lighten-5 border-dashed rounded-lg pa-3 text-caption text-amber-darken-4">
              <div class="d-flex align-start">
                <v-icon color="amber-darken-3" class="mr-2 mt-0_5" size="16">mdi-help-circle</v-icon>
                <div>
                  <strong>本地开发调试提示：</strong><br />
                  如果您在本地进行系统测试，可直接点击右上角齿轮展开“系统设置”抽屉，开启其中的<strong>“模拟管理员角色”</strong>开关，即可无缝解锁全部管理控制权限，无需输入账密。
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

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
  </v-fade-transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { isAdmin, userRole, setSession } from '@/api/authStore'
import { adminApi } from '@/api/admin'

const { t } = useI18n()

const formRef = ref<any>(null)
const formValid = ref(false)
const usernameInput = ref('')
const passwordInput = ref('')
const showPassword = ref(false)
const loading = ref(false)

// Toast alerts
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const showSnackbar = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

const handleLogin = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    const res = await adminApi.login({
      username: usernameInput.value,
      password: passwordInput.value
    })

    if (res && res.data) {
      const data = res.data
      
      // Sync to Pinia authStore session state
      setSession({
        token: data.token || '',
        username: data.username || usernameInput.value,
        uuid: data.uuid || data.boundUuid || '',
        role: 'Admin', // Force role to Admin on successful admin api login
        email: data.email || `${usernameInput.value}@webshopx.com`,
        shopCoin: data.shopCoin !== undefined ? data.shopCoin : 0,
        gameCoin: data.gameCoin !== undefined ? data.gameCoin : 0
      })
      
      // Update global role ref to trigger transition
      userRole.value = 'Admin'
      showSnackbar(t('admin.uiText.page.loginStatusSuccess'), 'success')
    } else {
      throw new Error('未返回有效数据')
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.saveFailed', { message: msg }), 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(0, 0, 0, 0.08) !important;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.v-theme--dark .glass-card,
.v-theme--blackguard .glass-card,
.v-theme--midnightSakura .glass-card {
  background: rgba(30, 30, 30, 0.5) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.border-card {
  border-top: 4px solid rgb(var(--v-theme-warning)) !important;
}

.text-slate-800 {
  color: #1e293b;
}
.v-theme--dark .text-slate-800,
.v-theme--blackguard .text-slate-800,
.v-theme--midnightSakura .text-slate-800 {
  color: #f1f5f9;
}

.border-dashed {
  border: 1px dashed rgba(217, 119, 6, 0.3);
}

.mt-0_5 {
  margin-top: 2px;
}
</style>
