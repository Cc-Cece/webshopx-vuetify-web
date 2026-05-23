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
              color="info"
              density="comfortable"
              class="rounded-lg bg-grey-lighten-4 pa-1"
            >
              <v-tab value="player" prepend-icon="mdi-account-details-outline" class="rounded-lg font-weight-bold text-caption">{{ $t('admin.uiText.tabLabelUsers') }}</v-tab>
              <v-tab value="admins" prepend-icon="mdi-shield-account-outline" class="rounded-lg font-weight-bold text-caption">{{ $t('admin.uiText.tabLabelAdmins') }}</v-tab>
            </v-tabs>
          </v-col>
        </v-row>
      </v-card>

      <!-- Tabs Contents -->
      <v-window v-model="activeTab">
        <!-- Player Management Tab -->
        <v-window-item value="player">
          <v-row>
            <!-- Player Search & Control Board -->
            <v-col cols="12" md="6">
              <!-- Search Card -->
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-info-light">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-2">{{ $t('admin.uiText.autoHtml.k0423') }}</h3>
                <p class="text-caption text-medium-emphasis mb-4">{{ $t('admin.uiText.autoHtml.k0424') }}</p>

                <v-form ref="lookupFormRef" @submit.prevent="handleLookupUser">
                  <v-row dense class="align-center">
                    <v-col cols="12" sm="8">
                      <v-text-field
                        v-model="lookupQuery"
                        :label="$t('admin.uiText.autoHtml.k0425')"
                        :placeholder="$t('admin.uiText.autoHtml.k0426')"
                        prepend-inner-icon="mdi-account-search-outline"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="info"
                        hide-details
                        class="mb-3"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-btn
                        type="submit"
                        color="info"
                        variant="flat"
                        block
                        height="44"
                        rounded="lg"
                        class="font-weight-black text-caption text-none"
                        prepend-icon="mdi-magnify"
                        :loading="lookupLoading"
                      >
                        {{ $t('admin.uiText.autoHtml.k0427') }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card>

              <!-- Profile Details Card (if loaded) -->
              <v-expand-transition>
                <v-card v-if="selectedUser" elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-info-light">
                  <div class="d-flex align-center justify-between mb-4 flex-wrap">
                    <div class="d-flex align-center">
                      <v-avatar size="44" color="info-lighten-5" class="mr-3">
                        <v-img :src="`https://minotar.net/avatar/${selectedUser.username || 'MHF_Steve'}/44`"></v-img>
                      </v-avatar>
                      <div>
                        <h4 class="text-subtitle-2 font-weight-black text-slate-800">{{ selectedUser.nickname || selectedUser.username }}</h4>
                        <div class="text-caption text-medium-emphasis font-mono text-xxs">UID: #{{ selectedUser.id }}</div>
                      </div>
                    </div>
                    <v-chip size="x-small" :color="selectedUser.uuid ? 'success' : 'warning'" variant="tonal" class="font-weight-bold my-2">
                      {{ selectedUser.uuid ? '已绑定 UUID' : '未绑定 UUID' }}
                    </v-chip>
                  </div>

                  <v-list class="bg-transparent pa-0 text-caption">
                    <v-list-item class="px-0 py-2 border-b-dashed">
                      <v-list-item-title class="text-caption text-medium-emphasis">用户名 / 邮箱</v-list-item-title>
                      <template #append>
                        <span class="font-weight-bold text-slate-800 font-mono">{{ selectedUser.username }} / {{ selectedUser.email || '--' }}</span>
                      </template>
                    </v-list-item>
                    <v-list-item class="px-0 py-2 border-b-dashed">
                      <v-list-item-title class="text-caption text-medium-emphasis">Minecraft UUID</v-list-item-title>
                      <template #append>
                        <span class="font-weight-bold text-slate-800 font-mono text-xs">{{ selectedUser.uuid || '未绑定' }}</span>
                      </template>
                    </v-list-item>
                    <v-list-item class="px-0 py-2 border-b-dashed">
                      <v-list-item-title class="text-caption text-medium-emphasis">游戏在线状态</v-list-item-title>
                      <template #append>
                        <v-chip size="x-small" :color="selectedUser.online ? 'success' : 'grey'" variant="flat" class="font-weight-bold">
                          {{ selectedUser.online ? '在线' : '离线' }}
                        </v-chip>
                      </template>
                    </v-list-item>
                    <v-list-item class="px-0 py-2 border-b-dashed">
                      <v-list-item-title class="text-caption text-medium-emphasis">账户 SC 网页币余额</v-list-item-title>
                      <template #append>
                        <span class="font-weight-black text-info text-subtitle-2">{{ selectedUser.shopCoin }} SC</span>
                      </template>
                    </v-list-item>
                    <v-list-item class="px-0 py-2 border-b-dashed">
                      <v-list-item-title class="text-caption text-medium-emphasis">游戏 GC 游戏币余额</v-list-item-title>
                      <template #append>
                        <span class="font-weight-black text-warning text-subtitle-2">{{ selectedUser.gameCoin }} GC</span>
                      </template>
                    </v-list-item>
                  </v-list>

                  <!-- Account Operation Buttons -->
                  <h4 class="text-caption font-weight-black text-slate-800 mb-3 mt-4">{{ $t('admin.uiText.autoHtml.k0429') }}</h4>
                  <v-row dense class="mb-4">
                    <v-col cols="6" sm="3">
                      <v-btn color="warning" variant="tonal" rounded="lg" block size="small" class="font-weight-bold text-caption" prepend-icon="mdi-link-off" @click="confirmUnbind">
                        {{ $t('admin.uiText.autoHtml.k0434') }}
                      </v-btn>
                    </v-col>
                    <v-col cols="6" sm="3">
                      <v-btn color="error" variant="tonal" rounded="lg" block size="small" class="font-weight-bold text-caption" prepend-icon="mdi-account-off-outline" @click="confirmForceLogout">
                        {{ $t('admin.uiText.autoHtml.k0435') }}
                      </v-btn>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-dialog v-model="resetPwdDialog" max-width="400" persistent class="glass-dialog">
                        <template #activator="{ props }">
                          <v-btn v-bind="props" color="primary" variant="tonal" rounded="lg" block size="small" class="font-weight-bold text-caption" prepend-icon="mdi-key-change">
                            修改账户密码
                          </v-btn>
                        </template>
                        <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card border-primary-top">
                          <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-2">强设账户密码</h3>
                          <p class="text-caption text-medium-emphasis mb-4">请输入该玩家的新密码（8-64位），提交后会强行改密并将其所有在线会话失效踢出。</p>
                          <v-text-field
                            v-model="newPassword"
                            type="password"
                            :label="$t('admin.uiText.autoHtml.k0431')"
                            :placeholder="$t('admin.uiText.autoHtml.k0432')"
                            variant="outlined"
                            density="comfortable"
                            rounded="lg"
                            color="primary"
                            class="mb-4"
                          ></v-text-field>
                          <div class="d-flex justify-end">
                            <v-btn color="secondary" variant="tonal" rounded="lg" class="mr-2 text-caption font-weight-bold" @click="resetPwdDialog = false">取消</v-btn>
                            <v-btn color="primary" variant="flat" rounded="lg" class="text-caption font-weight-bold" :loading="resetPwdLoading" @click="handleResetPassword">确认改密</v-btn>
                          </div>
                        </v-card>
                      </v-dialog>
                    </v-col>
                  </v-row>
                </v-card>
              </v-expand-transition>
            </v-col>

            <!-- Wallet Balancer & Custom Permissions -->
            <v-col cols="12" md="6">
              <!-- Wallet Balancer -->
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-info-light" :disabled="!selectedUser">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-1">极奢钱包调账台</h3>
                <p class="text-caption text-medium-emphasis mb-4">
                  <span v-if="!selectedUser" class="text-error font-weight-bold">请先在左侧输入用户名或在下方选择用户</span>
                  <span v-else>支持对网页币（SC）与游戏币（GC）正负值额度直接调账，充值/扣款级联实时保存。</span>
                </p>

                <v-form ref="walletFormRef" @submit.prevent="handleAdjustWallet">
                  <v-row dense>
                    <v-col cols="6">
                      <v-select
                        v-model="adjustCurrency"
                        :items="adjustCurrencyOptions"
                        :label="$t('admin.uiText.autoHtml.k0436')"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="info"
                        class="mb-3"
                      ></v-select>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model.number="adjustAmount"
                        type="number"
                        :label="$t('admin.uiText.autoHtml.k0439')"
                        placeholder="100 或 -50"
                        variant="outlined"
                        density="comfortable"
                        rounded="lg"
                        color="info"
                        class="mb-3"
                        :rules="[v => !!v || '请输入增减量']"
                        required
                      ></v-text-field>
                    </v-col>
                  </v-row>

                  <v-text-field
                    v-model="adjustReason"
                    :label="$t('admin.uiText.autoHtml.k0440')"
                    :placeholder="$t('admin.uiText.autoHtml.k0441')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="info"
                    class="mb-4"
                    :rules="[v => !!v || '请输入调账原因/备注']"
                    required
                  ></v-text-field>

                  <v-btn
                    type="submit"
                    color="info"
                    variant="flat"
                    block
                    height="44"
                    rounded="lg"
                    class="font-weight-black text-caption text-none"
                    prepend-icon="mdi-swap-vertical"
                    :loading="adjustLoading"
                  >
                    {{ $t('admin.uiText.autoHtml.k0442') }}
                  </v-btn>
                </v-form>
              </v-card>

              <!-- Custom Permissions override -->
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-info-light" :disabled="!selectedUser">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-1">个性特权策略覆盖</h3>
                <p class="text-caption text-medium-emphasis mb-4">
                  独立调整该玩家自定义材质译名、专属商品图标以及自定义图片图标上传的绕过权限。
                </p>

                <v-form ref="visualPermissionFormRef" @submit.prevent="handleSaveVisualPermissions">
                  <v-row dense>
                    <v-col cols="12" sm="4">
                      <v-select
                        v-model="visualPermission.customIconAllowed"
                        :items="permissionValueOptions"
                        :label="$t('admin.uiText.autoHtml.k0443')"
                        variant="outlined"
                        density="compact"
                        rounded="lg"
                        color="info"
                        class="mb-3"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-select
                        v-model="visualPermission.customNameAllowed"
                        :items="permissionValueOptions"
                        :label="$t('admin.uiText.autoHtml.k0447')"
                        variant="outlined"
                        density="compact"
                        rounded="lg"
                        color="info"
                        class="mb-3"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <v-select
                        v-model="visualPermission.uploadImageAllowed"
                        :items="permissionValueOptions"
                        :label="$t('admin.uiText.autoHtml.k0451')"
                        variant="outlined"
                        density="compact"
                        rounded="lg"
                        color="info"
                        class="mb-3"
                      ></v-select>
                    </v-col>
                  </v-row>

                  <v-text-field
                    v-model.number="visualPermission.maxListingsOverride"
                    type="number"
                    :label="$t('admin.uiText.autoHtml.k0455')"
                    :placeholder="$t('admin.uiText.autoHtml.k0456')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="info"
                    class="mb-4"
                  ></v-text-field>

                  <v-btn
                    type="submit"
                    color="info"
                    variant="flat"
                    block
                    height="44"
                    rounded="lg"
                    class="font-weight-black text-caption text-none"
                    prepend-icon="mdi-shield-lock-outline"
                    :loading="visualPermissionLoading"
                  >
                    {{ $t('admin.uiText.autoHtml.k0457') }}
                  </v-btn>
                </v-form>
              </v-card>
            </v-col>
          </v-row>

          <!-- Registered Users Table -->
          <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-info-light">
            <div class="d-flex align-center justify-between mb-4 flex-wrap">
              <div>
                <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.autoHtml.k0461') }}</h3>
                <p class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0462') }}</p>
              </div>

              <div class="d-flex align-center" style="max-width: 320px; width: 100%;">
                <v-text-field
                  v-model="usersSearch"
                  :label="$t('admin.uiText.autoHtml.k0464')"
                  :placeholder="$t('admin.uiText.autoHtml.k0465')"
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  color="info"
                  hide-details
                  class="mr-2"
                ></v-text-field>
                <v-btn
                  color="info"
                  variant="tonal"
                  icon
                  size="small"
                  :loading="usersLoading"
                  @click="handleLoadUsers"
                >
                  <v-icon>mdi-refresh</v-icon>
                </v-btn>
              </div>
            </div>

            <v-table class="bg-transparent text-caption rounded-xl overflow-hidden border">
              <thead>
                <tr class="bg-table-header text-slate-800 font-weight-black">
                  <th class="font-weight-bold">UID</th>
                  <th class="font-weight-bold">头像</th>
                  <th class="font-weight-bold">用户名 (Username)</th>
                  <th class="font-weight-bold">昵称</th>
                  <th class="font-weight-bold">绑定 UUID</th>
                  <th class="font-weight-bold">在线状态</th>
                  <th class="font-weight-bold">{{ shopCoinShort }} 余额</th>
                  <th class="font-weight-bold">{{ gameCoinShort }} 余额</th>
                  <th class="font-weight-bold text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="usersLoading">
                  <td colspan="9" class="text-center py-6">
                    <v-progress-circular indeterminate color="info" size="32"></v-progress-circular>
                    <div class="text-caption mt-2 text-medium-emphasis">加载注册玩家数据中...</div>
                  </td>
                </tr>
                <tr v-else-if="filteredUsers.length === 0">
                  <td colspan="9" class="text-center py-6 text-medium-emphasis">
                    {{ $t('admin.uiText.page.emptyState') }}
                  </td>
                </tr>
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="hover-bg-row cursor-pointer"
                  @click="loadUserIntoEditor(user)"
                >
                  <td class="font-mono font-weight-bold">#{{ user.id }}</td>
                  <td>
                    <v-avatar size="28" color="info-lighten-5">
                      <v-img :src="`https://minotar.net/avatar/${user.username || 'MHF_Steve'}/28`"></v-img>
                    </v-avatar>
                  </td>
                  <td class="font-mono">{{ user.username }}</td>
                  <td>{{ user.nickname || '--' }}</td>
                  <td class="font-mono text-xxs">{{ user.uuid || '未绑定' }}</td>
                  <td>
                    <v-chip size="x-small" :color="user.online ? 'success' : 'grey'" variant="tonal" class="font-weight-bold">
                      {{ user.online ? '在线' : '离线' }}
                    </v-chip>
                  </td>
                  <td class="font-weight-bold text-info">{{ user.shopCoin }} {{ shopCoinShort }}</td>
                  <td class="font-weight-bold text-warning">{{ user.gameCoin }} {{ gameCoinShort }}</td>
                  <td class="text-center">
                    <v-btn
                      color="info"
                      variant="tonal"
                      size="x-small"
                      rounded="lg"
                      class="font-weight-bold text-caption"
                      prepend-icon="mdi-import"
                    >
                      载入编辑
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-window-item>

        <!-- Sub-Admins Management Tab -->
        <v-window-item value="admins">
          <v-row>
            <!-- Admin Creator/Editor Form -->
            <v-col cols="12" md="4">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-info-light fill-height">
                <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-2">{{ $t('admin.uiText.autoHtml.k0468') }}</h3>
                <p class="text-caption text-medium-emphasis mb-4">{{ $t('admin.uiText.autoHtml.k0469') }}</p>

                <v-form ref="adminFormRef" v-model="adminValid" @submit.prevent="handleSaveAdmin">
                  <v-text-field
                    v-model="formAdmin.username"
                    :label="$t('admin.uiText.autoHtml.k0471')"
                    placeholder="用户名或 UUID"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="info"
                    class="mb-3 font-mono text-caption"
                    :rules="[v => !!v || '请输入管理员账号']"
                    :disabled="adminEditMode"
                    required
                  ></v-text-field>

                  <v-text-field
                    v-model="formAdmin.password"
                    type="password"
                    label="管理员密码"
                    placeholder="新密码（不修改请留空）"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="info"
                    class="mb-3"
                    :rules="adminEditMode ? [] : [v => !!v || '创建管理员必须设置密码']"
                  ></v-text-field>

                  <v-select
                    v-model="formAdmin.role"
                    :items="adminRoleOptions"
                    :label="$t('admin.uiText.autoHtml.k0477')"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    color="info"
                    class="mb-3"
                  ></v-select>

                  <h4 class="text-caption font-weight-black text-slate-800 mb-2 mt-4">子管理员模块授权范围</h4>
                  <div class="pa-3 bg-grey-lighten-4 rounded-xl border mb-4">
                    <v-checkbox
                      v-model="formAdmin.permissions"
                      value="Overview"
                      label="Dashboard 总览与审计"
                      color="info"
                      density="compact"
                      hide-details
                    ></v-checkbox>
                    <v-checkbox
                      v-model="formAdmin.permissions"
                      value="Commerce"
                      label="Commerce 商品管理"
                      color="info"
                      density="compact"
                      hide-details
                    ></v-checkbox>
                    <v-checkbox
                      v-model="formAdmin.permissions"
                      value="Market"
                      label="Market 交易审查"
                      color="info"
                      density="compact"
                      hide-details
                    ></v-checkbox>
                    <v-checkbox
                      v-model="formAdmin.permissions"
                      value="Users"
                      label="Users 玩家和钱包调账"
                      color="info"
                      density="compact"
                      hide-details
                    ></v-checkbox>
                    <v-checkbox
                      v-model="formAdmin.permissions"
                      value="System"
                      label="System 系统级参数及主题包"
                      color="info"
                      density="compact"
                      hide-details
                    ></v-checkbox>
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
                        @click="handleClearAdminEditor"
                      >
                        清空表单
                      </v-btn>
                    </v-col>
                    <v-col cols="6">
                      <v-btn
                        type="submit"
                        color="info"
                        variant="flat"
                        block
                        height="40"
                        rounded="lg"
                        class="font-weight-black text-caption"
                        :loading="saveAdminLoading"
                      >
                        {{ $t('admin.uiText.autoHtml.k0480') }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card>
            </v-col>

            <!-- Admin List -->
            <v-col cols="12" md="8">
              <v-card elevation="0" variant="outlined" class="rounded-xl pa-5 glass-card mb-6 border-info-light fill-height">
                <div class="d-flex align-center justify-between mb-4">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-black text-slate-800">{{ $t('admin.uiText.autoHtml.k0482') }}</h3>
                    <p class="text-caption text-medium-emphasis">{{ $t('admin.uiText.autoHtml.k0483') }}</p>
                  </div>
                  <v-btn
                    color="info"
                    variant="tonal"
                    size="small"
                    rounded="lg"
                    prepend-icon="mdi-refresh"
                    :loading="adminsLoading"
                    @click="handleLoadAdmins"
                  >
                    刷新管理员
                  </v-btn>
                </div>

                <v-table class="bg-transparent text-caption rounded-xl overflow-hidden border">
                  <thead>
                    <tr class="bg-table-header text-slate-800 font-weight-black">
                      <th class="font-weight-bold">管理员账号</th>
                      <th class="font-weight-bold">管理类型</th>
                      <th class="font-weight-bold">模块授权</th>
                      <th class="font-weight-bold">活性状态</th>
                      <th class="font-weight-bold text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="adminsLoading">
                      <td colspan="5" class="text-center py-6">
                        <v-progress-circular indeterminate color="info" size="32"></v-progress-circular>
                        <div class="text-caption mt-2 text-medium-emphasis">加载管理员列表中...</div>
                      </td>
                    </tr>
                    <tr v-else-if="admins.length === 0">
                      <td colspan="5" class="text-center py-6 text-medium-emphasis">
                        {{ $t('admin.uiText.page.emptyState') }}
                      </td>
                    </tr>
                    <tr
                      v-for="item in admins"
                      :key="item.username"
                      class="hover-bg-row"
                    >
                      <td class="font-mono font-weight-bold">{{ item.username }}</td>
                      <td>
                        <v-chip size="x-small" :color="item.role === 'SUPER' ? 'primary' : 'secondary'" variant="flat" class="font-weight-bold">
                          {{ item.role === 'SUPER' ? '超级管理员' : '子级管理员' }}
                        </v-chip>
                      </td>
                      <td style="max-width: 250px;">
                        <span v-if="item.role === 'SUPER'" class="text-primary font-weight-bold">拥有全部模块权限</span>
                        <div v-else class="d-flex flex-wrap gap-1">
                          <v-chip
                            v-for="perm in (item.permissions || [])"
                            :key="perm"
                            size="x-small"
                            color="info"
                            variant="tonal"
                            class="mr-1 my-0_5 font-weight-bold"
                          >
                            {{ perm }}
                          </v-chip>
                          <span v-if="!(item.permissions && item.permissions.length)" class="text-grey">未授权任何模块</span>
                        </div>
                      </td>
                      <td>
                        <settings-switch
                          v-model="item.active"
                          color="success"
                          density="compact"
                          hide-details
                          @change="handleToggleAdminActive(item)"
                        ></settings-switch>
                      </td>
                      <td class="text-center">
                        <v-btn
                          color="info"
                          variant="tonal"
                          size="x-small"
                          rounded="lg"
                          class="font-weight-bold text-caption mr-2"
                          prepend-icon="mdi-pencil-outline"
                          @click="handleEditAdmin(item)"
                        >
                          编辑
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

      <!-- Unbind confirmation dialog -->
      <v-dialog v-model="unbindDialog" max-width="450" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card text-center border-error-top">
          <v-avatar color="red-lighten-5" size="56" class="mx-auto mb-4">
            <v-icon color="error" size="30">mdi-link-off</v-icon>
          </v-avatar>
          <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-2">安全确认：解绑 Minecraft UUID？</h3>
          <p class="text-caption text-medium-emphasis mb-4 leading-relaxed">
            确认解绑该玩家的 Minecraft 角色绑定关联吗？解绑后，该玩家在游戏内发货及各种 C2C 限购比重加成将暂时失效，需要重新获取绑定链接完成验证。
          </p>
          <div class="d-flex justify-space-between mt-2">
            <v-btn color="secondary" variant="tonal" class="rounded-lg text-caption font-weight-bold width-45" @click="unbindDialog = false">
              取消
            </v-btn>
            <v-btn color="error" variant="flat" class="rounded-lg text-caption font-weight-bold width-45" :loading="unbindLoading" @click="handleUnbind">
              确认解绑
            </v-btn>
          </div>
        </v-card>
      </v-dialog>

      <!-- Force logout confirmation dialog -->
      <v-dialog v-model="logoutDialog" max-width="450" class="glass-dialog">
        <v-card elevation="0" variant="outlined" class="rounded-xl pa-4 glass-card text-center border-error-top">
          <v-avatar color="red-lighten-5" size="56" class="mx-auto mb-4">
            <v-icon color="error" size="30">mdi-account-off-outline</v-icon>
          </v-avatar>
          <h3 class="text-subtitle-1 font-weight-black text-slate-800 mb-2">安全确认：强制将其下线？</h3>
          <p class="text-caption text-medium-emphasis mb-4 leading-relaxed">
            这会强行失效该玩家在全站的 Token 会话密钥并即时将其踢出在线状态。常用于账号异常登录、异常指令调拨、或更改密码后的安全同步操作。
          </p>
          <div class="d-flex justify-space-between mt-2">
            <v-btn color="secondary" variant="tonal" class="rounded-lg text-caption font-weight-bold width-45" @click="logoutDialog = false">
              取消
            </v-btn>
            <v-btn color="error" variant="flat" class="rounded-lg text-caption font-weight-bold width-45" :loading="logoutLoading" @click="handleForceLogout">
              确认强踢
            </v-btn>
          </div>
        </v-card>
      </v-dialog>
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

const { t } = useI18n()

// Active tab switcher
const activeTab = ref<'player' | 'admins'>('player')

// SnackBar Toast Alert
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const showSnackbar = (text: string, color: string = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

// -------------------------------------------------------------
// TAB 1: PLAYER ACCOUNT PERSPECTIVE
// -------------------------------------------------------------
const lookupQuery = ref('')
const lookupLoading = ref(false)
const selectedUser = ref<any>(null)

// Registered User Table
const users = ref<any[]>([])
const usersLoading = ref(false)
const usersSearch = ref('')

// Four operation modals
const resetPwdDialog = ref(false)
const newPassword = ref('')
const resetPwdLoading = ref(false)

const unbindDialog = ref(false)
const unbindLoading = ref(false)

const logoutDialog = ref(false)
const logoutLoading = ref(false)

// Wallet balancer fields
const walletFormRef = ref<any>(null)
const adjustCurrency = ref<'SHOP_COIN' | 'GAME_COIN'>('SHOP_COIN')
const adjustAmount = ref<number | ''>('')
const adjustReason = ref('')
const adjustLoading = ref(false)

const adjustCurrencyOptions = computed(() => [
  { title: `${shopCoinName.value} (${shopCoinShort.value})`, value: 'SHOP_COIN' },
  { title: `${gameCoinName.value} (${gameCoinShort.value})`, value: 'GAME_COIN' }
])

// Custom visual permissions
const visualPermissionFormRef = ref<any>(null)
const visualPermissionLoading = ref(false)
const visualPermission = ref<any>({
  customIconAllowed: 'DEFAULT',
  customNameAllowed: 'DEFAULT',
  uploadImageAllowed: 'DEFAULT',
  maxListingsOverride: ''
})

const permissionValueOptions = [
  { title: '继承全局 (DEFAULT)', value: 'DEFAULT' },
  { title: '允许特权 (ALLOW)', value: 'ALLOW' },
  { title: '强行禁用 (DENY)', value: 'DENY' }
]

const handleLoadUsers = async () => {
  usersLoading.value = true
  try {
    const res = await adminApi.getUsersList()
    if (res && res.data) {
      users.value = res.data.list || res.data || []
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.loadFailed', { message: msg }), 'error')
  } finally {
    usersLoading.value = false
  }
}

const filteredUsers = computed(() => {
  let list = users.value
  if (usersSearch.value) {
    const q = usersSearch.value.trim().toLowerCase()
    list = list.filter(u => 
      String(u.id).includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.uuid || '').toLowerCase().includes(q) ||
      (u.nickname || '').toLowerCase().includes(q)
    )
  }
  return list
})

const loadUserIntoEditor = async (user: any) => {
  selectedUser.value = { ...user }
  lookupQuery.value = user.username
  
  // Also load visual permissions
  try {
    const res = await adminApi.getUserVisualPermission(user.id)
    if (res && res.data) {
      const data = res.data || {}
      visualPermission.value = {
        customIconAllowed: data.customIconAllowed || 'DEFAULT',
        customNameAllowed: data.customNameAllowed || 'DEFAULT',
        uploadImageAllowed: data.uploadImageAllowed || 'DEFAULT',
        maxListingsOverride: data.maxListingsOverride === null || data.maxListingsOverride === undefined ? '' : data.maxListingsOverride
      }
    }
  } catch (err: any) {
    visualPermission.value = {
      customIconAllowed: 'DEFAULT',
      customNameAllowed: 'DEFAULT',
      uploadImageAllowed: 'DEFAULT',
      maxListingsOverride: ''
    }
  }
}

const handleLookupUser = async () => {
  if (!lookupQuery.value.trim()) {
    showSnackbar(t('admin.uiText.autoJs.k0108'), 'warning')
    return
  }
  lookupLoading.value = true
  try {
    const res = await adminApi.lookupUser(lookupQuery.value.trim())
    if (res && res.data) {
      await loadUserIntoEditor(res.data)
      showSnackbar(`已成功调取玩家 ${res.data.username} 账户透视面板！`, 'success')
    } else {
      showSnackbar('未找到该玩家账号，请检查输入。', 'error')
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`查询失败：${msg}`, 'error')
  } finally {
    lookupLoading.value = false
  }
}

const handleResetPassword = async () => {
  if (!selectedUser.value) return
  if (!newPassword.value || newPassword.value.length < 8) {
    showSnackbar('新密码长度不能少于 8 位！', 'warning')
    return
  }
  resetPwdLoading.value = true
  try {
    await adminApi.resetUserPassword({
      userId: selectedUser.value.id,
      password: newPassword.value
    })
    showSnackbar(t('admin.uiText.autoJs.k0019'), 'success')
    resetPwdDialog.value = false
    newPassword.value = ''
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`改密失败：${msg}`, 'error')
  } finally {
    resetPwdLoading.value = false
  }
}

const confirmUnbind = () => {
  if (!selectedUser.value) return
  unbindDialog.value = true
}

const handleUnbind = async () => {
  if (!selectedUser.value) return
  unbindLoading.value = true
  try {
    await adminApi.unbindUser({ userId: selectedUser.value.id })
    showSnackbar(t('admin.uiText.autoJs.k0020'), 'success')
    unbindDialog.value = false
    selectedUser.value.uuid = '' // Clear local
    await handleLoadUsers() // Refresh list
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`解绑失败：${msg}`, 'error')
  } finally {
    unbindLoading.value = false
  }
}

const confirmForceLogout = () => {
  if (!selectedUser.value) return
  logoutDialog.value = true
}

const handleForceLogout = async () => {
  if (!selectedUser.value) return
  logoutLoading.value = true
  try {
    await adminApi.forceUserLogout({ userId: selectedUser.value.id })
    showSnackbar(t('admin.uiText.autoJs.k0021'), 'success')
    logoutDialog.value = false
    selectedUser.value.online = false // Set offline
    await handleLoadUsers() // Refresh list
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`下线失败：${msg}`, 'error')
  } finally {
    logoutLoading.value = false
  }
}

