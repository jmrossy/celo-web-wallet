export interface StorageProvider {
  hasItem: (path: string) => boolean
  getItem: (path: string) => string | null
  setItem: (path: string, data: string) => void
  removeItem: (path: string) => void
}
