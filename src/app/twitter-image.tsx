import { ImageResponse } from 'next/og'
import { OgImageContent, ogImageSize } from '@/lib/ogImageContent'

export const runtime = 'edge'
export const alt = 'Jaydeepp Sikdar - CMO, AI Builder, Educator | Marketing Tools & Frameworks'
export const size = ogImageSize
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(<OgImageContent />, size)
}