const handleAdjustWallet = async () => {
  if (!selectedUser.value) return
  if (!walletFormRef.value) return
  const { valid } = await walletFormRef.value.validate()
  if (!valid) return

  if (Number(adjustAmount.value) === 0) {
    showSnackbar(t('admin.uiText.autoJs.k0111'), 'warning')
    return
  }

  adjustLoading.value = true
  try {
    const res = await adminApi.adjustUserWallet({
      userId: selectedUser.value.id,
      currency: adjustCurrency.value,
      amount: Number(adjustAmount.value),
      reason: adjustReason.value.trim()
    })
    
    showSnackbar(t('admin.uiText.autoJs.k0022'), 'success')
    
    // Update local visual balances
    if (res && res.data) {
      selectedUser.value.shopCoin = res.data.shopCoin !== undefined ? res.data.shopCoin : selectedUser.value.shopCoin
      selectedUser.value.gameCoin = res.data.gameCoin !== undefined ? res.data.gameCoin : selectedUser.value.gameCoin
    }
    
    adjustAmount.value = ''
    adjustReason.value = ''
    if (walletFormRef.value) walletFormRef.value.resetValidation()
    await handleLoadUsers()
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`余额调整失败：${msg}`, 'error')
  } finally {
    adjustLoading.value = false
  }
}

