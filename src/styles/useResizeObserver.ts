import { useCallback, useLayoutEffect, useRef, useState } from 'react'

// Based on https://tobbelindstrom.com/blog/resize-observer-hook/
export const useResizeObserver = () => {
  const [observerEntry, setObserverEntry] = useState<ResizeObserverEntry | null>(null)
  const [nodeRef, setNodeRef] = useState<Element | null>(null)
  const observer = useRef<ResizeObserver | null>(null)

  const disconnect = useCallback(() => observer.current?.disconnect(), [])

  const observe = useCallback(() => {
    observer.current = new ResizeObserver((entries) => {
      setObserverEntry(entries[0])
    })
    if (nodeRef) observer.current.observe(nodeRef)
  }, [nodeRef])

  useLayoutEffect(() => {
    observe()
    return () => disconnect()
  }, [disconnect, observe])

  return { setNodeRef, observerEntry }
}

export const useDimensionsResizeObserver = (
  initialWidthEstimate?: number,
  initialHeightEstimate?: number
) => {
  const { setNodeRef, observerEntry } = useResizeObserver()
  if (observerEntry) {
    const contentRect = observerEntry.contentRect
    const width = Math.round(contentRect.width)
    const height = Math.round(contentRect.height)
    return { setNodeRef, width, height }
  } else {
    return { setNodeRef, width: initialWidthEstimate ?? 1, height: initialHeightEstimate ?? 1 }
  }
}
