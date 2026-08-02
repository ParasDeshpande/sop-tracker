'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  name: string
  isActive: boolean
}

export function DepartmentActions({ id, name, isActive }: Props) {
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState(name)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRename = async () => {
    if (!newName.trim() || newName === name) { setEditing(false); return }
    setLoading(true)
    await fetch('/api/departments/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: newName.trim() }),
    })
    setEditing(false)
    setLoading(false)
    router.refresh()
  }

  const handleToggleArchive = async () => {
    setLoading(true)
    await fetch('/api/departments/toggle-archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setLoading(false)
    router.refresh()
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input value={newName} onChange={e => setNewName(e.target.value)} className="text-xs border rounded px-2 py-1 w-32" />
        <button onClick={handleRename} disabled={loading} className="text-xs bg-primary-600 text-white px-2 py-1 rounded">Save</button>
        <button onClick={() => setEditing(false)} className="text-xs text-gray-500">Cancel</button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setEditing(true)} className="text-xs text-primary-600 hover:underline">Rename</button>
      <button onClick={handleToggleArchive} disabled={loading} className={`text-xs ${isActive ? 'text-yellow-600' : 'text-green-600'} hover:underline`}>
        {isActive ? 'Archive' : 'Restore'}
      </button>
    </div>
  )
}