const handleSaveVisualPermissions = async () => {
  if (!selectedUser.value) return
  visualPermissionLoading.value = true
  try {
    const payload = {
      userId: selectedUser.value.id,
      ...visualPermission.value,
      maxListingsOverride: visualPermission.value.maxListingsOverride === '' ? null : Number(visualPermission.value.maxListingsOverride)
    }
    await adminApi.setUserVisualPermission(payload)
    showSnackbar(t('admin.uiText.autoJs.k0018'), 'success')
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`保存特权配置失败：${msg}`, 'error')
  } finally {
    visualPermissionLoading.value = false
  }
}

// -------------------------------------------------------------
// TAB 2: SUB-ADMINS PRIVILEGES
// -------------------------------------------------------------
const admins = ref<any[]>([])
const adminsLoading = ref(false)

const formAdmin = ref<any>({
  username: '',
  password: '',
  role: 'SUB',
  permissions: []
})
const adminEditMode = ref(false)
const adminValid = ref(false)
const adminFormRef = ref<any>(null)
const saveAdminLoading = ref(false)

const adminRoleOptions = [
  { title: '超级管理员 (SUPER)', value: 'SUPER' },
  { title: '子级管理员 (SUB)', value: 'SUB' }
]

const handleLoadAdmins = async () => {
  adminsLoading.value = true
  try {
    const res = await adminApi.getAdminUsersList()
    if (res && res.data) {
      admins.value = res.data.list || res.data || []
    }
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(t('admin.uiText.templates.loadFailed', { message: msg }), 'error')
  } finally {
    adminsLoading.value = false
  }
}

