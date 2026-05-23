import { appApi } from "./app";

export const accountApi = {
  getWallet: appApi.getWallet,
  getWalletLedger: appApi.getWalletLedger,
  getRechargeStatus: appApi.getRechargeStatus,
  createRechargeOrder: appApi.createRechargeOrder,
  walletExchange: appApi.walletExchange,
  login: appApi.login,
  logout: appApi.logout,
  useRedeemCode: appApi.useRedeemCode,
  getNotificationsList: appApi.getNotificationsList,
  getUnreadNotificationsCount: appApi.getUnreadNotificationsCount,
  markNotificationsRead: appApi.markNotificationsRead,
  getCurrencyMeta: appApi.getCurrencyMeta,
};
