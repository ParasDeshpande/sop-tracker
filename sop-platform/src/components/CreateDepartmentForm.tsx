'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function CreateDepartmentForm() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    setName('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow flex gap-3 items-end">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">New Department</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Department name"
          className="w-full border rounded px-3 py-2 text-sm"
          required
        />
      </div>
      <button type="submit" disabled={loading} className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 disabled:opacity-50">
        {loading ? 'Creating...' : 'Create'}
      </button>
    </form>
  )
}
