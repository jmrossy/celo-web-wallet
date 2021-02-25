import { ipcRenderer } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { StorageProvider } from 'src/features/storage/types'
import { logger } from 'src/utils/logger'
import { sleep } from 'src/utils/sleep'

let defaultCwd: string

function getAppCwdPath(filePath: string) {
  if (!filePath) throw new Error('Invalid storage path')

  if (!defaultCwd) {
    const metadata = ipcRenderer.sendSync('get-app-metadata')
    if (metadata && metadata.defaultCwd) {
      defaultCwd = metadata.defaultCwd
    } else {
      throw new Error('Failed to retrieve app metadata from IPC')
    }
  }

  return path.join(defaultCwd, filePath)
}

function hasItem(path: string) {
  const fullPath = getAppCwdPath(path)
  return fs.existsSync(fullPath)
}

function getItem(path: string) {
  const fullPath = getAppCwdPath(path)
  return fs.readFileSync(fullPath, 'utf8')
}

function setItem(path: string, data: string, allowOverwrite = false) {
  if (!data) throw new Error('No data provided to store')
  if (hasItem(path) && !allowOverwrite) throw new Error('Attempting to overwrite existing item')
  const fullPath = getAppCwdPath(path)
  fs.writeFileSync(fullPath, data, { encoding: 'utf8' })
  if (!hasItem(path)) throw new Error('Setting item seems to have failed')
}

async function removeItem(path: string) {
  if (!hasItem(path)) throw new Error('Item does not exist')
  const fullPath = getAppCwdPath(path)
  for (let i = 0; i < 5; i++) {
    try {
      fs.unlinkSync(fullPath)
      break
    } catch (error) {
      logger.error(`Error removing item ${path}. Retries remaining: ${4 - i}`)
      await sleep(1000)
    }
  }
  if (hasItem(path)) throw new Error('Item removal seems to have failed')
}

export const storageProvider: StorageProvider = {
  hasItem,
  getItem,
  setItem,
  removeItem,
}
