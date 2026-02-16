
'use client'

import { isDemoMode } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function DemoBadge() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        setShow(isDemoMode())
    }, [])

    if (!show) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-amber-500 text-white px-3 py-1 rounded-full shadow-lg font-medium text-sm animate-pulse">
            Demo Mode
        </div>
    )
}
