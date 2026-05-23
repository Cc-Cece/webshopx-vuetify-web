<template>
  <admin-gate>
    <v-container fluid class="pa-6 animate-fade-in">
      <!-- Title Header Card -->
      <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 mb-6 glass-card header-card">
        <div class="d-flex align-center flex-wrap">
          <v-avatar color="warning-lighten-5" size="52" class="mr-4 my-2">
            <v-icon color="warning" size="28">mdi-shield-crown-outline</v-icon>
          </v-avatar>
          <div class="my-2">
            <h2 class="text-h5 font-weight-black text-slate-800">{{ $t('admin.uiText.page.headerTitle') }}</h2>
            <p class="text-caption text-medium-emphasis mt-1">
              欢迎回来，管理员！请在下方选择需要进入的子管理系统，或在侧边导航栏快速切换。
            </p>
          </div>
        </div>
      </v-card>

      <!-- Submodules Grid -->
      <v-row>
        <v-col
          v-for="item in moduleCards"
          :key="item.to"
          cols="12"
          sm="6"
          md="4"
          class="d-flex"
        >
          <v-card
            elevation="0"
            variant="outlined"
            :to="item.to"
            class="rounded-xl pa-5 glass-card hover-lift flex-grow-1 d-flex flex-column justify-space-between border-hover-active"
            :style="`border-top: 4px solid ${item.hexColor} !important;`"
          >
            <div>
              <div class="d-flex align-center mb-4">
                <v-avatar :color="item.avatarColor" size="44" class="mr-3">
                  <v-icon :color="item.color" size="22">{{ item.icon }}</v-icon>
                </v-avatar>
                <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ item.title }}</h3>
              </div>
              <p class="text-caption text-medium-emphasis leading-relaxed">
                {{ item.desc }}
              </p>
            </div>

            <v-btn
              variant="tonal"
              :color="item.color"
              block
              height="36"
              rounded="lg"
              class="mt-5 font-weight-bold text-none text-caption"
              append-icon="mdi-arrow-right"
            >
              进入管理
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </admin-gate>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminGate from '@/components/AdminGate.vue'

const { t } = useI18n()

const moduleCards = computed(() => [
  {
    title: t('admin.uiText.page.navOverview'),
    desc: '系统核心指标监控大盘，支持发布全局富文本公告通知、兑换码生成器、单账户限次卡券发行，以及深度审计日志记录溯源。',
    icon: 'mdi-view-dashboard-outline',
    to: '/admin/overview',
    color: 'primary',
    hexColor: '#1867c0',
    avatarColor: 'primary-lighten-5'
  },
  {
    title: t('admin.uiText.page.navCommerce'),
    desc: '官方 B2C 商品上架管理。支持指令、物品材质、药水效果配置，提供专属商品图标裁剪上传、动态经济定价算法以及团购核销台。',
    icon: 'mdi-package-variant-closed',
    to: '/admin/commerce',
    color: 'success',
    hexColor: '#4caf50',
    avatarColor: 'success-lighten-5'
  },
  {
    title: t('admin.uiText.page.navMarket'),
    desc: 'C2C 玩家在售挂单及拍卖交易审查。包含交易方向、拒绝币种等上架门槛限制（可视化表单+JSON双轨），以及材质对照字典映射。',
    icon: 'mdi-security',
    to: '/admin/market',
    color: 'warning',
    hexColor: '#fb8c00',
    avatarColor: 'warning-lighten-5'
  },
  {
    title: t('admin.uiText.page.navUsers'),
    desc: '玩家账号检索中心（支持绑定 UUID、密码修改、下线）。内嵌高精度 SC/GC 钱包余额调账机制，以及子管理权限分级策略设定。',
    icon: 'mdi-account-cog-outline',
    to: '/admin/users',
    color: 'info',
    hexColor: '#2196f3',
    avatarColor: 'info-lighten-5'
  },
  {
    title: t('admin.uiText.page.navSystem'),
    desc: '全局双向兑换开关、兑换比例与手续费率策略设置。涵盖 Vault 健康检查、广播通知模板、时区、维护任务与语言主题包下载管理。',
    icon: 'mdi-cog-outline',
    to: '/admin/system',
    color: 'secondary',
    hexColor: '#9c27b0',
    avatarColor: 'secondary-lighten-5'
  }
])
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

.hover-lift {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08) !important;
}

.border-hover-active {
  transition: border-color 0.25s ease;
}
.border-hover-active:hover {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.text-slate-800 {
  color: #1e293b;
}
.v-theme--dark .text-slate-800,
.v-theme--blackguard .text-slate-800,
.v-theme--midnightSakura .text-slate-800 {
  color: #f1f5f9;
}

.leading-relaxed {
  line-height: 1.625;
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
