import { pathToFileURL } from 'node:url'
import { resolveCore } from './core-resolution.mjs'

const core = await import(pathToFileURL(resolveCore().entry).href)
export const {
  DEFAULT_REGISTRY_URL, ForgeOperations, ForgeRegistryClient,
  diffValues, ForgeError, mergeForgeRowConfig, validateConfig, withLock, expandHome,
  bootstrapEnvironment, downloadFile, ForgeCatalog, installSkill, SkillRuntimeManager, NodeStore,
} = core
