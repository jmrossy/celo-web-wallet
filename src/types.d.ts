/// <reference types="@emotion/react/types/css-prop" />

declare module '@metamask/jazzicon'
declare module '@ledgerhq/errors'
declare module '@ledgerhq/hw-app-eth'
declare module '@ledgerhq/hw-transport-u2f'
declare module '@ledgerhq/hw-transport-webusb'
declare module '@ledgerhq/hw-transport-node-hid-noevents'
declare module '@ledgerhq/hw-transport-node-hid-singleton'

declare module '*.svg' {
  import { FunctionComponent, SVGProps } from 'react'
  export const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>
  const src: string
  // eslint-disable-next-line import/no-default-export
  export default src
}

declare module '*.json' {
  const content: string
  // eslint-disable-next-line import/no-default-export
  export default content
}

interface ResizeObserver {
  disconnect(): void
  observe(target: Element, options?: any): void
  unobserve(target: Element): void
}
// eslint-disable-next-line no-var
declare var ResizeObserver: {
  new (callback: ResizeObserverCallback): ResizeObserver
  prototype: ResizeObserver
}
interface ResizeObserverCallback {
  (entries: ResizeObserverEntry[], observer: ResizeObserver): void
}
interface ResizeObserverEntry {
  readonly target: Element
  readonly contentRect: DOMRectReadOnly
  readonly borderBoxSize: ReadonlyArray<ResizeObserverSize>
  readonly contentBoxSize: ReadonlyArray<ResizeObserverSize>
  readonly devicePixelContentBoxSize?: ReadonlyArray<ResizeObserverSize>
}
