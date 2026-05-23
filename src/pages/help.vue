<template>
  <v-container fluid class="pa-4 pa-sm-6" style="max-width: 1400px; min-height: 100vh;">
    <!-- 头部工具卡片 (高奢 Glassmorphism) -->
    <v-card class="glass-container pa-4 mb-6" elevation="0">
      <v-row no-gutters align="center" justify="space-between" class="flex-column flex-sm-row gap-4">
        <v-col cols="12" sm="auto" class="d-flex align-center">
          <v-avatar color="primary" class="mr-3 hover-scale text-white" size="48">
            <v-icon size="26">mdi-help-circle-outline</v-icon>
          </v-avatar>
          <div>
            <h1 class="text-h5 font-weight-black bg-gradient-text mb-0 leading-tight">
              {{ $t('help.uiText.page.headerTitle') }}
            </h1>
            <span class="text-caption text-medium-emphasis">WebShopX Documentation Engine</span>
          </div>
        </v-col>

        <!-- 管理按钮动作栏 -->
        <v-col cols="12" sm="auto" class="d-flex flex-wrap align-center gap-2 justify-end">
          <!-- 在线文档 -->
          <v-btn
            variant="tonal"
            color="primary"
            rounded="pill"
            class="text-caption font-weight-bold px-4"
            prepend-icon="mdi-open-in-new"
            href="https://docs.akihito.dpdns.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('help.uiText.page.onlineDocsBtn') }}
          </v-btn>

          <!-- 重新加载 -->
          <v-btn
            variant="tonal"
            color="secondary"
            icon="mdi-refresh"
            size="small"
            :loading="isLoading"
            @click="reloadCurrentDoc"
          ></v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- 主布局双栏 -->
    <v-row class="fill-height">
      <!-- 侧边辅助控制栏 (TOC & 检索) -->
      <v-col cols="12" md="3" v-if="mode === 'full'">
        <v-card class="sidebar-glass pa-4 sticky-column" elevation="0">
          <!-- 文档切换 -->
          <div class="mb-4">
            <span class="text-caption font-weight-bold text-primary d-block mb-2">
              <v-icon size="14" class="mr-1">mdi-file-document-multiple-outline</v-icon>
              {{ $t('help.uiText.page.docSelectTitle') }}
            </span>
            <v-select
              v-model="activeDoc"
              :items="docs"
              item-title="title"
              return-object
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="primary"
              hide-details
            >
              <template #selection="{ item }">
                <span class="text-caption font-weight-bold">
                  {{ (item as any).raw.title }}
                  <v-chip size="x-small" variant="flat" color="primary" class="ml-1 px-1 py-0" style="height: 14px;">
                    {{ (item as any).raw.locale }}
                  </v-chip>
                </span>
              </template>
              <template #item="{ props, item }">
                <v-list-item v-bind="props" density="compact">
                  <template #append>
                    <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-black">
                      {{ (item as any).raw.locale }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </div>

          <!-- 本地搜索 -->
          <div class="mb-6 relative-container">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="mdi-magnify"
              :placeholder="$t('help.uiText.page.searchPlaceholder')"
              variant="outlined"
              density="compact"
              rounded="lg"
              color="primary"
              hide-details
              clearable
              @input="onSearchInput"
              @focus="showSearchDropdown = true"
              @keydown.esc="clearSearch"
            ></v-text-field>

            <!-- 搜索下拉结果浮窗 -->
            <v-fade-transition>
              <v-card
                v-if="showSearchDropdown && searchResults.length > 0"
                class="search-results-overlay border pa-2 mt-2"
                elevation="8"
                style="position: absolute; width: 100%; z-index: 100; max-height: 300px; overflow-y: auto;"
              >
                <v-list density="compact" class="py-0">
                  <v-list-item
                    v-for="(res, idx) in searchResults"
                    :key="idx"
                    class="rounded-lg mb-1 py-2 cursor-pointer"
                    link
                    @click="onSearchResultClick(res)"
                  >
                    <v-list-item-title class="font-weight-bold text-caption text-truncate d-flex align-center">
                      <v-icon
                        size="14"
                        :color="res.type === 'heading' ? 'primary' : 'medium-emphasis'"
                        class="mr-1"
                      >
                        {{ res.type === 'heading' ? 'mdi-pound' : 'mdi-text-short' }}
                      </v-icon>
                      {{ res.title }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption text-truncate mt-1 text-medium-emphasis">
                      {{ res.snippet }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card>
              <v-card
                v-else-if="showSearchDropdown && searchQuery && searchResults.length === 0"
                class="search-results-overlay border pa-4 mt-2 text-center text-caption text-medium-emphasis"
                style="position: absolute; width: 100%; z-index: 100;"
              >
                {{ $t('help.uiText.runtime.noSearchMatch') }}
              </v-card>
            </v-fade-transition>
          </div>

          <!-- 目录大纲 (TOC) -->
          <div>
            <span class="text-caption font-weight-bold text-primary d-block mb-3">
              <v-icon size="14" class="mr-1">mdi-format-list-bulleted</v-icon>
              {{ $t('help.uiText.page.tocTitle') }}
            </span>
            <v-divider class="mb-3"></v-divider>

            <v-list density="compact" nav class="pa-0 bg-transparent overflow-y-auto" style="max-height: calc(100vh - 380px);">
              <template v-if="tocList.length > 0">
                <v-list-item
                  v-for="(heading, idx) in tocList"
                  :key="idx"
                  class="toc-item py-1 mb-1 rounded"
                  :class="{
                    'active': activeHeadingId === heading.id,
                    'pl-4': heading.level === 3,
                    'pl-7': heading.level === 4
                  }"
                  hide-details
                  @click="navigateToHeading(heading.id)"
                >
                  <span class="text-caption font-weight-bold leading-normal block">
                    {{ heading.text }}
                  </span>
                </v-list-item>
              </template>
              <div v-else class="text-center text-caption text-medium-emphasis py-4">
                {{ $t('help.uiText.runtime.noNavigableHeadings') }}
              </div>
            </v-list>
          </div>
        </v-card>
      </v-col>

      <!-- 右侧文档浏览主页面 -->
      <v-col cols="12" :md="mode === 'full' ? 9 : 12">
        <v-card class="glass-container pa-4 pa-sm-8 relative-container" elevation="0" style="min-height: calc(100vh - 200px);">
          <!-- 加载遮罩 -->
          <v-overlay
            v-model="isLoading"
            contained
            class="align-center justify-center blur-overlay"
            persistent
          >
            <div class="text-center">
              <v-progress-circular
                color="primary"
                indeterminate
                size="64"
                width="6"
                class="mb-3"
              ></v-progress-circular>
              <div class="text-caption font-weight-bold text-primary">
                {{ $t('help.uiText.runtime.docLoading') }}
              </div>
            </div>
          </v-overlay>

          <!-- 报错信息 -->
          <v-alert
            v-if="errorMsg"
            type="error"
            variant="tonal"
            rounded="xl"
            icon="mdi-alert-circle-outline"
            class="mb-4"
          >
            {{ errorMsg }}
          </v-alert>

          <!-- 顶端文档详情元数据 (Breadcrumb Card) -->
          <div v-if="activeDoc && !errorMsg" class="d-flex flex-wrap gap-2 align-center justify-between border-b pb-4 mb-6">
            <div class="d-flex align-center">
              <v-icon color="primary" class="mr-2" size="20">mdi-text-box-search-outline</v-icon>
              <span class="text-caption font-weight-bold">
                {{ activeDoc.title }}
              </span>
            </div>
            
            <div class="d-flex align-center gap-2">
              <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-black">
                key: {{ activeDoc.key }}
              </v-chip>
              <v-chip size="x-small" color="success" variant="tonal" class="font-weight-black">
                locale: {{ activeDoc.locale }}
              </v-chip>
              <v-chip size="x-small" color="info" variant="tonal" class="font-weight-black">
                file: {{ activeDoc.file }}
              </v-chip>
            </div>
          </div>

          <!-- Markdown 文档内容渲染视口 -->
          <div
            v-show="!isLoading && !errorMsg"
            ref="contentContainer"
            class="help-markdown-viewer"
            v-html="renderedHtml"
          ></div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
  import { useTheme } from 'vuetify'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { marked } from 'marked'
  import katex from 'katex'
  import 'katex/dist/katex.min.css'

  // Types & Interfaces
  interface DocEntry {
    id: string;
    key: string;
    locale: string;
    title: string;
    file: string;
    path: string;
  }

  interface SearchItem {
    id: string;
    title: string;
    type: 'heading' | 'text';
    snippet: string;
    haystack: string;
  }

  // Composables
  const theme = useTheme()
  const route = useRoute()
  const { t, locale } = useI18n()

  // State Reactive Variables
  const docs = ref<DocEntry[]>([])
  const activeDoc = ref<DocEntry | null>(null)
  const renderedHtml = ref<string>('')
  const isLoading = ref<boolean>(false)
  const errorMsg = ref<string>('')
  const mode = ref<'full' | 'single'>('full')
  
  // TOC & Headings State
  const contentContainer = ref<HTMLElement | null>(null)
  const tocList = ref<{ id: string; level: number; text: string }[]>([])
  const activeHeadingId = ref<string>('')
  
  interface CachedHeading {
    id: string;
    offsetTop: number;
  }
  const cachedHeadings = ref<CachedHeading[]>([])
  
  // Search State
  const searchQuery = ref<string>('')
  const searchIndex = ref<SearchItem[]>([])
  const searchResults = ref<SearchItem[]>([])
  const showSearchDropdown = ref<boolean>(false)

  // System Setup (Fallback documents in case manifest fails to load)
  const getFallbackDocs = (): DocEntry[] => [
    {
      id: "manual.zh-CN",
      key: "manual",
      locale: "zh-CN",
      title: t('help.uiText.runtime.fallbackManualTitle') + ' (zh-CN)',
      file: "manual.zh-CN.md",
      path: "/docs/manual.zh-CN.md"
    },
    {
      id: "manual.en-US",
      key: "manual",
      locale: "en-US",
      title: t('help.uiText.runtime.fallbackManualTitle') + ' (en-US)',
      file: "manual.en-US.md",
      path: "/docs/manual.en-US.md"
    },
    {
      id: "help.zh-CN",
      key: "help",
      locale: "zh-CN",
      title: t('help.uiText.runtime.fallbackHelpZhTitle'),
      file: "help.zh-CN.md",
      path: "/docs/help.zh-CN.md"
    },
    {
      id: "help.en-US",
      key: "help",
      locale: "en-US",
      title: t('help.uiText.runtime.fallbackHelpEnTitle'),
      file: "help.en-US.md",
      path: "/docs/help.en-US.md"
    }
  ]

  // Custom Math LaTeX + Markdown Compiler (Prevent Marked from mangling mathematical formulas)
  const renderMathAndMarkdown = (mdText: string): string => {
    const blockMath: string[] = []
    const inlineMath: string[] = []

    // 1. Normalize \[ ... \] and \( ... \) syntax structures into dollar equivalents
    let text = mdText
      .replace(/\\\[([\s\S]+?)\\\]/g, '$$$$$1$$$$')
      .replace(/\\\(([\s\S]+?)\\\)/g, '$$$1$')

    // 2. Hide and capture double-dollar equations (block mode)
    text = text.replace(/\$\$(\s*[\s\S]+?\s*)\$\$/g, (_, expression) => {
      blockMath.push(expression)
      return `__BLOCK_MATH_PLACEHOLDER_${blockMath.length - 1}__`
    })

    // 3. Hide and capture single-dollar equations (inline mode)
    text = text.replace(/\$([^\$\n]+?)\$/g, (_, expression) => {
      inlineMath.push(expression)
      return `__INLINE_MATH_PLACEHOLDER_${inlineMath.length - 1}__`
    })

    // 4. Invoke Marked Parser synchronously
    let html = marked.parse(text) as string

    // 5. Restore block equations using KaTeX displayMode
    html = html.replace(/__BLOCK_MATH_PLACEHOLDER_(\d+)__/g, (_, indexStr) => {
      const idx = parseInt(indexStr, 10)
      const expr = blockMath[idx]
      try {
        return `<div class="math-block pa-4 my-4 d-flex justify-center align-center overflow-auto rounded-lg" style="background: rgba(var(--v-theme-primary), 0.05); border: 1px solid rgba(var(--v-theme-primary), 0.1);">${katex.renderToString(expr, { displayMode: true, throwOnError: false })}</div>`
      } catch (e) {
        return `<div class="math-error text-error pa-2 border rounded-lg">${expr}</div>`
      }
    })

    // 6. Restore inline equations using KaTeX inline mode
    html = html.replace(/__INLINE_MATH_PLACEHOLDER_(\d+)__/g, (_, indexStr) => {
      const idx = parseInt(indexStr, 10)
      const expr = inlineMath[idx]
      try {
        return `<span class="math-inline px-2 py-0.5 rounded text-primary mx-1" style="background: rgba(var(--v-theme-primary), 0.08); font-size: 0.95em;">${katex.renderToString(expr, { displayMode: false, throwOnError: false })}</span>`
      } catch (e) {
        return `<span class="math-error text-error">${expr}</span>`
      }
    })

    // 7. Wrap standard tables in responsive scrolling containers
    html = html.replace(/<table>([\s\S]*?)<\/table>/g, '<div class="table-responsive"><table>$1</table></div>')

    return html
  }

  // Load and assemble all headings within container to generate dynamic Table of Contents
  const buildToc = () => {
    if (!contentContainer.value) return
    const headings = contentContainer.value.querySelectorAll('h1, h2, h3, h4')
    const list: { id: string; level: number; text: string }[] = []
    const usedIds = new Set<string>()

    headings.forEach((heading, idx) => {
      let text = heading.textContent || ''
      let id = heading.id

      // Extract explicit identifiers if defined like heading {#custom-id}
      const explicitMatch = text.match(/^(.*)\s+\{#([^}]+)\}\s*$/)
      if (explicitMatch) {
        text = explicitMatch[1].trim()
        id = explicitMatch[2].trim()
        heading.textContent = text
        heading.id = id
      }

      if (!id) {
        // Formulate clean URL safe alphanumeric ID from text content
        id = text.toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~，。！？；：“”‘’、]/g, '')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
      }

      if (!id || usedIds.has(id)) {
        id = `section-${idx}`
      }

      heading.id = id
      usedIds.add(id)

      // Ensure elements scroll nicely underneath the app bar sticky drawer header
      if (heading instanceof HTMLElement) {
        heading.style.scrollMarginTop = '100px'
      }

      list.push({
        id,
        level: parseInt(heading.tagName.substring(1), 10),
        text
      })
    })

    tocList.value = list
  }

  // Local Search Engine Indexer
  const buildSearchIndex = () => {
    if (!contentContainer.value) return
    const index: SearchItem[] = []

    // 1. Index Headings
    tocList.value.forEach(item => {
      index.push({
        id: item.id,
        title: item.text,
        type: 'heading',
        snippet: item.level === 1 ? '文档标题' : `章节 H${item.level}`,
        haystack: item.text.toLowerCase()
      })
    })

    // 2. Index Paragraph block elements
    const blocks = contentContainer.value.querySelectorAll('p, li, blockquote, td')
    blocks.forEach((block, idx) => {
      const text = block.textContent || ''
      if (text.trim().length < 8) return

      // Backtrack to find preceding header context
      let nearestHeading = '文档内容'
      let headingId = 'top'

      let prev = block.previousElementSibling
      while (prev) {
        if (/^H[1-4]$/.test(prev.tagName)) {
          nearestHeading = prev.textContent?.replace(/\{#[^}]+\}/, '').trim() || '文档章节'
          headingId = prev.id
          break
        }
        prev = prev.previousElementSibling
      }

      index.push({
        id: headingId,
        title: nearestHeading,
        type: 'text',
        snippet: text.length > 80 ? text.substring(0, 80) + '...' : text,
        haystack: (nearestHeading + ' ' + text).toLowerCase()
      })
    })

    searchIndex.value = index
  }

  const onSearchInput = () => {
    if (!searchQuery.value || !searchQuery.value.trim()) {
      searchResults.value = []
      showSearchDropdown.value = false
      return
    }

    const token = searchQuery.value.toLowerCase().trim()
    const matches = searchIndex.value.filter(item => item.haystack.includes(token))

    // Prioritize direct title matches, followed by heading tags, and finally paragraph matches
    matches.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(token) ? 100 : 0
      const bTitleMatch = b.title.toLowerCase().includes(token) ? 100 : 0
      const aHeading = a.type === 'heading' ? 50 : 0
      const bHeading = b.type === 'heading' ? 50 : 0
      return (bTitleMatch + bHeading) - (aTitleMatch + aHeading)
    })

    searchResults.value = matches.slice(0, 10)
    showSearchDropdown.value = true
  }

  const onSearchResultClick = (res: SearchItem) => {
    navigateToHeading(res.id)
    clearSearch()
  }

  const clearSearch = () => {
    searchQuery.value = ''
    searchResults.value = []
    showSearchDropdown.value = false
  }

  // Smooth scroll helper with highlight animation
  const navigateToHeading = (id: string, smooth = true) => {
    if (!contentContainer.value) return
    const el = contentContainer.value.querySelector(`#${id}`) as HTMLElement
    if (!el) return

    // Clear previous highlight markers
    contentContainer.value.querySelectorAll('.highlight-target').forEach(item => {
      item.classList.remove('highlight-target')
    })

    // Inject class to trigger CSS keyframes animation
    el.classList.add('highlight-target')

    // Perform smooth anchor viewport translation
    el.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'start'
    })

    activeHeadingId.value = id

    // Safely rewrite address bar hash without reloading context
    const newUrl = new URL(window.location.href)
    newUrl.hash = id
    window.history.replaceState(null, '', newUrl.toString())
  }

  const getAbsoluteOffsetTop = (el: HTMLElement): number => {
    let top = 0
    let current: HTMLElement | null = el
    while (current) {
      top += current.offsetTop
      current = current.offsetParent as HTMLElement | null
    }
    return top
  }

  const cacheHeadingOffsets = () => {
    if (!contentContainer.value) return
    const headings = contentContainer.value.querySelectorAll('h1, h2, h3, h4')
    const list: CachedHeading[] = []
    headings.forEach(heading => {
      if (heading instanceof HTMLElement) {
        list.push({
          id: heading.id,
          offsetTop: getAbsoluteOffsetTop(heading)
        })
      }
    })
    cachedHeadings.value = list
  }

  // Scroll Spy to keep Table of Contents highlight in sync with active element scroll state
  const handleScrollSpy = () => {
    if (cachedHeadings.value.length === 0) return
    const scrollPosition = window.scrollY + 120 // offset for navigational headers
    let currentId = ''

    for (const heading of cachedHeadings.value) {
      if (heading.offsetTop <= scrollPosition) {
        currentId = heading.id
      } else {
        break
      }
    }

    if (currentId && activeHeadingId.value !== currentId) {
      activeHeadingId.value = currentId
    }
  }

  // Switch document theme dynamically
  const toggleTheme = () => {
    const current = theme.global.name.value
    if (current === 'light') {
      theme.global.name.value = 'dark'
    } else if (current === 'dark') {
      theme.global.name.value = 'blackguard'
    } else if (current === 'blackguard') {
      theme.global.name.value = 'midnightSakura'
    } else {
      theme.global.name.value = 'light'
    }
  }

  const toggleMode = () => {
    mode.value = mode.value === 'full' ? 'single' : 'full'
    localStorage.setItem('webshopx_help_mode', mode.value)
    
    // Auto sync URL queries
    const url = new URL(window.location.href)
    if (mode.value === 'single') {
      url.searchParams.set('mode', 'single')
    } else {
      url.searchParams.delete('mode')
    }
    window.history.replaceState(null, '', url.toString())
  }

  // High-level document fetch logic
  const loadDoc = async (doc: DocEntry, targetHash = '') => {
    isLoading.value = true
    errorMsg.value = ''
    renderedHtml.value = ''
    tocList.value = []
    searchIndex.value = []

    try {
      const response = await fetch(doc.path, { cache: 'no-cache' })
      if (!response.ok) {
        throw new Error(t('help.uiText.runtime.docFetchFailed', { file: doc.file }))
      }
      const markdownText = await response.text()
      
      // Parse markdown with KaTeX math extensions
      renderedHtml.value = renderMathAndMarkdown(markdownText)
      
      // Allow next DOM tick to compile v-html before indexing headings
      await nextTick()
      
      // Build TOC & local search indexing
      buildToc()
      buildSearchIndex()
      cacheHeadingOffsets()

      // Set up routing synchronization
      const url = new URL(window.location.href)
      url.searchParams.set('doc', doc.id)
      window.history.replaceState(null, '', url.toString())

      // Resolve targeted anchors
      const finalHash = targetHash || route.hash.replace('#', '') || url.hash.replace('#', '')
      if (finalHash) {
        setTimeout(() => {
          navigateToHeading(decodeURIComponent(finalHash), false)
        }, 150)
      } else if (tocList.value.length > 0) {
        activeHeadingId.value = tocList.value[0].id
      }
    } catch (e: any) {
      errorMsg.value = t('help.uiText.runtime.docLoadFailed', { message: e.message || 'Network error' })
    } finally {
      isLoading.value = false
    }
  }

  const reloadCurrentDoc = () => {
    if (activeDoc.value) {
      loadDoc(activeDoc.value, activeHeadingId.value)
    }
  }

  // Setup search clear when clicking outside
  const handleGlobalClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (target && !target.closest('.relative-container')) {
      showSearchDropdown.value = false
    }
  }

  // Watches for document picker dropdown switches
  watch(activeDoc, (newDoc) => {
    if (newDoc) {
      loadDoc(newDoc)
    }
  })

  // Watch for current global locale updates to match documentation lang automatically
  watch(locale, (newLang) => {
    if (!activeDoc.value) return
    const key = activeDoc.value.key
    // Map locale values to standard zh-CN / en-US strings
    const targetLocaleStr = newLang === 'zh' ? 'zh-CN' : 'en-US'
    const matched = docs.value.find(d => d.key === key && d.locale === targetLocaleStr)
    if (matched && matched.id !== activeDoc.value.id) {
      activeDoc.value = matched
    }
  })

  // LifeCycle hooks
  onMounted(async () => {
    // 1. Set mode settings from storage
    const savedMode = localStorage.getItem('webshopx_help_mode')
    const queryMode = route.query.mode
    if (queryMode === 'single' || savedMode === 'single') {
      mode.value = 'single'
    } else {
      mode.value = 'full'
    }

    // 2. Fetch docs index.json manifest
    docs.value = getFallbackDocs()
    try {
      const manifestRes = await fetch('/docs/index.json', { cache: 'no-cache' })
      if (manifestRes.ok) {
        const payload = await manifestRes.json()
        if (payload && Array.isArray(payload.documents)) {
          const list: DocEntry[] = payload.documents.map((d: any) => ({
            id: String(d.id || ''),
            key: String(d.key || ''),
            locale: String(d.locale || ''),
            title: String(d.title || d.id || ''),
            file: String(d.file || ''),
            path: `/docs/${String(d.file || '')}`
          })).filter((d: DocEntry) => d.id && d.file)
          if (list.length > 0) {
            docs.value = list
          }
        }
      }
    } catch (e) {
      // Gracefully fall back to pre-configured local docs
    }

    // 3. Resolve targeted starting document
    const reqDocToken = route.query.doc as string
    const targetLangStr = locale.value === 'zh' ? 'zh-CN' : 'en-US'
    
    let initialDoc: DocEntry | null = null
    if (reqDocToken) {
      initialDoc = docs.value.find(d => d.id.toLowerCase() === reqDocToken.toLowerCase() || d.key.toLowerCase() === reqDocToken.toLowerCase()) || null
    }

    if (!initialDoc) {
      // Fallback preference: Match manual matching user locale
      initialDoc = docs.value.find(d => d.key === 'manual' && d.locale === targetLangStr) ||
                   docs.value.find(d => d.key === 'help' && d.locale === targetLangStr) ||
                   docs.value[0]
    }

    activeDoc.value = initialDoc

    // 4. Handle deep link query matching (category/algorithm parameters)
    let initialHash = ''
    if (route.query.algorithm) {
      initialHash = String(route.query.algorithm)
    } else if (route.query.category === 'dynamic') {
      initialHash = 'dynamic-algorithms'
    } else if (route.query.category === 'auction') {
      initialHash = 'auction-modes'
    }

    // 5. Trigger first document loading sequence
    if (activeDoc.value) {
      loadDoc(activeDoc.value, initialHash)
    }

    // 6. Bind global listeners
    window.addEventListener('scroll', handleScrollSpy, { passive: true })
    window.addEventListener('resize', cacheHeadingOffsets, { passive: true })
    document.addEventListener('click', handleGlobalClick)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScrollSpy)
    window.removeEventListener('resize', cacheHeadingOffsets)
    document.removeEventListener('click', handleGlobalClick)
  })
