import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { parse } from 'yaml'

import { Notify } from '@/bridge'
import {
  ReadFile,
  WriteFile,
  AddScheduledTask,
  RemoveScheduledTask,
  EventsOn,
  EventsOff,
} from '@/bridge'
import { ScheduledTasksFilePath } from '@/constant'
import { ScheduledTasksType, PluginTriggerEvent } from '@/enums/app'
import { useSubscribesStore, useRulesetsStore, usePluginsStore, useLogsStore } from '@/stores'
import { debounce, ignoredError, stringifyNoFolding } from '@/utils'

import type { ScheduledTask } from '@/types/app'

export const useScheduledTasksStore = defineStore('scheduledtasks', () => {
  const scheduledtasks = ref<ScheduledTask[]>([])
  const ScheduledTasksEvents: string[] = []
  const ScheduledTasksIDs: number[] = []

  const setupScheduledTasks = async () => {
    const data = await ignoredError(ReadFile, ScheduledTasksFilePath)
    data && (scheduledtasks.value = parse(data))
  }

  const initScheduledTasks = async () => {
    removeScheduledTasks()

    scheduledtasks.value.forEach(async ({ disabled, cron, id }) => {
      if (disabled) return
      const taskID = await AddScheduledTask(cron, id)
      ScheduledTasksEvents.push(id)
      ScheduledTasksIDs.push(taskID)
      EventsOn(id, () => runScheduledTask(id))
    })
  }

  const runScheduledTask = async (id: string) => {
    const task = getScheduledTaskById(id)
    if (!task) return

    const logsStore = useLogsStore()

    task.lastTime = Date.now()
    editScheduledTask(id, task)

    const startTime = Date.now()
    const result = await getTaskFn(task)()

    task.notification && Notify(task.name, result.join('\n'))

    logsStore.recordScheduledTasksLog({
      name: task.name,
      startTime,
      endTime: Date.now(),
      result,
    })
  }

  const removeScheduledTasks = () => {
    ScheduledTasksEvents.forEach((event) => EventsOff(event))
    ScheduledTasksIDs.forEach((id) => RemoveScheduledTask(id))
    ScheduledTasksEvents.splice(0)
    ScheduledTasksIDs.splice(0)
  }

  const withOutput = (list: string[], fn: (id: string) => Promise<string>) => {
    return async () => {
      const output: string[] = []
      for (const id of list) {
        try {
          const res = await fn(id)
          output.push(res)
        } catch (error: any) {
          output.push(error.message || error)
        }
      }
      return output
    }
  }

  const getTaskFn = (task: ScheduledTask) => {
    switch (task.type) {
      case ScheduledTasksType.UpdateSubscription: {
        const subscribesStore = useSubscribesStore()
        return withOutput(task.subscriptions, subscribesStore.updateSubscribe)
      }
      case ScheduledTasksType.UpdateRuleset: {
        const rulesetsStore = useRulesetsStore()
        return withOutput(task.rulesets, rulesetsStore.updateRuleset)
      }
      case ScheduledTasksType.UpdatePlugin: {
        const pluginsStores = usePluginsStore()
        return withOutput(task.plugins, pluginsStores.updatePlugin)
      }
      case ScheduledTasksType.RunPlugin: {
        const pluginsStores = usePluginsStore()
        return withOutput(task.plugins, async (id: string) =>
          pluginsStores.manualTrigger(id, PluginTriggerEvent.OnTask),
        )
      }
      case ScheduledTasksType.RunScript: {
        return withOutput([task.script], (script: string) => new window.AsyncFunction(script)())
      }
    }
  }

  const saveScheduledTasks = debounce(async () => {
    await WriteFile(ScheduledTasksFilePath, stringifyNoFolding(scheduledtasks.value))
  }, 500)

  const addScheduledTask = async (s: ScheduledTask) => {
    scheduledtasks.value.push(s)
    try {
      await saveScheduledTasks()
    } catch (error) {
      scheduledtasks.value.pop()
      throw error
    }
  }

  const deleteScheduledTask = async (id: string) => {
    const idx = scheduledtasks.value.findIndex((v) => v.id === id)
    if (idx === -1) return
    const backup = scheduledtasks.value.splice(idx, 1)[0]
    try {
      await saveScheduledTasks()
    } catch (error) {
      scheduledtasks.value.splice(idx, 0, backup)
      throw error
    }
  }

  const editScheduledTask = async (id: string, s: ScheduledTask) => {
    const idx = scheduledtasks.value.findIndex((v) => v.id === id)
    if (idx === -1) return
    const backup = scheduledtasks.value.splice(idx, 1, s)[0]
    try {
      await saveScheduledTasks()
    } catch (error) {
      scheduledtasks.value.splice(idx, 1, backup)
      throw error
    }
  }

  const getScheduledTaskById = (id: string) => scheduledtasks.value.find((v) => v.id === id)

  const _watchCron = computed(() =>
    scheduledtasks.value
      .map((v) => v.cron)
      .sort()
      .join(),
  )

  const _watchDisabled = computed(() =>
    scheduledtasks.value
      .map((v) => v.disabled)
      .sort()
      .join(),
  )

  watch([_watchCron, _watchDisabled], () => {
    initScheduledTasks()
  })

  window.addEventListener('beforeunload', removeScheduledTasks)

  return {
    scheduledtasks,
    setupScheduledTasks,
    saveScheduledTasks,
    addScheduledTask,
    editScheduledTask,
    deleteScheduledTask,
    getScheduledTaskById,
    getTaskFn,
    removeScheduledTasks,
    runScheduledTask,
  }
})
