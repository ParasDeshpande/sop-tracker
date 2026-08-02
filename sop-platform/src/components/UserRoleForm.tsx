'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  currentRole: string
  currentDepartmentId: string
  isActive: boolean
  departments: { id: string; name: string }[]
}

export function UserRoleForm({ userId, currentRole, currentDepartmentId, isActive, departments }: Props) {
  const [role, setRole] = useState(currentRole)
  const [departmentId, setDepartmentId] = useState(currentDepartmentId)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/users/update-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role, departmentId: departmentId || null }),
    })
    setSaving(false)
    router.refresh()
  }

  const handleToggleActive = async () => {
    if (!confirm(isActive ? 'Block this user? They won\'t be able to log in.' : 'Reactivate this user?')) return
    setSaving(true)
    await fetch('/api/users/toggle-active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setSaving(false)
    router.refresh()
  }

  const handleRemove = async () => {
    if (!confirm('Permanently remove this user and all their data? This cannot be undone.')) return
    setSaving(true)
    await fetch('/api/users/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select value={role} onChange={e => setRole(e.target.value)} className="text-xs border rounded px-1 py-1">
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
        <option value="SUPER_ADMIN">Super Admin</option>
      </select>
      <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="text-xs border rounded px-1 py-1">
        <option value="">No Dept</option>
        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <button onClick={handleSave} disabled={saving} className="text-xs bg-primary-600 text-white px-2 py-1 rounded disabled:opacity-50">
        Save
      </button>
      <button onClick={handleToggleActive} disabled={saving} className={`text-xs px-2 py-1 rounded ${isActive ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
        {isActive ? 'Block' : 'Unblock'}
      </button>
      <button onClick={handleRemove} disabled={saving} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
        Remove
      </button>
    </div>
  )
}
