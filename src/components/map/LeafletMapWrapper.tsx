'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

const LeafletMap = dynamic(
  () =>
    import('./LeafletMap') as unknown as Promise<{
      default: ComponentType<any>
    }>,
  {
    ssr: false,
  }
)

export default LeafletMap
