export interface StorageProvider {
  hasItem: (path: string) => boolean
  getItem: (path: string) => string | null
  setItem: (path: string, data: string, allowOverwrite?: boolean) => void
  removeItem: (path: string) => void | Promise<void>
}
