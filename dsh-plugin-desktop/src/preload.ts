/** Minimal context-isolated bridges for drag payloads and Desktop-owned actions. */

import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { DESKTOP_FILE_PATH_BRIDGE } from './file-path-bridge-contract.ts'
import {
  DESKTOP_RENDERER_ACTION_CHANNEL,
  DESKTOP_RENDERER_ACTIONS_BRIDGE,
  type DesktopRendererAction,
  type DesktopRendererActionsBridge,
} from './renderer-actions-contract.ts'
import { DESKTOP_PRODUCT_NAME } from './product-identity.ts'

contextBridge.exposeInMainWorld(DESKTOP_FILE_PATH_BRIDGE, {
  /** Resolve only genuine disk-backed Web File objects selected by the operator. */
  getPathForFile(file: File): string {
    return webUtils.getPathForFile(file)
  },
})

const actions: DesktopRendererActionsBridge = {
  /** Reach the main process directly, independent of the Host generation. */
  invoke: (action: DesktopRendererAction) => ipcRenderer.invoke(DESKTOP_RENDERER_ACTION_CHANNEL, action),
}
contextBridge.exposeInMainWorld(DESKTOP_RENDERER_ACTIONS_BRIDGE, actions)

/**
 * Upstream text the pre-boot splash renders for its wordmark seat.
 *
 * The splash runs before any Cordis client plugin, and its wordmark node is
 * addressed by a content-hashed CSS-module class, so the brand is matched by
 * text content instead of by a class name that changes on every upstream build.
 */
const UPSTREAM_BOOT_WORDMARK = 'HARNESS'

/** Selector for the pre-boot splash root installed by the upstream frontend. */
const BOOT_ROOT_SELECTOR = '[data-dsh-boot]'

/** Replace the upstream splash wordmark with the deployed product name. */
function rewriteBootWordmark(): void {
  const boot = document.querySelector(BOOT_ROOT_SELECTOR)
  if (boot === null) return
  for (const element of boot.querySelectorAll('*')) {
    if (element.childElementCount === 0 && element.textContent === UPSTREAM_BOOT_WORDMARK) {
      element.textContent = DESKTOP_PRODUCT_NAME
    }
  }
}

/**
 * Own the window title and the pre-boot splash brand.
 *
 * macOS derives the window title from the page, and the upstream document
 * declares its own before any plugin loads, so the title is asserted from the
 * preload. The observer detaches once the splash is gone and the title holds,
 * keeping no permanent work on the render path.
 */
function installDesktopBranding(): void {
  const apply = (): void => {
    if (document.title !== DESKTOP_PRODUCT_NAME) document.title = DESKTOP_PRODUCT_NAME
    rewriteBootWordmark()
  }
  const start = (): void => {
    apply()
    if (document.documentElement === null) return
    const observer = new MutationObserver(() => {
      apply()
      if (document.querySelector(BOOT_ROOT_SELECTOR) === null
        && document.title === DESKTOP_PRODUCT_NAME) {
        observer.disconnect()
      }
    })
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
    return
  }
  start()
}

installDesktopBranding()
