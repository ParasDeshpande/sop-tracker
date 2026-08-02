'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  departments: { id: string; name: string }[]
}

export function CreateProjectForm({ departments }: Props) {
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, client, departmentId }),
    })
    setName('')
    setClient('')
    setDepartmentId('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow flex gap-3 items-end flex-wrap">
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded px-3 py-2 text-sm" placeholder="Project name" />
      </div>
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
        <input type="text" value={client} onChange={e => setClient(e.target.value)} required className="w-full border rounded px-3 py-2 text-sm" placeholder="Client name" />
      </div>
      <div className="flex-1 min-w-[150px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} required className="w-full border rounded px-3 py-2 text-sm">
          <option value="">Select</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <button type="submit" disabled={loading} className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700 disabled:opacity-50">
        {loading ? 'Adding...' : 'Add Project'}
      </button>
    </form>
  )
}
