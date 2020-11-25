import { css } from '@emotion/react'
import { memo } from 'react'

// From https://loading.io/css/
function _Spinner() {
  return (
    <div css={style}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export const Spinner = memo(_Spinner)

const style = css`
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 8px solid #2e3338;
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #2e3338 transparent transparent transparent;
  }
  div:nth-of-type(1) {
    animation-delay: -0.45s;
  }
  div:nth-of-type(2) {
    animation-delay: -0.3s;
  }
  div:nth-of-type(3) {
    animation-delay: -0.15s;
  }

  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`
