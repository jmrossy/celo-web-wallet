import { StorageProvider } from 'src/features/storage/types'

function validate(path: string, data?: string, assertData = false) {
  if (!localStorage) throw new Error('localStorage unavailable')
  if (!path) throw new Error('Invalid storage path')
  if (assertData && !data) throw new Error('No data provided to store')
}

function hasItem(path: string) {
  validate(path)
  return !!localStorage.getItem(path)
}

function getItem(path: string) {
  validate(path)
  return localStorage.getItem(path)
}

function setItem(path: string, data: string, allowOverwrite = false) {
  validate(path, data, true)
  if (hasItem(path) && !allowOverwrite) throw new Error('Attempting to overwrite existing item')
  // TODO warn safari users of apple's bullshit
  // https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
  localStorage.setItem(path, data)
}

function removeItem(path: string) {
  validate(path)
  localStorage.removeItem(path)
}

export const storageProvider: StorageProvider = {
  hasItem,
  getItem,
  setItem,
  removeItem,
}
