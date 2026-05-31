import { apiClient, toFormData, type QueryParams } from "./client";

export const adminApi = {
  getCurrencyMeta: () => apiClient.get("/meta/currency"),
  login: (payload: Record<string, unknown>) => apiClient.post("/admin/auth/login", payload),
  getMe: () => apiClient.get("/admin/auth/me"),
  getMarketTagsMeta: () => apiClient.get("/meta/market-tags"),
  getMarketTagsConfig: () => apiClient.get("/admin/market/tags-config"),
  getMarketLimitationConfig: () => apiClient.get("/admin/market/limitation-config"),
  saveMarketTagsConfig: (payload: Record<string, unknown>) => apiClient.post("/admin/market/tags-config", payload),
  saveMarketLimitationConfig: (payload: Record<string, unknown>) => apiClient.post("/admin/market/limitation-config", payload),
  getMaterialOverridesMeta: () => apiClient.get("/meta/material-overrides"),
  getMaterialsMeta: () => apiClient.get("/meta/materials"),
  createRedeemCode: (payload: Record<string, unknown>) => apiClient.post("/admin/redeem/create", payload),
  getRedeemList: (params?: QueryParams) => apiClient.get("/admin/redeem/list", { params: { limit: 200, ...params } }),
  setRedeemActive: (payload: Record<string, unknown>) => apiClient.post("/admin/redeem/active", payload),
  upsertProduct: (payload: Record<string, unknown>) => apiClient.post("/admin/products/upsert", payload),
  uploadProductIcon: (query: QueryParams, payload: Record<string, unknown>) =>
    apiClient.post("/admin/products/icon", toFormData(payload), {
      params: query,
      headers: { "Content-Type": "multipart/form-data" },
    }),
  resetProductLimit: (payload: Record<string, unknown>) => apiClient.post("/admin/products/reset-limit", payload),
  consumeGroupBuyCode: (payload: Record<string, unknown>) => apiClient.post("/admin/group-buy/consume", payload),
  setProductActive: (payload: Record<string, unknown>) => apiClient.post("/admin/products/active", payload),
  getProductsList: (params?: QueryParams) =>
    apiClient.get("/admin/products/list", { params: { includeInactive: true, limit: 300, ...params } }),
  getOrdersList: (params?: QueryParams) => apiClient.get("/admin/orders/list", { params }),
  getMaterialOverridesList: (params?: QueryParams) => apiClient.get("/admin/material-overrides/list", { params }),
  upsertMaterialOverride: (payload: Record<string, unknown>) => apiClient.post("/admin/material-overrides/upsert", payload),
  uploadMaterialOverrideIcon: (query: QueryParams, file: File | Blob) =>
    apiClient.post("/admin/material-overrides/icon", file, {
      params: query,
      headers: { "Content-Type": (file as File).type || "application/octet-stream" },
    }),
  deleteMaterialOverride: (payload: Record<string, unknown>) => apiClient.post("/admin/material-overrides/delete", payload),
  announceNotification: (payload: Record<string, unknown>) => apiClient.post("/admin/notifications/announce", payload),
  getMarketListings: (params?: QueryParams) => apiClient.get("/admin/market/listings", { params }),
  forceUnlistMarketListing: (payload: Record<string, unknown>) => apiClient.post("/admin/market/unlist", payload),
  getUserVisualPermission: (userId: string) => apiClient.get("/admin/users/visual-permission", { params: { userId } }),
  setUserVisualPermission: (payload: Record<string, unknown>) => apiClient.post("/admin/users/visual-permission", payload),
  lookupUser: (identifier: string) => apiClient.get("/admin/users/lookup", { params: { identifier } }),
  getUsersList: (params?: QueryParams) => apiClient.get("/admin/users/list", { params }),
  forceUserLogout: (payload: Record<string, unknown>) => apiClient.post("/admin/users/logout", payload),
  unbindUser: (payload: Record<string, unknown>) => apiClient.post("/admin/users/unbind", payload),
  resetUserPassword: (payload: Record<string, unknown>) => apiClient.post("/admin/users/reset-password", payload),
  adjustUserWallet: (payload: Record<string, unknown>) => apiClient.post("/admin/users/wallet-adjust", payload),
  setAdminUserActive: (payload: Record<string, unknown>) => apiClient.post("/admin/admin-users/active", payload),
  getAdminUsersMeta: (locale: string) => apiClient.get("/admin/admin-users/meta", { params: { locale } }),
  getAdminUsersList: () => apiClient.get("/admin/admin-users/list"),
  upsertAdminUser: (payload: Record<string, unknown>) => apiClient.post("/admin/admin-users/upsert", payload),
  getAuditList: (params?: QueryParams) => apiClient.get("/admin/audit/list", { params: { limit: 200, ...params } }),
  logout: (payload?: Record<string, unknown>) => apiClient.post("/admin/auth/logout", payload ?? {}),
  
  // System and Economy Configurations
  getEconomySettings: () => apiClient.get("/admin/economy/settings"),
  saveExchangeSettings: (payload: Record<string, unknown>) => apiClient.post("/admin/economy/exchange", payload),
  saveMarketEconomySettings: (payload: Record<string, unknown>) => apiClient.post("/admin/economy/market", payload),
  saveLeaderboardSettings: (payload: Record<string, unknown>) => apiClient.post("/admin/economy/leaderboard", payload),
  saveCurrencyDisplaySettings: (payload: Record<string, unknown>) => apiClient.post("/admin/economy/currency", payload),
  saveRechargePaymentSettings: (payload: Record<string, unknown>) => apiClient.post("/admin/economy/recharge-payment", payload),
  saveWebshopRuntimeSettings: (payload: Record<string, unknown>) => apiClient.post("/admin/system/webshop", payload),
  saveMarketRuntimeSettings: (payload: Record<string, unknown>) => apiClient.post("/admin/system/market", payload),
  saveMaintenanceSettings: (payload: Record<string, unknown>) => apiClient.post("/admin/system/maintenance", payload),
  saveLoggingSettings: (payload: Record<string, unknown>) => apiClient.post("/admin/system/logging", payload),
  saveNotificationSettings: (payload: Record<string, unknown>) => apiClient.post("/admin/system/notification", payload),
  saveBroadcastSettings: (payload: Record<string, unknown>) => apiClient.post("/admin/system/broadcast", payload),
  
  // Locales Management
  getLocales: () => apiClient.get("/admin/locales"),
  uploadLocale: (payload: Record<string, unknown>) => apiClient.post("/admin/locales/upload", payload),
  syncLocalesManifest: (payload: Record<string, unknown>) => apiClient.post("/admin/locales/sync-manifest", payload),
  setDefaultLocale: (payload: Record<string, unknown>) => apiClient.post("/admin/locales/default", payload),
  localeAction: (payload: Record<string, unknown>) => apiClient.post("/admin/locales/action", payload),
  
  // Themes Management
  getThemes: () => apiClient.get("/admin/themes"),
  uploadTheme: (payload: Record<string, unknown>) => apiClient.post("/admin/themes/upload", payload),
  syncThemesManifest: (payload: Record<string, unknown>) => apiClient.post("/admin/themes/sync-manifest", payload),
  setDefaultTheme: (payload: Record<string, unknown>) => apiClient.post("/admin/themes/default", payload),
  themeAction: (payload: Record<string, unknown>) => apiClient.post("/admin/themes/action", payload),

  // Visual settings customization
  saveVisualSettings: (payload: Record<string, unknown>) => apiClient.post("/admin/visual/settings", payload),
  
  // L10n manifest proxying
  getL10nManifest: (params?: QueryParams) => apiClient.get("/admin/l10n/manifest", { params }),
  
  // Overview stats
  getOverviewStats: () => apiClient.get("/admin/overview/stats"),
};

