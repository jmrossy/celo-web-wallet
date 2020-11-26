import { logger } from 'src/utils/logger'

export async function tryClipboardSet(value: string) {
  try {
    await navigator.clipboard.writeText(value)
  } catch (error) {
    logger.error('Failed to set clipboard', error)
  }
}

export async function tryClipboardGet() {
  try {
    const value = await navigator.clipboard.readText()
    return value
  } catch (error) {
    logger.error('Failed to read from clipboard', error)
    return null
  }
}
