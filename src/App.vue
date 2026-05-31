<template>
  <v-app :theme="themeName">
    <!-- 侧边导航栏 -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail && mdAndUp"
      elevation="0"
      class="border-e blur-drawer"
    >
      <!-- 品牌 Logo 区 -->
      <v-list-item
        prepend-avatar="https://cdn.vuetifyjs.com/docs/images/logos/vuetify-logo-light.svg"
        title="WebShopX"
        subtitle="Minecraft Premium Portal"
        class="py-4 brand-item"
        @click="mdAndUp ? (rail = !rail) : null"
      >
        <template #append v-if="!rail">
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            class="hidden-sm-and-down"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>

      <!-- 导航链接列表 -->
      <v-list density="compact" nav class="mt-2 overflow-y-auto" style="height: calc(100% - 130px);">
        <!-- 玩家前台门户菜单 -->
        <v-list-subheader class="text-overline font-weight-bold text-primary pl-4" v-if="!rail">
          {{ $t('app.uiText.page.navTabsAria') }}
        </v-list-subheader>
        
        <v-list-item
          v-for="item in playerMenuItems"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          link
          active-class="m3-active-item"
          class="mb-1 py-1 rounded-pill nav-item-hover"
        ></v-list-item>

        <v-divider class="my-3" v-if="!rail"></v-divider>

        <!-- 管理后台系统菜单 -->
        <template v-if="isAdmin">
          <v-list-subheader class="text-overline font-weight-bold text-orange pl-4" v-if="!rail">
            {{ $t('admin.uiText.page.navMajorAria') }}
          </v-list-subheader>

          <v-list-item
            v-for="item in adminMenuItems"
            :key="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            link
            active-class="m3-active-item"
            class="mb-1 py-1 rounded-pill nav-item-hover"
          ></v-list-item>

          <v-divider class="my-3" v-if="!rail"></v-divider>
        </template>

        <!-- 帮助指南 -->
        <v-list-subheader class="text-overline font-weight-bold text-green pl-4" v-if="!rail">
          {{ $t('help.uiText.page.tocTitle') }}
        </v-list-subheader>
        
        <v-list-item
          prepend-icon="mdi-help-circle-outline"
          :title="$t('help.uiText.page.title')"
          to="/help"
          link
          active-class="m3-active-item"
          class="mb-1 py-1 rounded-pill nav-item-hover"
        ></v-list-item>

        <v-divider class="my-3" v-if="!rail"></v-divider>

        <!-- 示例演示 (Developer Demos) -->
        <v-list-subheader class="text-overline font-weight-bold text-blue pl-4" v-if="!rail">
          {{ currentLocale === 'zh' ? '开发示例演示' : 'Developer Demos' }}
        </v-list-subheader>
        
        <v-list-item
          prepend-icon="mdi-form-select"
          :title="currentLocale === 'zh' ? '组件与表单演示' : 'Components & Forms'"
          to="/components-demo"
          link
          active-class="m3-active-item"
          class="mb-1 py-1 rounded-pill nav-item-hover"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-bullhorn-outline"
          :title="currentLocale === 'zh' ? '对话框与弹窗演示' : 'Dialogs Showcase'"
          to="/dialogs-demo"
          link
          active-class="m3-active-item"
          class="mb-1 py-1 rounded-pill nav-item-hover"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-table-large"
          :title="currentLocale === 'zh' ? '高级数据表演示' : 'Data Table Showcase'"
          to="/table-demo"
          link
          active-class="m3-active-item"
          class="mb-1 py-1 rounded-pill nav-item-hover"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-card-text-outline"
          :title="currentLocale === 'zh' ? '产品卡片演示' : 'Product Card Demo'"
          to="/product-card-demo"
          link
          active-class="m3-active-item"
          class="mb-1 py-1 rounded-pill nav-item-hover"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-cog-box"
          :title="currentLocale === 'zh' ? '高阶偏好设定' : 'Advanced Settings'"
          to="/settings-demo"
          link
          active-class="m3-active-item"
          class="mb-1 py-1 rounded-pill nav-item-hover"
        ></v-list-item>
      </v-list>

      <!-- 底部版本与缩放按钮 -->
      <template #append>
        <div class="pa-4 text-center" v-if="!rail">
          <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">
            v1.2.0 Modern
          </v-chip>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- 顶部导航栏 -->
    <v-app-bar flat class="px-3 border-b blur-bar" height="64">
      <v-app-bar-nav-icon
        variant="text"
        @click.stop="drawer = !drawer"
        class="hidden-md-and-up"
      ></v-app-bar-nav-icon>

      <v-app-bar-title class="font-weight-bold d-flex align-center">
        <v-icon color="primary" class="mr-2" size="28">mdi-shopping-outline</v-icon>
        <span class="bg-gradient-text">WebShopX Portal</span>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- 经济资产展示区 (高奢 Pill 设计) -->
      <div v-if="isLoggedIn" class="d-none d-sm-flex align-center mr-4">
        <!-- 网页币 (Shop Coin) -->
        <v-chip
          variant="outlined"
          color="primary"
          class="me-2 font-weight-bold bg-chip"
          prepend-icon="mdi-database-outline"
          elevation="0"
        >
          <span class="text-caption mr-1 opacity-70">{{ shopCoinShort }}:</span>
          <span>{{ shopCoin }}</span>
        </v-chip>
        
        <!-- 游戏币 (Game Coin) -->
        <v-chip
          variant="outlined"
          color="success"
          class="font-weight-bold bg-chip"
          prepend-icon="mdi-sword"
          elevation="0"
        >
          <span class="text-caption mr-1 opacity-70">{{ gameCoinShort }}:</span>
          <span>{{ gameCoin }}</span>
        </v-chip>
      </div>

      <!-- 设置面板触发按钮 -->
      <v-tooltip :text="$t('app.openSettings')" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            icon
            color="primary"
            class="mr-2"
            @click.stop="settingsDrawer = !settingsDrawer"
          >
            <v-icon>mdi-cog-outline</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- 主题切换按钮 -->
      <v-tooltip :text="$t('app.toggleTheme')" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            icon
            color="primary"
            class="mr-2 theme-toggle-btn"
            @click="toggleTheme"
          >
            <v-icon>{{ themeIcon }}</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <!-- 快捷语言切换菜单 -->
      <v-menu width="200" rounded="lg">
        <template #activator="{ props: menuProps }">
          <v-tooltip :text="$t('app.language')" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="{ ...menuProps, ...tooltipProps }"
                variant="text"
                icon
                color="primary"
                class="mr-2"
              >
                <v-icon>mdi-translate</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
        <v-list density="compact">
          <v-list-item
            v-for="lang in [
              { labelKey: 'app.langZh', value: 'zh' },
              { labelKey: 'app.langEn', value: 'en' }
            ]"
            :key="lang.value"
            :title="$t(lang.labelKey)"
            :value="lang.value"
            :active="currentLocale === lang.value"
            active-class="m3-active-item"
            @click="currentLocale = lang.value"
          >
            <template #prepend>
              <v-icon :icon="currentLocale === lang.value ? 'mdi-check' : 'mdi-translate'" size="18" class="mr-2"></v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- 消息通知 -->
      <v-menu
        width="340"
        rounded="lg"
        :close-on-content-click="false"
        @update:model-value="onNotifMenuOpen"
      >
        <template #activator="{ props }">
          <v-btn variant="text" icon class="mr-2" v-bind="props">
            <v-badge
              v-if="isLoggedIn && unreadCount > 0"
              color="error"
              :content="unreadCount > 99 ? '99+' : unreadCount"
            >
              <v-icon>mdi-bell-outline</v-icon>
            </v-badge>
            <v-icon v-else>mdi-bell-outline</v-icon>
          </v-btn>
        </template>

        <v-card rounded="lg" elevation="4" class="overflow-hidden" width="340">
          <!-- 头部 -->
          <v-card-item class="bg-primary py-3">
            <template #title>
              <span class="text-white font-weight-bold text-body-1">
                {{ $t('user.notifications') }}
              </span>
            </template>
            <template #append>
              <v-chip
                v-if="unreadCount > 0"
                color="white"
                size="x-small"
                variant="tonal"
                class="font-weight-bold"
              >{{ unreadCount }}</v-chip>
            </template>
          </v-card-item>
          <v-divider></v-divider>

          <!-- 未登录 -->
          <div v-if="!isLoggedIn" class="pa-6 text-center">
            <v-icon size="40" color="medium-emphasis" class="mb-2">mdi-lock-outline</v-icon>
            <p class="text-caption text-medium-emphasis">请先登录</p>
          </div>

          <!-- 空状态 -->
          <div
            v-else-if="isLoggedIn && notificationsList.length === 0"
            class="pa-6 text-center"
          >
            <v-icon size="40" color="medium-emphasis" class="mb-2">mdi-bell-off-outline</v-icon>
            <p class="text-caption text-medium-emphasis">{{ $t('app.uiText.page.notificationsView') }}</p>
          </div>

          <!-- 通知列表（最多显示 5 条）-->
          <v-list v-else lines="two" class="py-0" max-height="340" style="overflow-y:auto">
            <v-list-item
              v-for="notif in notificationsList.slice(0, 5)"
              :key="notif.id"
              :title="notif.title"
              :subtitle="notif.content ?? notif.time ?? notif.createdAt ?? ''"
              :class="(notif.isRead || notif.read) ? 'opacity-70' : 'font-weight-medium'"
              rounded="0"
            >
              <template #prepend>
                <v-avatar
                  :color="getNotifMeta(notif.type).color"
                  size="36"
                  class="text-white mr-3"
                >
                  <v-icon size="18">{{ getNotifMeta(notif.type).icon }}</v-icon>
                </v-avatar>
              </template>
              <template #append>
                <v-icon
                  v-if="!(notif.isRead || notif.read)"
                  size="8"
                  color="error"
                  class="ml-1"
                >mdi-circle</v-icon>
              </template>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>

          <!-- 底部操作区 -->
          <v-card-actions class="pa-2 gap-2">
            <v-btn
              v-if="isLoggedIn && unreadCount > 0"
              size="small"
              variant="tonal"
              color="primary"
              class="flex-1 text-none"
              prepend-icon="mdi-check-all"
              @click="markNotificationsRead()"
            >
              {{ $t('app.uiText.page.notificationsMarkAllBtn') }}
            </v-btn>
            <v-spacer v-if="isLoggedIn && unreadCount > 0"></v-spacer>
            <v-btn
              v-if="isLoggedIn"
              size="small"
              variant="text"
              color="primary"
              class="text-none"
              append-icon="mdi-arrow-right"
              :to="'/notifications'"
            >
              {{ $t('user.viewAll') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <!-- 用户信息菜单 -->
      <v-menu v-if="isLoggedIn" min-width="200px" rounded="lg">
        <template #activator="{ props }">
          <v-avatar v-bind="props" class="cursor-pointer hover-scale border-avatar" size="40">
            <v-img :src="`https://nmsr.nickac.dev/face/${currentUser?.username || 'Steve'}`" :alt="$t('app.uiText.page.authAvatarAlt')"></v-img>
          </v-avatar>
        </template>
        <v-card class="border">
          <v-card-text>
            <div class="mx-auto text-center py-2">
              <v-avatar size="64" class="mb-2 rounded-lg" color="transparent" style="overflow: visible;">
                <v-img :src="`https://nmsr.nickac.dev/face/${currentUser?.username || 'Steve'}`" :alt="$t('app.uiText.page.authAvatarAlt')"></v-img>
              </v-avatar>
              <h3 class="font-weight-bold">{{ currentUser?.username }}</h3>
              <v-chip size="x-small" :color="isAdmin ? 'secondary' : 'default'" class="mt-2" variant="tonal">{{ userRoleLabel }}</v-chip>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" prepend-icon="mdi-account-cog" block class="justify-start" to="/account">
                {{ $t('user.profile') }}
              </v-btn>
              <v-btn rounded variant="text" prepend-icon="mdi-logout" color="error" block class="justify-start" @click="handleLogout">
                {{ $t('app.uiText.page.authLogoutBtn') }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>

      <!-- 未登录时的登录按钮 -->
      <v-btn
        v-else
        to="/account"
        color="primary"
        variant="elevated"
        rounded
        class="font-weight-bold ml-2 text-none"
        prepend-icon="mdi-login"
      >
        {{ $t('app.uiText.page.authLoginBtn') }}
      </v-btn>
    </v-app-bar>

    <!-- 主体视图区域 -->
    <v-main class="bg-main-view">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <!-- 右侧设置面板抽屉 -->
    <v-navigation-drawer
      id="settings-drawer"
      v-model="settingsDrawer"
      location="right"
      temporary
      touchless
      disable-route-watcher
      :width="xs ? '280' : '350'"
      elevation="0"
      class="border-s blur-drawer"
    >
      <!-- 标题和关闭按钮 -->
      <v-toolbar :title="$t('app.settingsTitle')" flat class="flex-shrink-0 border-b">
        <template #append>
          <v-btn
            icon
            variant="text"
            @click.stop="settingsDrawer = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-toolbar>

      <!-- 中间内容滚动区 -->
      <div class="pa-4 overflow-y-auto flex-grow-1">
        <!-- 主题设置区 -->
        <div class="mb-2">
          <div class="d-flex mb-3 w-100">
            <div class="flex-grow-1 flex-shrink-1">
              <v-label class="mb-1 font-weight-medium text-body-1" style="opacity: 0.9;">{{ $t('app.theme') }}</v-label>
              <v-messages :messages="$t('app.themeDesc')" active style="opacity: 0.6;" />
            </div>
          </div>
          
          <v-radio-group
            :model-value="themeName"
            @update:model-value="setTheme"
            class="mb-2"
            color="primary"
            true-icon="mdi-check-circle-outline"
            hide-details
          >
            <v-radio
              v-for="t in themeOptions"
              :key="t.value"
              :value="t.value"
              class="mb-1"
            >
              <template #label>
                <v-icon :icon="t.icon" start class="me-2" />
                {{ $t(t.labelKey) }}
              </template>
            </v-radio>
          </v-radio-group>
        </div>

        <v-divider class="mt-4 mb-3"></v-divider>

        <!-- 语言设置区 -->
        <div class="mb-2">
          <div class="d-flex mb-3 w-100">
            <div class="flex-grow-1 flex-shrink-1">
              <v-label class="mb-1 font-weight-medium text-body-1" style="opacity: 0.9;">{{ $t('app.language') }}</v-label>
              <v-messages :messages="$t('app.languageDesc')" active style="opacity: 0.6;" />
            </div>
          </div>
          
          <v-radio-group
            v-model="currentLocale"
            class="mb-2"
            color="primary"
            true-icon="mdi-check-circle-outline"
            hide-details
          >
            <v-radio
              value="zh"
              class="mb-1"
            >
              <template #label>
                <v-icon icon="mdi-translate" start class="me-2" />
                {{ $t('app.langZh') }}
              </template>
            </v-radio>
            <v-radio
              value="en"
              class="mb-1"
            >
              <template #label>
                <v-icon icon="mdi-translate" start class="me-2" />
                {{ $t('app.langEn') }}
              </template>
            </v-radio>
          </v-radio-group>
        </div>

        <v-divider class="mt-4 mb-3"></v-divider>

        <!-- API 基础连接设置区 -->
        <div class="mb-2">
          <div class="d-flex mb-3 w-100">
            <div class="flex-grow-1 flex-shrink-1">
              <v-label class="mb-1 font-weight-medium text-body-1" style="opacity: 0.9;">API 基础连接设置</v-label>
              <v-messages messages="查看并管理当前客户端对接 of 后端 API 接口路径。" active style="opacity: 0.6;" />
            </div>
          </div>
          
          <v-text-field
            v-model="inputBaseUrl"
            label="API 基础路径"
            placeholder="http://127.0.0.1:8819/api"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="primary"
            prepend-inner-icon="mdi-web"
            class="mb-3"
            :disabled="testingConnection"
            hide-details
          ></v-text-field>

          <v-row dense>
            <v-col cols="8">
              <v-btn
                color="primary"
                variant="flat"
                block
                rounded="lg"
                class="font-weight-bold text-caption text-none"
                height="38"
                prepend-icon="mdi-content-save-outline"
                :loading="testingConnection"
                :disabled="testingConnection"
                @click="saveBaseUrl"
              >
                测试并保存
              </v-btn>
            </v-col>
            <v-col cols="4">
              <v-btn
                color="error"
                variant="tonal"
                block
                rounded="lg"
                class="font-weight-bold text-caption text-none"
                height="38"
                prepend-icon="mdi-trash-can-outline"
                :disabled="testingConnection"
                @click="deleteBaseUrl"
              >
                清除
              </v-btn>
            </v-col>
          </v-row>

          <p class="text-xxs text-medium-emphasis mt-3 pl-1 leading-normal d-flex align-start">
            <v-icon size="12" color="medium-emphasis" class="mr-1 mt-0_5">mdi-information-outline</v-icon>
            <span>修改或清除 API 地址后，系统将会自动退出当前账号并重载页面以重新初始化服务连接。</span>
          </p>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- API Base URL Dialog -->
    <v-dialog v-model="showBaseUrlDialog" persistent max-width="500">
      <v-card class="rounded-xl pa-4">
        <v-card-title class="text-h6 font-weight-bold d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-link-variant</v-icon>
          配置 API 服务地址
        </v-card-title>
        <v-card-text class="pt-2">
          <p class="text-body-2 text-medium-emphasis mb-4">
            系统检测到当前尚未配置 API 基础路径，请输入您的 WebShopX 后端 API 服务地址（例如：<code>http://127.0.0.1:8819/api</code>）：
          </p>
          <v-text-field
            v-model="inputBaseUrl"
            label="API 基础路径"
            placeholder="http://127.0.0.1:8819/api"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="primary"
            :rules="[v => !!v || 'API 路径不能为空']"
            hide-details="auto"
            :disabled="testingConnection"
          ></v-text-field>
          <v-alert
            v-if="testErrorMsg"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mt-4 text-caption rounded-lg"
          >
            {{ testErrorMsg }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-6 pb-4">
          <v-btn
            color="primary"
            variant="flat"
            block
            rounded="lg"
            class="font-weight-bold text-none"
            :disabled="!inputBaseUrl"
            :loading="testingConnection"
            @click="saveBaseUrl"
          >
            测试连接并保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 全局 SnackBar 提示通知 -->
    <v-snackbar
      v-model="appSnackbar"
      :color="appSnackbarColor"
      timeout="3000"
      rounded="lg"
      elevation="4"
    >
      <div class="d-flex align-center font-weight-bold">
        <v-icon class="mr-2" size="20">
          {{ appSnackbarColor === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline' }}
        </v-icon>
        <span>{{ appSnackbarText }}</span>
      </div>
      <template #actions>
        <v-btn variant="text" icon="mdi-close" @click="appSnackbar = false"></v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, onMounted } from 'vue'
  import axios from 'axios'
  import { useTheme, useDisplay } from 'vuetify'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import {
    isLoggedIn,
    currentUser,
    isAdmin,
    userRoleLabel,
    logoutUser,
    shopCoin,
    gameCoin,
    unreadCount,
    notificationsList,
    refreshWallet,
    refreshUnreadCount,
    refreshNotifications,
    markNotificationsRead,
    shopCoinShort,
    gameCoinShort,
    refreshCurrencyMeta,
  } from '@/api/authStore'

  const vuetifyTheme = useTheme()
  const { mdAndUp, xs } = useDisplay()
  const { locale, t } = useI18n()
  const router = useRouter()

  const handleLogout = async () => {
    await logoutUser()
    router.push('/account')
  }

  // 状态变量
  const drawer = ref(mdAndUp.value)
  const rail = ref(false)
  const settingsDrawer = ref(false)
  const notifMenuOpen = ref(false)
  const showBaseUrlDialog = ref(false)
  const inputBaseUrl = ref(localStorage.getItem('webshopx_api_base_url') || '')
  const testingConnection = ref(false)
  const testErrorMsg = ref('')

  // 全局 SnackBar 提示状态
  const appSnackbar = ref(false)
  const appSnackbarText = ref('')
  const appSnackbarColor = ref('success')

  const showAppSnackbar = (text: string, color: string = 'success') => {
    appSnackbarText.value = text
    appSnackbarColor.value = color
    appSnackbar.value = true
  }

  const saveBaseUrl = async () => {
    if (!inputBaseUrl.value.trim()) {
      testErrorMsg.value = 'API 路径不能为空'
      showAppSnackbar('API 路径不能为空', 'error')
      return
    }
    
    const oldUrl = localStorage.getItem('webshopx_api_base_url') || ''
    const cleanUrl = inputBaseUrl.value.trim().replace(/\/$/, '')
    if (oldUrl === cleanUrl) {
      testErrorMsg.value = 'API 基础路径与原配置一致，未发生更改。'
      showAppSnackbar('API 路径与原配置一致，未发生更改。', 'warning')
      return
    }

    testingConnection.value = true
    testErrorMsg.value = ''
    try {
      const testRes = await axios.get(`${cleanUrl}/meta/currency`, { timeout: 5000 })
      if (testRes.status >= 200 && testRes.status < 400) {
        localStorage.setItem('webshopx_api_base_url', cleanUrl)
        showAppSnackbar('连接测试成功！已保存配置并退出账号，页面即将重载...', 'success')
        if (isLoggedIn.value) {
          await logoutUser()
        }
        setTimeout(() => {
          window.location.reload()
        }, 1200)
      } else {
        testErrorMsg.value = '连接测试失败，服务响应异常。'
        showAppSnackbar('API 连接测试失败，服务响应异常。', 'error')
      }
    } catch (err: any) {
      testErrorMsg.value = '连接测试失败，请检查服务是否开启或地址是否正确。'
      showAppSnackbar('API 连接测试失败，请检查服务是否开启或地址是否正确。', 'error')
    } finally {
      testingConnection.value = false
    }
  }

  const deleteBaseUrl = async () => {
    localStorage.removeItem('webshopx_api_base_url')
    showAppSnackbar('已成功清除 API 配置并退出当前账号，页面即将重载...', 'success')
    if (isLoggedIn.value) {
      await logoutUser()
    }
    setTimeout(() => {
      window.location.reload()
    }, 1200)
  }

  // 铃铛菜单打开时拉取最新通知（含已读标记）
  async function onNotifMenuOpen(val: boolean) {
    notifMenuOpen.value = val
    if (val && isLoggedIn.value) {
      await refreshNotifications()
    }
  }

  // 语言响应式双向绑定
  const currentLocale = computed({
    get: () => locale.value,
    set: (val) => {
      locale.value = val
      localStorage.setItem('webshopx_locale', val)
    }
  })

  watch(locale, (val) => {
    localStorage.setItem('webshopx_locale', val)
  })

  // 自动响应侧边栏折叠
  watch(mdAndUp, (val) => {
    drawer.value = val
  })

  // 登录后立即拉取未读数；登出后清空
  watch(isLoggedIn, (val) => {
    if (val) refreshUnreadCount()
  }, { immediate: true })

  // 轮询：每 60 秒刷新一次未读数
  onMounted(() => {
    const currentBaseUrl = localStorage.getItem('webshopx_api_base_url') || ''
    if (!currentBaseUrl) {
      showBaseUrlDialog.value = true
      return
    }

    refreshCurrencyMeta()
    if (isLoggedIn.value) {
      refreshWallet()
    }
    const timer = setInterval(() => {
      if (isLoggedIn.value) refreshUnreadCount()
    }, 60_000)
    // 组件销毁时清除（App.vue 生命周期等同于整个应用）
    // 此处简单存储 timer 无需 onUnmounted
    void timer
  })

  // 页面配置设置
  // 主题配置
  const themeOptions = [
    { labelKey: 'app.themeLight', value: 'light', icon: 'mdi-weather-sunny' },
    { labelKey: 'app.themeDark', value: 'dark', icon: 'mdi-weather-night' },
    { labelKey: 'app.themePurple', value: 'blackguard', icon: 'mdi-shield-crown-outline' },
    { labelKey: 'app.themeSakura', value: 'midnightSakura', icon: 'mdi-flower-tulip-outline' },
  ]

  function setTheme(name: string | null) {
    if (name) {
      vuetifyTheme.global.name.value = name
      localStorage.setItem('webshopx_theme', name)
    }
  }

  watch(() => vuetifyTheme.global.name.value, (name) => {
    localStorage.setItem('webshopx_theme', name)
  })

  // 玩家前台菜单 (路由匹配 + query 参数 tab 标记)
  const playerMenuItems = computed(() => [
    { title: t('app.uiText.page.navAuth'), icon: 'mdi-account-circle-outline', to: '/account' },
    { title: t('app.uiText.page.navShop'), icon: 'mdi-shopping-outline', to: '/shop' },
    { title: t('app.uiText.page.navMarket'), icon: 'mdi-storefront-outline', to: '/market' },
    { title: t('app.uiText.page.navAuction'), icon: 'mdi-gavel', to: '/auction' },
    { title: t('app.uiText.page.navLeaderboard'), icon: 'mdi-trophy-outline', to: '/leaderboard' },
    { title: t('app.uiText.marketSection.direct.mineBtn') || '我的上架', icon: 'mdi-tag-text-outline', to: '/listings' },
    { title: t('app.uiText.page.ordersTitle') || '我的订单', icon: 'mdi-history', to: '/orders' },
  ])

  // 管理后台菜单 (路由匹配 + query 参数 tab 标记)
  const adminMenuItems = computed(() => [
    { title: t('admin.uiText.page.navOverview'), icon: 'mdi-view-dashboard-outline', to: '/admin/overview' },
    { title: t('admin.uiText.page.navCommerce'), icon: 'mdi-package-variant-closed', to: '/admin/commerce' },
    { title: t('admin.uiText.page.navMarket'), icon: 'mdi-security', to: '/admin/market' },
    { title: t('admin.uiText.page.navUsers'), icon: 'mdi-account-cog-outline', to: '/admin/users' },
    { title: t('admin.uiText.page.navSystem'), icon: 'mdi-cog-outline', to: '/admin/system' },
  ])

  // 通知类型 -> 图标/颜色映射
  function getNotifMeta(type?: string) {
    const map: Record<string, { icon: string; color: string }> = {
      ORDER:   { icon: 'mdi-cart-check',           color: 'success' },
      MARKET:  { icon: 'mdi-storefront-outline',   color: 'primary' },
      AUCTION: { icon: 'mdi-gavel',                color: 'deep-purple' },
      SYSTEM:  { icon: 'mdi-bell-ring-outline',    color: 'warning' },
      ADMIN:   { icon: 'mdi-shield-account-outline', color: 'error' },
      DELIVER: { icon: 'mdi-package-variant-closed', color: 'teal' },
    }
    return map[type ?? ''] ?? { icon: 'mdi-bell-outline', color: 'info' }
  }

  // 主题名称与图标
  const themeName = computed(() => vuetifyTheme.global.name.value)

  const themeIcon = computed(() => {
    if (themeName.value === 'light') return 'mdi-weather-sunny'
    if (themeName.value === 'dark') return 'mdi-weather-night'
    if (themeName.value === 'midnightSakura') return 'mdi-flower-tulip-outline'
    return 'mdi-shield-crown-outline'
  })

  function toggleTheme() {
    const current = vuetifyTheme.global.name.value
    if (current === 'light') {
      setTheme('dark')
    } else if (current === 'dark') {
      setTheme('blackguard')
    } else if (current === 'blackguard') {
      setTheme('midnightSakura')
    } else {
      setTheme('light')
    }
  }
</script>

<style>
  /* 谷歌字体导入 */
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  /* 全局现代排版 */
  .v-application {
    font-family: 'Outfit', 'Segoe UI', system-ui, -apple-system, sans-serif !important;
  }

  /* 渐变标题文本 */
  .bg-gradient-text {
    background: linear-gradient(135deg, #1867c0 0%, #5cbbf6 50%, #e57373 100%);
    -webkit-background-clip: text;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800 !important;
    letter-spacing: -0.5px;
  }

  .v-theme--dark .bg-gradient-text,
  .v-theme--blackguard .bg-gradient-text {
    background: linear-gradient(135deg, #2196f3 0%, #ff4081 50%, #e7810d 100%);
    -webkit-background-clip: text;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .v-theme--midnightSakura .bg-gradient-text {
    background: linear-gradient(135deg, #ff79c6 0%, #bd93f9 50%, #8be9fd 100%);
    -webkit-background-clip: text;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* 磨砂玻璃轻奢效果 */
  .blur-drawer {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(12px) !important;
  }

  .blur-drawer .v-navigation-drawer__content {
    overflow-y: hidden !important;
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
  }

  .v-theme--dark .blur-drawer {
    background: rgba(30, 30, 30, 0.95) !important;
    backdrop-filter: blur(12px) !important;
  }

  .v-theme--blackguard .blur-drawer {
    background: rgba(15, 12, 36, 0.95) !important;
    backdrop-filter: blur(12px) !important;
  }

  .v-theme--midnightSakura .blur-drawer {
    background: rgba(13, 11, 33, 0.95) !important;
    backdrop-filter: blur(12px) !important;
  }

  .blur-bar {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: blur(12px) !important;
  }

  .v-theme--dark .blur-bar {
    background: rgba(30, 30, 30, 0.95) !important;
    backdrop-filter: blur(12px) !important;
  }

  .v-theme--blackguard .blur-bar {
    background: rgba(15, 12, 36, 0.95) !important;
    backdrop-filter: blur(12px) !important;
  }

  .v-theme--midnightSakura .blur-bar {
    background: rgba(13, 11, 33, 0.95) !important;
    backdrop-filter: blur(12px) !important;
  }

  /* 背景微色彩 */
  .bg-main-view {
    background: #fafafa !important;
    transition: background 0.3s ease;
  }

  .v-theme--dark .bg-main-view {
    background: #474747 !important;
  }

  .v-theme--blackguard .bg-main-view {
    background: #0f0c24 !important;
  }

  .v-theme--midnightSakura .bg-main-view {
    background: #0d0b21 !important;
  }

  /* 路由渐变切换 */
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: all 0.3s ease-in-out;
  }
  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(12px);
  }
  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-12px);
  }

  /* M3 药丸激活样式 */
  .m3-active-item {
    background-color: rgba(var(--v-theme-primary), 0.1) !important;
    color: rgb(var(--v-theme-primary)) !important;
    font-weight: 600 !important;
  }

  /* 悬浮侧滑微动特效 */
  .nav-item-hover {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .nav-item-hover:hover:not(.v-list-item--active) {
    transform: translateX(4px);
    background-color: rgba(var(--v-theme-primary), 0.05) !important;
    color: rgb(var(--v-theme-primary)) !important;
  }

  .hover-scale {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hover-scale:hover {
    transform: scale(1.08);
  }

  /* 顶栏经济资产背景框微调 */
  .bg-chip {
    background: rgba(var(--v-theme-primary), 0.03) !important;
    border-width: 1px !important;
    transition: all 0.3s ease;
  }
  .bg-chip:hover {
    background: rgba(var(--v-theme-primary), 0.08) !important;
    transform: translateY(-1px);
  }

  .border-avatar {
    border: 2px solid rgb(var(--v-theme-primary));
  }

  .cursor-pointer {
    cursor: pointer;
  }

  .brand-item {
    cursor: pointer;
    transition: padding 0.2s ease, min-height 0.2s ease;
  }

  .v-navigation-drawer--rail .brand-item {
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    min-height: 56px !important;
    height: 56px !important;
  }

  .settings-switch {
    align-items: center;
    margin: 0 !important;
  }

  .settings-switch .v-label {
    margin-bottom: 0;
  }

  /* 阻止表格换行，实现纯粹的横向滚动（完美适配中等屏幕防止文字竖排） */
  .v-table th,
  .v-table td {
    white-space: nowrap !important;
  }

  /* 极致奢华全局自适应玻璃卡片，完全适配所有主题与深浅色调，杜绝硬编码颜色 */
  .glass-card {
    background: rgba(var(--v-theme-surface), 0.65) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
    transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  /* 表单/区域自适应柔和浅底，杜绝写死 bg-white 或 bg-grey-lighten */
  .bg-light-soft {
    background-color: rgba(var(--v-theme-on-surface), 0.03) !important;
  }

  /* 表格页眉自适应高亮 */
  .bg-table-header {
    background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
  }

  /* 表格行悬停柔和交互 */
  .hover-bg-row {
    transition: all 0.2s ease;
  }
  .hover-bg-row:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
  }

  /* 卡片悬停微浮与边缘极光发散 */
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(var(--v-theme-on-surface), 0.06), 
                0 0 1px 1px rgba(var(--v-theme-primary), 0.15) !important;
  }

  /* 顶层模块高亮卡片背景 */
  .header-card {
    background: linear-gradient(135deg, rgba(var(--v-theme-success), 0.08) 0%, rgba(var(--v-theme-surface), 0.95) 100%) !important;
    border: 1px solid rgba(var(--v-theme-success), 0.15) !important;
  }

  /* 全局微小字号 */
  .text-xxs {
    font-size: 0.7rem !important;
  }

  /* 全局等宽字体 */
  .font-mono {
    font-family: monospace !important;
  }

  /* 全局虚线边框 */
  .border-dashed {
    border: 1px dashed rgba(var(--v-theme-on-surface), 0.15) !important;
  }

  /* 全局渐显动画 */
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

