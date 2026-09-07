import { useCallback, useState } from 'react'
import { loadConfig, saveConfig, type VeilConfig } from './config'

/**
 * Config state + persistence. `update` takes a mutator run against a draft copy;
 * the result is written to localStorage["veil:config"] immediately so an open
 * Instagram / YouTube tab picks it up on its next load.
 */
export function useConfig() {
  const [cfg, setCfg] = useState<VeilConfig>(loadConfig)

  const update = useCallback((mutate: (draft: VeilConfig) => void) => {
    setCfg((prev) => {
      const next = structuredClone(prev)
      mutate(next)
      saveConfig(next)
      return next
    })
  }, [])

  return [cfg, update] as const
}
