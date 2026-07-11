import * as React from "react"
import { QRCodeSVG } from "qrcode.react"

interface QRCodeProps {
  value: string
  size?: number
  className?: string
}

export function QRCode({ value, size = 128, className }: QRCodeProps) {
  return (
    <div className={`p-2 bg-white border-2 border-border brutal-shadow-sm inline-block ${className || ""}`}>
      <QRCodeSVG 
        value={value} 
        size={size}
        level="Q"
        fgColor="#000000"
        bgColor="#ffffff"
      />
    </div>
  )
}
