import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { parse, stringify } from 'yaml'

import {
  ReadFile,
  WriteFile,
  WindowSetSystemDefaultTheme,
  WindowIsMaximised,
  WindowIsMinimised,
} from '@/bridge'
import {
  Colors,
  DefaultCardColumns,
  DefaultConcurrencyLimit,
  DefaultControllerSensitivity,
  DefaultFontFamily,
  DefaultTestURL,
  UserFilePath,
} from '@/constant/app'
import { CorePidFilePath, DefaultConnections, DefaultCoreConfig } from '@/constant/kernel'
import {
  Theme,
  WindowStartState,
  Lang,
  View,
  Color,
  WebviewGpuPolicy,
  ControllerCloseMode,
  Branch,
} from '@/enums/app'
import i18n from '@/lang'
import { debounce, updateTrayMenus, APP_TITLE, ignoredError, APP_VERSION } from '@/utils'

import type { AppSettings } from '@/types/app'

export const useAppSettingsStore = defineStore('app-settings', () => {
  let firstOpen = true
  let latestUserConfig = ''

  const themeMode = ref<Theme.Dark | Theme.Light>(Theme.Light)

  const app = ref<AppSettings>({
    lang: Lang.EN,
    theme: Theme.Auto,
    color: Color.Default,
    fontFamily: DefaultFontFamily,
    profilesView: View.Grid,
    subscribesView: View.Grid,
    rulesetsView: View.Grid,
    pluginsView: View.Grid,
    scheduledtasksView: View.Grid,
    windowStartState: WindowStartState.Normal,
    webviewGpuPolicy: WebviewGpuPolicy.OnDemand,
    width: 0,
    height: 0,
    exitOnClose: true,
    closeKernelOnExit: true,
    autoSetSystemProxy: true,
    autoStartKernel: false,
    userAgent: APP_TITLE + '/' + APP_VERSION,
    startupDelay: 30,
    connections: DefaultConnections(),
    kernel: {
      branch: Branch.Main,
      profile: '',
      autoClose: true,
      unAvailable: true,
      cardMode: true,
      cardColumns: DefaultCardColumns,
      sortByDelay: false,
      testUrl: DefaultTestURL,
      concurrencyLimit: DefaultConcurrencyLimit,
      controllerCloseMode: ControllerCloseMode.All,
      controllerSensitivity: DefaultControllerSensitivity,
      main: undefined as any,
      alpha: undefined as any,
    },
    addPluginToMenu: false,
    addGroupToMenu: false,
    pluginSettings: {},
    githubApiToken: '',
    multipleInstance: false,
    rollingRelease: true,
    debugOutline: false,
    debugNoAnimation: false,
    pages: ['Overview', 'Profiles', 'Subscriptions', 'Plugins'],
  })

  const saveAppSettings = debounce((config: string) => {
    WriteFile(UserFilePath, config)
  }, 500)

  const setupAppSettings = async () => {
    const data = await ignoredError(ReadFile, UserFilePath)
    data && (app.value = Object.assign(app.value, parse(data)))

    if (!app.value.kernel.main) {
      app.value.kernel.main = DefaultCoreConfig()
      app.value.kernel.alpha = DefaultCoreConfig()
    }

    if (app.value.kernel.controllerCloseMode === undefined) {
      app.value.kernel.controllerCloseMode = ControllerCloseMode.All
    }
    if (app.value.kernel.controllerSensitivity === undefined) {
      app.value.kernel.controllerSensitivity = DefaultControllerSensitivity
    }
    if (app.value.addGroupToMenu === undefined) {
      app.value.addGroupToMenu = false
    }
    if (app.value.kernel.concurrencyLimit === undefined) {
      app.value.kernel.concurrencyLimit = DefaultConcurrencyLimit
    }
    // @ts-expect-error(Deprecated)
    if (app.value['font-family'] !== undefined) {
      // @ts-expect-error(Deprecated)
      app.value.fontFamily = app.value['font-family']
      // @ts-expect-error(Deprecated)
      delete app.value['font-family']
    }

    if (!app.value.kernel.cardColumns) {
      app.value.kernel.cardColumns = DefaultCardColumns
    }
    // @ts-expect-error(Deprecated)
    if (app.value.kernel.running !== undefined) {
      // @ts-expect-error(Deprecated)
      await WriteFile(CorePidFilePath, String(app.value.kernel.pid))
      // @ts-expect-error(Deprecated)
      delete app.value.kernel.running
      // @ts-expect-error(Deprecated)
      delete app.value.kernel.pid
    }

    firstOpen = !!data

    updateAppSettings(app.value)
  }

  const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQueryList.addEventListener('change', ({ matches }) => {
    if (app.value.theme === Theme.Auto) {
      themeMode.value = matches ? Theme.Dark : Theme.Light
    }
  })

  const setAppTheme = (theme: Theme.Dark | Theme.Light) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.body.setAttribute('theme-mode', theme)
      })
    } else {
      document.body.setAttribute('theme-mode', theme)
    }
    WindowSetSystemDefaultTheme()
  }

  const updateAppSettings = (settings: AppSettings) => {
    i18n.global.locale.value = settings.lang
    themeMode.value =
      settings.theme === Theme.Auto
        ? mediaQueryList.matches
          ? Theme.Dark
          : Theme.Light
        : settings.theme
    const { primary, secondary } = Colors[settings.color]
    document.documentElement.style.setProperty('--primary-color', primary)
    document.documentElement.style.setProperty('--secondary-color', secondary)
    document.body.style.fontFamily = settings.fontFamily
    document.body.setAttribute('debug-outline', String(settings.debugOutline))
    document.body.setAttribute('debug-no-animation', String(settings.debugNoAnimation))
  }

  watch(
    app,
    (settings) => {
      updateAppSettings(settings)

      if (!firstOpen) {
        const lastModifiedConfig = stringify(settings)
        if (latestUserConfig !== lastModifiedConfig) {
          saveAppSettings(lastModifiedConfig).then(() => {
            latestUserConfig = lastModifiedConfig
          })
        } else {
          saveAppSettings.cancel()
        }
      }

      firstOpen = false
    },
    { deep: true },
  )

  window.addEventListener(
    'resize',
    debounce(async () => {
      const [isMinimised, isMaximised] = await Promise.all([
        WindowIsMinimised(),
        WindowIsMaximised(),
      ])
      if (!isMinimised && !isMaximised) {
        app.value.width = document.documentElement.clientWidth
        app.value.height = document.documentElement.clientHeight
      }
    }, 1000),
  )

  watch(
    [themeMode, () => app.value.color, () => app.value.lang, () => app.value.addPluginToMenu],
    updateTrayMenus,
  )

  watch(themeMode, setAppTheme, { immediate: true })

  return { setupAppSettings, app, themeMode }
})
