/// <reference types="@emotion/core" />

declare module '@redux-saga/simple-saga-monitor'
declare module '@metamask/jazzicon'

declare module '*.svg' {
  import React from 'react'
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  const src: string
  // eslint-disable-next-line import/no-default-export
  export default src
}

declare module '*.json' {
  const content: string
  // eslint-disable-next-line import/no-default-export
  export default content
}
