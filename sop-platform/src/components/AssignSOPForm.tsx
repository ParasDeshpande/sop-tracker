'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  projectId: string
  templates: { id: string; title: string; departmentName: string }[]
  users: { id: string; name: string; email: string }[]
}

export function AssignSOPForm({ projectId, templates, users }: Props) {
  const [templateId, setTemplateId] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!templateId || !assigneeId) return
    setLoading(true)
    await fetch('/api/project-sops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, templateId, assigneeId, dueDate: dueDate || null, notes: notes || null }),
    })
    setTemplateId('')
    setAssigneeId('')
    setDueDate('')
    setNotes('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-semibold mb-3">Assign SOP to User</h3>
      <div className="flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-gray-500 mb-1">SOP Template</label>
          <select value={templateId} onChange={e => setTemplateId(e.target.value)} required className="w-full border rounded px-2 py-1.5 text-sm">
            <option value="">Select SOP</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.departmentName})
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-gray-500 mb-1">Assign To</label>
          <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} required className="w-full border rounded px-2 py-1.5 text-sm">
            <option value="">Select User</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="block text-xs text-gray-500 mb-1">Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs text-gray-500 mb-1">Notes</label>
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" placeholder="Optional" />
        </div>
        <button type="submit" disabled={loading} className="bg-primary-600 text-white px-4 py-1.5 rounded text-sm hover:bg-primary-700 disabled:opacity-50">
          {loading ? 'Assigning...' : 'Assign'}
        </button>
      </div>
    </form>
  )
}
