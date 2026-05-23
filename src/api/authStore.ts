import { ref, computed } from 'vue';
import { accountApi } from './account';
import { adminApi } from './admin';

const readStored = (key: string) => localStorage.getItem(key);
const storedToken = readStored('token') || readStored('webshopx_token');

const normalizeRole = (role: unknown): 'Admin' | 'Player' => {
  return String(role || '').toLowerCase() === 'admin' ? 'Admin' : 'Player';
};

// Core reactive states, initializing from localStorage
const token = ref<string | null>(storedToken);
const username = ref<string | null>(readStored('username'));
const boundUuid = ref<string | null>(readStored('boundUuid'));
const userRole = ref<'Admin' | 'Player'>(normalizeRole(readStored('userRole')));
const email = ref<string>(readStored('email') || '');
const shopCoin = ref<number>(Number(readStored('shopCoin') || '0'));
const gameCoin = ref<number>(Number(readStored('gameCoin') || '0'));

// Currency metadata reactive states
const shopCoinName = ref<string>(readStored('shopCoinName') || '网页币');
const shopCoinShort = ref<string>(readStored('shopCoinShort') || 'SC');
const gameCoinName = ref<string>(readStored('gameCoinName') || '游戏币');
const gameCoinShort = ref<string>(readStored('gameCoinShort') || 'GC');

// Exchange rates reactive states
const shopToGameEnabled = ref<boolean>(readStored('shopToGameEnabled') !== 'false');
const shopToGameRatio = ref<number>(Number(readStored('shopToGameRatio') || '10'));
const gameToShopEnabled = ref<boolean>(readStored('gameToShopEnabled') === 'true');
const gameToShopRatio = ref<number>(Number(readStored('gameToShopRatio') || '0.1'));

// Notification reactive state
const unreadCount = ref<number>(0);
const notificationsList = ref<any[]>([]);

// Computeds
export const isLoggedIn = computed(() => !!token.value);
export const currentUser = computed(() => {
  if (!isLoggedIn.value) return null;
  return {
    username: username.value,
    uuid: boundUuid.value,
    role: userRole.value,
    email: email.value,
    shopCoin: shopCoin.value,
    gameCoin: gameCoin.value,
  };
});

export const isAdmin = computed({
  get: () => userRole.value === 'Admin',
  set: (val) => {
    userRole.value = val ? 'Admin' : 'Player';
    localStorage.setItem('userRole', userRole.value);
  }
});

// We expose the raw ref values so they can be read/updated directly or via actions
export {
  token,
  username,
  boundUuid,
  userRole,
  email,
  shopCoin,
  gameCoin,
  unreadCount,
  notificationsList,
  shopCoinName,
  shopCoinShort,
  gameCoinName,
  gameCoinShort,
  shopToGameEnabled,
  shopToGameRatio,
  gameToShopEnabled,
  gameToShopRatio,
};

export const userRoleLabel = computed(() => {
  return userRole.value === 'Admin' ? '超级管理员' : '普通玩家';
});

// Update the reactive state and persist in localStorage
export function setSession(data: {
  token: string;
  username: string;
  uuid: string;
  role?: 'Admin' | 'Player';
  email?: string;
  shopCoin?: number;
  gameCoin?: number;
}) {
  const nextToken = String(data.token || '').trim();
  token.value = nextToken;
  username.value = data.username;
  boundUuid.value = data.uuid;
  userRole.value = normalizeRole(data.role);
  email.value = data.email || `${data.username}@webshopx.com`;
  shopCoin.value = data.shopCoin ?? 0;
  gameCoin.value = data.gameCoin ?? 0;

  localStorage.setItem('token', nextToken);
  localStorage.setItem('webshopx_token', nextToken);
  localStorage.setItem('username', data.username);
  localStorage.setItem('boundUuid', data.uuid);
  localStorage.setItem('userRole', userRole.value);
  localStorage.setItem('email', email.value);
  localStorage.setItem('shopCoin', String(shopCoin.value));
  localStorage.setItem('gameCoin', String(gameCoin.value));
}

// Clear the session state
export function clearSession() {
  token.value = null;
  username.value = null;
  boundUuid.value = null;
  userRole.value = 'Player';
  email.value = '';
  shopCoin.value = 0;
  gameCoin.value = 0;
  unreadCount.value = 0;
  notificationsList.value = [];

  localStorage.removeItem('token');
  localStorage.removeItem('webshopx_token');
  localStorage.removeItem('username');
  localStorage.removeItem('boundUuid');
  localStorage.removeItem('userRole');
  localStorage.removeItem('email');
  localStorage.removeItem('shopCoin');
  localStorage.removeItem('gameCoin');
}

// Fetch and update unread notification count (for bell badge)
export async function refreshUnreadCount() {
  if (!isLoggedIn.value) return;
  try {
    const res = await accountApi.getUnreadNotificationsCount();
    const data = res.data;
    unreadCount.value = data?.count ?? data?.unreadCount ?? 0;
  } catch (err) {
    console.error('Failed to fetch unread count:', err);
  }
}

// Fetch full notifications list
export async function refreshNotifications() {
  if (!isLoggedIn.value) return;
  try {
    const res = await accountApi.getNotificationsList();
    const data = res.data;
    notificationsList.value = data?.list ?? data?.notifications ?? data ?? [];
  } catch (err) {
    console.error('Failed to fetch notifications:', err);
  }
}

