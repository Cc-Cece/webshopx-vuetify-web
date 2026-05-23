/**
 * router/index.ts
 *
 * Manual routes for ./src/pages/*.vue
 */

import { createRouter, createWebHistory } from 'vue-router'
import Account from '@/pages/account.vue'
import Shop from '@/pages/shop.vue'
import Market from '@/pages/market.vue'
import Auction from '@/pages/auction.vue'
import Leaderboard from '@/pages/leaderboard.vue'
import Help from '@/pages/help.vue'
import Notifications from '@/pages/notifications.vue'
import Orders from '@/pages/orders.vue'
import Listings from '@/pages/listings.vue'
import ProductCardDemo from '@/pages/product-card-demo.vue'
import AdminOverview from '@/pages/admin-overview.vue'
import AdminCommerce from '@/pages/admin-commerce.vue'
import AdminMarket from '@/pages/admin-market.vue'
import AdminUsers from '@/pages/admin-users.vue'
import AdminSystem from '@/pages/admin-system.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/account',
    },
    {
      path: '/account',
      component: Account,
    },
    {
      path: '/shop',
      component: Shop,
    },
    {
      path: '/orders',
      component: Orders,
    },
    {
      path: '/listings',
      component: Listings,
    },
    {
      path: '/market',
      component: Market,
    },
    {
      path: '/auction',
      component: Auction,
    },
    {
      path: '/leaderboard',
      component: Leaderboard,
    },
    {
      path: '/help',
      component: Help,
    },
    {
      path: '/notifications',
      component: Notifications,
    },
    {
      path: '/product-card-demo',
      component: ProductCardDemo,
    },
    {
      path: '/admin/overview',
      component: AdminOverview,
    },
    {
      path: '/admin/commerce',
      component: AdminCommerce,
    },
    {
      path: '/admin/market',
      component: AdminMarket,
    },
    {
      path: '/admin/users',
      component: AdminUsers,
    },
    {
      path: '/admin/system',
      component: AdminSystem,
    },
    {
      path: '/components-demo',
      component: () => import('@/pages/components-demo.vue'),
    },
    {
      path: '/dialogs-demo',
      component: () => import('@/pages/dialogs-demo.vue'),
    },
    {
      path: '/table-demo',
      component: () => import('@/pages/table-demo.vue'),
    },
    {
      path: '/settings-demo',
      component: () => import('@/pages/settings-demo.vue'),
    },
  ],
})

export default router