const handleEditAdmin = (item: any) => {
  formAdmin.value = {
    username: item.username,
    password: '',
    role: item.role || 'SUB',
    permissions: item.permissions || []
  }
  adminEditMode.value = true
  if (adminFormRef.value) adminFormRef.value.resetValidation()
}

const handleClearAdminEditor = () => {
  formAdmin.value = {
    username: '',
    password: '',
    role: 'SUB',
    permissions: []
  }
  adminEditMode.value = false
  if (adminFormRef.value) adminFormRef.value.resetValidation()
}

const handleSaveAdmin = async () => {
  if (!adminFormRef.value) return
  const { valid } = await adminFormRef.value.validate()
  if (!valid) return

  saveAdminLoading.value = true
  try {
    await adminApi.upsertAdminUser(formAdmin.value)
    showSnackbar('管理员权限和密码配置已成功保存！', 'success')
    handleClearAdminEditor()
    await handleLoadAdmins()
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`保存管理员失败：${msg}`, 'error')
  } finally {
    saveAdminLoading.value = false
  }
}

const handleToggleAdminActive = async (item: any) => {
  try {
    await adminApi.setAdminUserActive({
      username: item.username,
      active: item.active
    })
    showSnackbar(`管理员 ${item.username} 活性状态已更新！`, 'success')
  } catch (err: any) {
    item.active = !item.active // rollback
    const msg = err.response?.data?.message || err.message || '未知错误'
    showSnackbar(`管理员激活状态修改失败：${msg}`, 'error')
  }
}

// -------------------------------------------------------------
// LIFECYCLE
// -------------------------------------------------------------
onMounted(async () => {
  await Promise.all([
    handleLoadUsers(),
    handleLoadAdmins()
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
  border-top: 4px solid rgb(var(--v-theme-info)) !important;
}

.border-info-light {
  border-left: 4px solid rgb(var(--v-theme-info)) !important;
}

.hover-bg-row {
  transition: all 0.2s ease;
}
.hover-bg-row:hover {
  background-color: rgba(var(--v-theme-info), 0.03) !important;
}

/* Table header styling */
.bg-table-header {
  background-color: rgba(var(--v-theme-info), 0.04) !important;
}
.v-theme--dark .bg-table-header,
.v-theme--blackguard .bg-table-header {
  background-color: rgba(var(--v-theme-info), 0.1) !important;
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

.border-error-top {
  border-top: 4px solid rgb(var(--v-theme-error)) !important;
}

.border-primary-top {
  border-top: 4px solid rgb(var(--v-theme-primary)) !important;
}

.gap-1 {
  gap: 4px;
}
</style>
