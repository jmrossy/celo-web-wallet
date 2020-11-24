interface BlockscoutResponse<R> {
  status: string
  result: R
  message: string
}

export async function queryBlockscout<P>(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Fetch Response not okay: ${response.status}`)
  }
  const json = (await response.json()) as BlockscoutResponse<P>

  if (!json.result) {
    const responseText = await response.text()
    throw new Error(`Invalid result format: ${responseText}`)
  }

  return json.result
}
