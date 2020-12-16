/// <reference types="@emotion/react/types/css-prop" />

declare module '@metamask/jazzicon'
declare module '@ledgerhq/hw-app-eth'
declare module '@ledgerhq/hw-transport-u2f'
declare module '@ledgerhq/hw-transport-webusb'

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
