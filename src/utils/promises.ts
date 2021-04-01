export function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(() => resolve(true), milliseconds))
}

export async function promiseTimeout<T extends any>(promise: Promise<T>, milliseconds: number) {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise<null>((resolve) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      resolve(null)
    }, milliseconds)
  })
  // Awaits the race, which will throw on timeout
  const result = await Promise.race([promise, timeout])
  return result
}
