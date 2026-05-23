import { createI18n } from 'vue-i18n'

// Legacy JSON locale files
import legacyAppZh from '@/i18n/app/zh-CN.json'
import legacyAppEn from '@/i18n/app/en-US.json'
import legacyAdminZh from '@/i18n/admin/zh-CN.json'
import legacyAdminEn from '@/i18n/admin/en-US.json'
import legacyHelpZh from '@/i18n/help/zh-CN.json'
import legacyHelpEn from '@/i18n/help/en-US.json'
import legacyAlgZh from '@/i18n/market-algorithms/zh-CN.json'
import legacyAlgEn from '@/i18n/market-algorithms/en-US.json'
import legacyMatZh from '@/i18n/materials/zh-CN.json'
import legacyMatEn from '@/i18n/materials/en-US.json'

const templateZh = {
  nav: {
    dashboard: '主控台 (Dashboard)',
    forms: '表单与组件 (Forms & UI)',
    dialogs: '对话框演示 (Dialogs)',
    table: '高级数据表格 (Data Table)',
  },
  app: {
    title: 'WebShopX Admin',
    subtitle: '官方高级管理控制台',
    settingsTitle: '页面设置',
    theme: '主题',
    themeDesc: '自定义你的文档是明亮还是黑暗的主题，或者两者的结合。',
    themeLight: '浅色主题 (Light)',
    themeDark: '暗色主题 (Dark)',
    themePurple: '深紫秘境 (Blackguard)',
    themeSakura: '午夜樱花 (Midnight Sakura)',
    oneThemes: 'Vuetify One Themes',
    offline: '可离线访问',
    offlineDesc: '安装一个 service worker 可以在本地缓存整个站点。',
    pinPage: '启用钉选',
    newRelease: '新发布',
    pinPageDesc: '收藏和访问重要文件页面，提高工作流程效率。',
    railDrawer: '横向抽屉栏',
    railDrawerDesc: '将导航抽屉显示为悬停展开的横栏。',
    compositionApi: '使用组合式 API',
    compositionApiDesc: '组件的代码示例中使用的 API 类型。',
    showApiTable: '启用页面显示 API',
    showApiTableDesc: '在文档页面显示 API 表格。',
    searchShortcut: '使用 / 作为搜索快捷键',
    searchShortcutDesc: '在控制台任何位置按下 "/" 键快速定位搜索。',
    latestRelease: '最新发行版',
    buildDoc: '构建文档',
    latestCommit: '最新提交',
    openSettings: '打开设置面板',
    toggleTheme: '切换官方主题',
    language: '选择语言 / Language',
    languageDesc: '切换控制台界面的语言设置。',
    langZh: '简体中文 (Chinese)',
    langEn: 'English (英文)',
  },
  user: {
    name: '林小夕',
    role: '超级管理员',
    profile: '个人中心',
    security: '安全设置',
    logout: '退出登录',
    notifications: '系统消息',
    viewAll: '查看全部消息',
    notifNewOrder: '新订单: ￥1,288.00 商品已付款',
    notifNewOrderTime: '5 分钟前',
    notifSysWarning: '系统警告: CPU 使用率超过 85%',
    notifSysWarningTime: '1 小时前',
    notifNewUser: '新用户注册: 林明华 加入了平台',
    notifNewUserTime: '3 小时前',
  }
}

const templateEn = {
  nav: {
    dashboard: 'Dashboard',
    forms: 'Forms & UI',
    dialogs: 'Dialogs Demo',
    table: 'Data Table',
  },
  app: {
    title: 'WebShopX Admin',
    subtitle: 'Official Premium Admin Console',
    settingsTitle: 'Page Settings',
    theme: 'Theme',
    themeDesc: 'Customize your document’s light or dark appearance, or a combination of both.',
    themeLight: 'Light Theme (Light)',
    themeDark: 'Dark Theme (Dark)',
    themePurple: 'Blackguard (Deep Purple)',
    themeSakura: 'Midnight Sakura',
    oneThemes: 'Vuetify One Themes',
    offline: 'Offline Access',
    offlineDesc: 'Install a service worker to cache the entire site locally.',
    pinPage: 'Enable Pinning',
    newRelease: 'New',
    pinPageDesc: 'Bookmark and access important document pages to improve efficiency.',
    railDrawer: 'Horizontal Navigation Rail',
    railDrawerDesc: 'Display navigation drawer as a hoverable expanding rail.',
    compositionApi: 'Use Composition API',
    compositionApiDesc: 'The API style used in component code examples.',
    showApiTable: 'Enable Page API Table',
    showApiTableDesc: 'Display the API reference tables on document pages.',
    searchShortcut: 'Use / as Search Shortcut',
    searchShortcutDesc: 'Press "/" anywhere on the console to quickly focus search.',
    latestRelease: 'Latest Release',
    buildDoc: 'Build Documentation',
    latestCommit: 'Latest Commit',
    openSettings: 'Open Settings Panel',
    toggleTheme: 'Toggle Theme',
    language: 'Select Language / 语言',
    languageDesc: 'Switch the default language of the console interface.',
    langZh: '简体中文 (Chinese)',
    langEn: 'English (English)',
  },
  user: {
    name: 'Elena Lin',
    role: 'Super Admin',
    profile: 'User Profile',
    security: 'Security Settings',
    logout: 'Logout',
    notifications: 'System Notifications',
    viewAll: 'View All Notifications',
    notifNewOrder: 'New Order: ￥1,288.00 Paid Successfully',
    notifNewOrderTime: '5 mins ago',
    notifSysWarning: 'System Warning: CPU usage exceeds 85%',
    notifSysWarningTime: '1 hour ago',
    notifNewUser: 'New User: Minghua Lin registered',
    notifNewUserTime: '3 hours ago',
  }
}

const messages = {
  zh: {
    ...templateZh,
    app: {
      ...templateZh.app,
      ...legacyAppZh
    },
    admin: legacyAdminZh,
    help: legacyHelpZh,
    marketAlgorithms: legacyAlgZh,
    materials: legacyMatZh
  },
  en: {
    ...templateEn,
    app: {
      ...templateEn.app,
      ...legacyAppEn
    },
    admin: legacyAdminEn,
    help: legacyHelpEn,
    marketAlgorithms: legacyAlgEn,
    materials: legacyMatEn
  }
}

const localeNames = ['zh', 'en'] as const
const storedLocale = typeof window !== 'undefined'
  ? window.localStorage.getItem('webshopx_locale')
  : null
const defaultLocale: (typeof localeNames)[number] = localeNames.includes(storedLocale as (typeof localeNames)[number])
  ? (storedLocale as (typeof localeNames)[number])
  : 'zh'

export default createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages,
})