</script>

<style scoped>
/* Glassmorphism containers matching webshop premium layout tokens */
.glass-container {
  background: rgba(var(--v-theme-surface), 0.35) !important;
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
  border-radius: 20px;
}

.sidebar-glass {
  background: rgba(var(--v-theme-surface), 0.25) !important;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06) !important;
  border-radius: 16px;
}

.relative-container {
  position: relative;
}

.sticky-column {
  position: sticky;
  top: 88px;
  max-height: calc(100vh - 120px);
}

.blur-overlay :deep(.v-overlay__content) {
  backdrop-filter: blur(4px);
  background: rgba(var(--v-theme-surface), 0.4);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.search-results-overlay {
  background: rgba(var(--v-theme-surface), 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1) !important;
}

/* Beautiful dynamic interactive hover animation triggers */
.hover-scale {
  transition: transform 0.2s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}

.bg-gradient-text {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-info)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Premium Typography formatting matching top-tier publication styles */
.help-markdown-viewer :deep(h1) {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-weight: 800;
  font-size: 2.25rem;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
  color: rgba(var(--v-theme-on-surface), 0.95);
  border-bottom: 2px solid rgba(var(--v-theme-on-surface), 0.08);
  padding-bottom: 0.5rem;
  scroll-margin-top: 100px;
}

.help-markdown-viewer :deep(h2) {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-weight: 700;
  font-size: 1.65rem;
  margin-top: 2.5rem;
  margin-bottom: 1.2rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  padding-bottom: 0.25rem;
  scroll-margin-top: 100px;
}

.help-markdown-viewer :deep(h3) {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1.3rem;
  margin-top: 2rem;
  margin-bottom: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.85);
  scroll-margin-top: 100px;
}

