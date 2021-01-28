import { ipcRenderer } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import { StorageProvider } from 'src/features/storage/types'

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

function setItem(path: string, data: string) {
  if (!data) throw new Error('No data provided to store')
  const fullPath = getAppCwdPath(path)
  fs.writeFileSync(fullPath, data, { encoding: 'utf8' })
}

function removeItem(path: string) {
  const fullPath = getAppCwdPath(path)
  fs.rmSync(fullPath)
}

export const storageProvider: StorageProvider = {
  hasItem,
  getItem,
  setItem,
  removeItem,
}
