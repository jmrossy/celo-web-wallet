export function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(() => resolve(true), milliseconds))
}

export async function promiseTimeout<T>(promise: Promise<T>, milliseconds: number) {
  // Create a promise that resolves null in <ms> milliseconds
  const timeout = new Promise<null>((resolve) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      resolve(null)
    }, milliseconds)
  })
  const result = await Promise.race([promise, timeout])
  return result
}
