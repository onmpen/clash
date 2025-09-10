import { useAppStore } from '@/stores'
import { sleep } from '@/utils'

import type { Directive, DirectiveBinding } from 'vue'

const isEditableNode = (node: HTMLElement | null): boolean => {
  let cur: HTMLElement | null = node
  while (cur) {
    const tag = cur.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return true
    if (cur.isContentEditable || cur.getAttribute('contenteditable') === 'true') return true
    cur = cur.parentElement
  }
  return false
}

const updateMenus = (el: any, binding: DirectiveBinding) => {
  const appStore = useAppStore()

  el.oncontextmenu = async (e: MouseEvent) => {
    const target = e.target as HTMLElement | null
    const menus = (binding?.value ?? []) as any[]

    if (isEditableNode(target)) return

    if (!Array.isArray(menus) || menus.length === 0) return

    e.preventDefault()
    appStore.menuPosition = { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
    appStore.menuList = menus
    if (appStore.menuShow) {
      appStore.menuShow = false
      await sleep(200)
    }
    appStore.menuShow = true
  }
}

export default {
  mounted(el: any, binding: DirectiveBinding) {
    updateMenus(el, binding)
  },
  updated(el: any, binding: DirectiveBinding) {
    updateMenus(el, binding)
  },
} as Directive
