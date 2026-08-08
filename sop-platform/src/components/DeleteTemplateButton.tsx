'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeleteTemplateButtonProps {
  templateId: string
}

export default function DeleteTemplateButton({ templateId }: DeleteTemplateButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template?')) return
    setLoading(true)

    const res = await fetch(`/api/templates/${templateId}`, { method: 'DELETE' })
    setLoading(false)

    if (res.ok) {
      router.refresh()
    } else {
      const error = await res.json().catch(() => ({ error: 'Delete failed' }))
      alert(error.error || 'Failed to delete template')
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {loading ? 'Deleting…' : 'Delete'}
    </button>
  )
}