.help-markdown-viewer :deep(h4) {
  font-family: 'Outfit', 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 1.5rem;
  margin-bottom: 0.6rem;
  color: rgba(var(--v-theme-on-surface), 0.8);
  scroll-margin-top: 100px;
}

.help-markdown-viewer :deep(p), .help-markdown-viewer :deep(li) {
  font-size: 0.95rem;
  line-height: 1.8;
  color: rgba(var(--v-theme-on-surface), 0.75);
  margin-bottom: 1.2rem;
}

.help-markdown-viewer :deep(ul), .help-markdown-viewer :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1.2rem;
}

.help-markdown-viewer :deep(hr) {
  border: none;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  margin: 2rem 0;
}

.help-markdown-viewer :deep(a) {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  border-bottom: 1px dotted rgb(var(--v-theme-primary));
  transition: all 0.2s ease;
}
.help-markdown-viewer :deep(a:hover) {
  color: rgb(var(--v-theme-info));
  border-bottom-style: solid;
}

/* Quote structures */
.help-markdown-viewer :deep(blockquote) {
  margin: 1.5rem 0;
  padding: 1rem 1.25rem;
  border-left: 4px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
  border-radius: 0 12px 12px 0;
}

.help-markdown-viewer :deep(blockquote p) {
  margin-bottom: 0;
  font-style: italic;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

/* Formulas and math nodes styling */
.help-markdown-viewer :deep(.math-block) {
  background: rgba(var(--v-theme-on-surface), 0.02) !important;
  color: rgba(var(--v-theme-on-surface), 0.9);
  box-shadow: inset 0 0 12px rgba(var(--v-theme-on-surface), 0.03);
}

/* Code structures styling */
.help-markdown-viewer :deep(code) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  font-size: 0.85em;
}

