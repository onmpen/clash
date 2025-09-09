import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  Download,
  HttpCancel,
  UnzipZIPFile,
  HttpGet,
  Exec,
  MoveFile,
  RemoveFile,
  AbsolutePath,
  BrowserOpenURL,
  MakeDir,
  UnzipGZFile,
  FileExists,
} from '@/bridge'
import { CoreWorkingDirectory } from '@/constant/kernel'
import { Branch } from '@/enums/app'
import { useAppSettingsStore, useEnvStore, useKernelApiStore } from '@/stores'
import {
  getGitHubApiAuthorization,
  GrantTUNPermission,
  ignoredError,
  confirm,
  message,
  debounce,
  getKernelFileName,
  getKernelAssetFileName,
  downloadWithGhMirrors,
} from '@/utils'

const StableUrl = 'https://api.github.com/repos/MetaCubeX/mihomo/releases/latest'
const AlphaUrl = 'https://api.github.com/repos/MetaCubeX/mihomo/releases/tags/Prerelease-Alpha'

const StablePage = 'https://github.com/MetaCubeX/mihomo/releases/latest'
const AlphaPage = 'https://github.com/MetaCubeX/mihomo/releases/tag/Prerelease-Alpha'

export const useCoreBranch = (isAlpha = false) => {
  const releaseUrl = isAlpha ? AlphaUrl : StableUrl

  const localVersion = ref('')
  const remoteVersion = ref('')
  const versionDetail = ref('')

  const localVersionLoading = ref(false)
  const remoteVersionLoading = ref(false)
  const downloading = ref(false)
  const downloadCompleted = ref(false)

  const rollbackable = ref(false)

  const { t } = useI18n()
  const envStore = useEnvStore()
  const appSettings = useAppSettingsStore()
  const kernelApiStore = useKernelApiStore()

  const restartable = computed(() => {
    const { branch } = appSettings.app.kernel
    if (!kernelApiStore.running) return false
    return localVersion.value && downloadCompleted.value && (branch === Branch.Alpha) === isAlpha
  })

  const updatable = computed(
    () => remoteVersion.value && localVersion.value !== remoteVersion.value,
  )

  const grantable = computed(() => localVersion.value && envStore.env.os !== 'windows')

  const CoreFilePath = `${CoreWorkingDirectory}/${getKernelFileName(isAlpha)}`
  const CoreBakFilePath = `${CoreFilePath}.bak`

  const downloadCore = async () => {
    downloading.value = true
    try {
      const { body } = await HttpGet<Record<string, any>>(releaseUrl, {
        Authorization: getGitHubApiAuthorization(),
      })
      if (body.message) throw body.message

      const { assets, name } = body
      const assetName = getKernelAssetFileName(isAlpha ? remoteVersion.value : name)
      const asset = assets.find((v: any) => v.name === assetName)
      if (!asset) throw 'Asset Not Found:' + assetName
      if (asset.uploader.type !== 'Bot') {
        await confirm('common.warning', 'settings.kernel.risk', {
          type: 'text',
          okText: 'settings.kernel.stillDownload',
        })
      }

      const downloadCacheFile = `data/.cache/${assetName}`
      const downloadCancelId = downloadCacheFile

      const { update, destroy } = message.info('common.downloading', 10 * 60 * 1_000, () => {
        HttpCancel(downloadCancelId)
        setTimeout(() => RemoveFile(downloadCacheFile), 1000)
      })

      await MakeDir(CoreWorkingDirectory)

      // try mirrors for GitHub assets first
      await downloadWithGhMirrors(
        asset.browser_download_url,
        downloadCacheFile,
        (progress, total) => {
          update(t('common.downloading') + ((progress / total) * 100).toFixed(2) + '%')
        },
        { CancelId: downloadCancelId },
      ).finally(destroy)

      const stableFileName = getKernelFileName()

      await ignoredError(MoveFile, CoreFilePath, CoreBakFilePath)

      if (assetName.endsWith('.zip')) {
        if (isAlpha) {
          const tmp = 'data/.cache/alpha'
          await UnzipZIPFile(downloadCacheFile, tmp)
          await MoveFile(`${tmp}/${stableFileName}`, CoreFilePath)
          await RemoveFile(tmp)
        } else {
          await UnzipZIPFile(downloadCacheFile, CoreWorkingDirectory)
        }
      } else {
        await UnzipGZFile(downloadCacheFile, CoreFilePath)
      }

      await RemoveFile(downloadCacheFile)

      if (!CoreFilePath.endsWith('.exe')) {
        await ignoredError(Exec, 'chmod', ['+x', await AbsolutePath(CoreFilePath)])
      }

      refreshLocalVersion()
      downloadCompleted.value = true
      message.success('common.success')
    } catch (error: any) {
      console.log(error)
      message.error(error.message || error)
      downloadCompleted.value = false
    }
    downloading.value = false
  }

  const getLocalVersion = async (showTips = false) => {
    localVersionLoading.value = true
    try {
      const res = await Exec(CoreFilePath, ['-v'])
      versionDetail.value = res.trim()
      return res.match(isAlpha ? /alpha-\S+/ : /v\S+/)?.[0] || ''
    } catch (error: any) {
      console.log(error)
      showTips && message.error(error)
    } finally {
      localVersionLoading.value = false
    }
    return ''
  }

  const getRemoteVersion = async (showTips = false) => {
    remoteVersionLoading.value = true
    try {
      if (isAlpha) {
        const { body } = await HttpGet(
          'https://github.com/MetaCubeX/mihomo/releases/download/Prerelease-Alpha/version.txt',
        )
        return body.trim()
      }
      const { body } = await HttpGet<Record<string, any>>(releaseUrl, {
        Authorization: getGitHubApiAuthorization(),
      })
      if (body.message) throw body.message
      return body.name
    } catch (error: any) {
      console.log(error)
      showTips && message.error(error.message)
    } finally {
      remoteVersionLoading.value = false
    }
    return ''
  }

  const restartCore = async () => {
    if (!kernelApiStore.running) return
    try {
      await kernelApiStore.restartCore()
      downloadCompleted.value = false
      message.success('common.success')
    } catch (error: any) {
      message.error(error)
    }
  }

  const refreshLocalVersion = async (showTips = false) => {
    localVersion.value = await getLocalVersion(showTips)
  }

  const refreshRemoteVersion = async (showTips = false) => {
    remoteVersion.value = await getRemoteVersion(showTips)
  }

  const grantCorePermission = async () => {
    await GrantTUNPermission(CoreFilePath)
    message.success('common.success')
  }

  const rollbackCore = async () => {
    await confirm('common.warning', 'settings.kernel.rollback')

    const doRollback = () => MoveFile(CoreBakFilePath, CoreFilePath)

    const { branch } = appSettings.app.kernel
    const isCurrentRunning = kernelApiStore.running && (branch === Branch.Alpha) === isAlpha
    if (isCurrentRunning) {
      await kernelApiStore.restartCore(doRollback)
    } else {
      await doRollback()
    }
    refreshLocalVersion()
    message.success('common.success')
  }

  const openReleasePage = () => {
    BrowserOpenURL(isAlpha ? AlphaPage : StablePage)
  }

  watch(
    () => appSettings.app.kernel.branch,
    () => (downloadCompleted.value = false),
  )

  watch(
    [localVersion, downloadCompleted],
    debounce(async () => {
      rollbackable.value = await FileExists(CoreBakFilePath)
    }, 500),
  )

  refreshLocalVersion()
  refreshRemoteVersion()

  return {
    restartable,
    updatable,
    grantable,
    rollbackable,
    versionDetail,
    localVersion,
    localVersionLoading,
    remoteVersion,
    remoteVersionLoading,
    downloading,
    refreshLocalVersion,
    refreshRemoteVersion,
    downloadCore,
    restartCore,
    rollbackCore,
    grantCorePermission,
    openReleasePage,
  }
}
