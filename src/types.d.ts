/// <reference types="@emotion/react/types/css-prop" />

declare module '@metamask/jazzicon'

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