.help-markdown-viewer :deep(pre) {
  background: rgba(var(--v-theme-on-surface), 0.03) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  padding: 1.25rem;
  border-radius: 14px;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.help-markdown-viewer :deep(pre code) {
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.85);
  padding: 0;
  font-size: 0.85rem;
  line-height: 1.6;
}

/* Table elements formatting */
.help-markdown-viewer :deep(.table-responsive) {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 1.5rem 0;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.help-markdown-viewer :deep(table) {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin: 0;
  border: none;
}

.help-markdown-viewer :deep(th), .help-markdown-viewer :deep(td) {
  padding: 0.85rem 1.1rem;
  text-align: left;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.help-markdown-viewer :deep(th) {
  background: rgba(var(--v-theme-on-surface), 0.03);
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.help-markdown-viewer :deep(tr:last-child td) {
  border-bottom: none;
}

/* High-frequency golden glow animation targets */
@keyframes highlight-glow {
  0% {
    background-color: rgba(var(--v-theme-warning), 0.25);
    box-shadow: 0 0 0 12px rgba(var(--v-theme-warning), 0.25);
    border-radius: 6px;
  }
  100% {
    background-color: transparent;
    box-shadow: 0 0 0 0 transparent;
  }
}

.help-markdown-viewer :deep(.highlight-target) {
  animation: highlight-glow 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Table of Contents sidebar lists active items hover configurations */
.toc-item {
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
}

.toc-item:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  color: rgba(var(--v-theme-on-surface), 0.9) !important;
  border-left-color: rgba(var(--v-theme-primary), 0.3);
}

.toc-item.active {
  background: rgba(var(--v-theme-primary), 0.08) !important;
  color: rgb(var(--v-theme-primary)) !important;
  border-left-color: rgb(var(--v-theme-primary)) !important;
  font-weight: 700;
}
</style>
