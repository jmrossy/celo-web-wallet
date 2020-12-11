import { PureComponent } from 'react'
import { QRCode as _QRCode } from 'src/features/qr/qrGenerator'
import { Color } from 'src/styles/Color'

interface QrProps {
  data: string
  size?: string | number
}

export class QrCode extends PureComponent<QrProps> {
  render() {
    const { data, size: _size } = this.props
    const size = _size || 50

    const svg = _QRCode.generateSVG(data, {
      ecclevel: 'M',
      fillcolor: Color.primaryWhite,
      textcolor: Color.primaryBlack,
      margin: 1,
      modulesize: 8,
    })

    return (
      <div
        css={{ height: size, width: size }}
        ref={(nodeElement) => {
          if (nodeElement) {
            nodeElement.innerHTML = ''
            nodeElement.appendChild(svg)
          }
        }}
      ></div>
    )
  }
}