// Mark specific notifications as read (pass ids array, or empty for all)
export async function markNotificationsRead(ids?: number[]) {
  if (!isLoggedIn.value) return;
  try {
    const payload = ids && ids.length > 0 ? { ids } : { all: true };
    await accountApi.markNotificationsRead(payload);
    // Refresh count after mark read
    await refreshUnreadCount();
    // Also update local list flags
    if (!ids || ids.length === 0) {
      notificationsList.value = notificationsList.value.map(n => ({ ...n, isRead: true, read: true }));
    } else {
      notificationsList.value = notificationsList.value.map(n =>
        ids.includes(n.id) ? { ...n, isRead: true, read: true } : n
      );
    }
  } catch (err) {
    console.error('Failed to mark notifications as read:', err);
  }
}

// Actions
export async function refreshWallet() {
  if (!isLoggedIn.value) return;
  try {
    const res = await accountApi.getWallet();
    const data = res.data?.data || res.data;
    if (data) {
      shopCoin.value = data.shopCoin !== undefined ? data.shopCoin : (data.points || 0);
      gameCoin.value = data.gameCoin !== undefined ? data.gameCoin : (data.coins || 0);
      localStorage.setItem('shopCoin', String(shopCoin.value));
      localStorage.setItem('gameCoin', String(gameCoin.value));
      if (data.email) {
        email.value = data.email;
        localStorage.setItem('email', data.email);
      }
      if (data.uuid) {
        boundUuid.value = data.uuid;
        localStorage.setItem('boundUuid', data.uuid);
      }
      if (data.username) {
        username.value = data.username;
        localStorage.setItem('username', data.username);
      }
    }
  } catch (err) {
    const status = (err as any)?.response?.status;
    if (status === 401 || status === 403) {
      clearSession();
      return;
    }
    console.error('Failed to refresh wallet:', err);
  }

  // Verify if the logged-in user is an admin by calling adminApi.getMe()
  try {
    const adminRes = await adminApi.getMe();
    const adminData = adminRes.data;
    if (adminData) {
      userRole.value = 'Admin';
      localStorage.setItem('userRole', 'Admin');
      if (adminData.username) {
        username.value = adminData.username;
        localStorage.setItem('username', adminData.username);
      }
      if (adminData.boundUuid) {
        boundUuid.value = adminData.boundUuid;
        localStorage.setItem('boundUuid', adminData.boundUuid);
      }
    } else {
      userRole.value = 'Player';
      localStorage.setItem('userRole', 'Player');
    }
  } catch (adminErr) {
    // If the admin verification fails, it's a normal player
    userRole.value = 'Player';
    localStorage.setItem('userRole', 'Player');
  }
}

export async function loginUser(usernameInput: string, passwordInput?: string) {
  const res = await accountApi.login({ username: usernameInput, password: passwordInput });
  const data = res.data?.data || res.data;
  if (data) {
    const sessionToken = data.token || data.accessToken || data.jwt || data.sessionToken || '';
    setSession({
      token: sessionToken,
      username: data.username || usernameInput,
      uuid: data.uuid || data.boundUuid || '',
      role: data.role || (usernameInput.toLowerCase() === 'admin' ? 'Admin' : 'Player'),
      email: data.email || `${usernameInput}@webshopx.com`,
      shopCoin: data.shopCoin !== undefined ? data.shopCoin : (data.points || 0),
      gameCoin: data.gameCoin !== undefined ? data.gameCoin : (data.coins || 0)
    });
    await refreshWallet();
  }
  return res;
}

export async function logoutUser() {
  try {
    await accountApi.logout();
  } catch (err) {
    console.error('Logout request failed:', err);
  } finally {
    clearSession();
  }
}

export async function refreshCurrencyMeta() {
  try {
    const res = await accountApi.getCurrencyMeta();
    const data = res.data;
    if (data) {
      if (data.shopCoin) {
        shopCoinName.value = data.shopCoin.name || '网页币';
        shopCoinShort.value = data.shopCoin.short || 'SC';
        localStorage.setItem('shopCoinName', shopCoinName.value);
        localStorage.setItem('shopCoinShort', shopCoinShort.value);
      }
      if (data.gameCoin) {
        gameCoinName.value = data.gameCoin.name || '游戏币';
        gameCoinShort.value = data.gameCoin.short || 'GC';
        localStorage.setItem('gameCoinName', gameCoinName.value);
        localStorage.setItem('gameCoinShort', gameCoinShort.value);
      }
      if (data.exchange) {
        if (data.exchange.shopToGame) {
          shopToGameEnabled.value = data.exchange.shopToGame.enabled !== false;
          shopToGameRatio.value = Number(data.exchange.shopToGame.ratio ?? 10);
          localStorage.setItem('shopToGameEnabled', String(shopToGameEnabled.value));
          localStorage.setItem('shopToGameRatio', String(shopToGameRatio.value));
        }
        if (data.exchange.gameToShop) {
          gameToShopEnabled.value = data.exchange.gameToShop.enabled === true;
          gameToShopRatio.value = Number(data.exchange.gameToShop.ratio ?? 0.1);
          localStorage.setItem('gameToShopEnabled', String(gameToShopEnabled.value));
          localStorage.setItem('gameToShopRatio', String(gameToShopRatio.value));
        }
      }
    }
  } catch (err) {
    console.error('Failed to refresh currency meta:', err);
  }
}
