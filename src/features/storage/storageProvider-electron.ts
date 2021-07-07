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
  if (!hasItem(path)) return null
  return fs.readFileSync(fullPath, 'utf8')
}

// This uses a similar method as the write-file-atomic lib
// It writes to a temp file then renames the tmp file
function setItem(path: string, data: string, allowOverwrite = false) {
  if (!data) throw new Error('No data provided to store')
  if (hasItem(path) && !allowOverwrite) throw new Error('Attempting to overwrite existing item')
  const tmpFullPath = getAppCwdPath(getTmpFilePath(path))
  const realFullPath = getAppCwdPath(path)
  fs.writeFileSync(tmpFullPath, data, { encoding: 'utf8' })
  fs.renameSync(tmpFullPath, realFullPath)
  if (!hasItem(path)) throw new Error('Setting item in storage seems to have failed')
}

function getTmpFilePath(path: string) {
  const parts = path.split('.')
  if (parts.length !== 2) throw new Error(`Invalid file path ${path}`)
  const name = parts[0]
  const ext = parts[1]
  return `${name}-tmp-${Date.now()}.${ext}`
}

function removeItem(path: string) {
  if (!hasItem(path)) return
  const fullPath = getAppCwdPath(path)
  fs.unlinkSync(fullPath)
  if (hasItem(path)) throw new Error('Item removal seems to have failed')
}

export const storageProvider: StorageProvider = Object.freeze({
  hasItem,
  getItem,
  setItem,
  removeItem,
})
