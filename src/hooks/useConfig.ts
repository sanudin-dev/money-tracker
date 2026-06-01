'use client'

import { createContext, useContext, useCallback, useSyncExternalStore, createElement, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Config } from '@/types'
import { getConfig, setConfig } from '@/lib/storage'
import { detectDefaultCurrency } from '@/lib/currency'

type ConfigContextValue = {
  config: Partial<Config>
  update: (updates: Partial<Config>) => void
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

// Module-level store so all ConfigProvider instances share the same state
let _config: Partial<Config> = {}
let _initialized = false
const _listeners = new Set<() => void>()

function subscribe(listener: () => void): () => void {
  _listeners.add(listener)
  return () => { _listeners.delete(listener) }
}

function getSnapshot(): Partial<Config> {
  if (!_initialized) {
    _config = getConfig()
    _initialized = true
  }
  return _config
}

const SERVER_SNAPSHOT: Partial<Config> = {}

function getServerSnapshot(): Partial<Config> {
  return SERVER_SNAPSHOT
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const config = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const update = useCallback((updates: Partial<Config>) => {
    if (!_initialized) {
      _config = getConfig()
      _initialized = true
    }
    _config = { ..._config, ...updates }
    setConfig(_config)
    _listeners.forEach((fn) => fn())
  }, [])

  // Auto-save detected currency on first visit so all components have a consistent value.
  useEffect(() => {
    if (!config.currencyCode) {
      update({ currencyCode: detectDefaultCurrency() })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return createElement(ConfigContext.Provider, { value: { config, update } }, children)
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
