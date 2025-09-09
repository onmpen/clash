import { type RouteRecordRaw } from 'vue-router'

import { isDev } from '@/utils'
import HomeView from '@/views/HomeView/index.vue'
import PlaygroundView from '@/views/PlaygroundView/index.vue'
import PluginsView from '@/views/PluginsView/index.vue'
import ProfilesView from '@/views/ProfilesView/index.vue'
import RulesetsView from '@/views/RulesetsView/index.vue'
import ScheduledTasksView from '@/views/ScheduledTasksView/index.vue'
import SettingsView from '@/views/SettingsView/index.vue'
import SubscribesView from '@/views/SubscribesView/index.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Overview',
    component: HomeView,
    meta: {
      name: 'router.overview',
      icon: 'overview',
    },
  },
  {
    path: '/profiles',
    name: 'Profiles',
    component: ProfilesView,
    meta: {
      name: 'router.profiles',
      icon: 'profiles',
    },
  },
  {
    path: '/subscriptions',
    name: 'Subscriptions',
    component: SubscribesView,
    meta: {
      name: 'router.subscriptions',
      icon: 'subscriptions',
    },
  },
  {
    path: '/rulesets',
    name: 'Rulesets',
    component: RulesetsView,
    meta: {
      name: 'router.rulesets',
      icon: 'rulesets',
    },
  },
  {
    path: '/plugins',
    name: 'Plugins',
    component: PluginsView,
    meta: {
      name: 'router.plugins',
      icon: 'plugins',
    },
  },
  {
    path: '/scheduledtasks',
    name: 'ScheduledTasks',
    component: ScheduledTasksView,
    meta: {
      name: 'router.scheduledtasks',
      icon: 'scheduledTasks',
    },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: {
      name: 'router.settings',
      icon: 'settings2',
      hidden: false,
    },
  },
  {
    path: '/playground',
    name: 'Playground',
    component: PlaygroundView,
    meta: {
      name: 'Develop',
      icon: 'code',
      hidden: !isDev,
    },
  },
]

export default routes
