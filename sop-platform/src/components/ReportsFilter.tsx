'use client'

import { useState } from 'react'

interface Props {
  departments: { id: string; name: string }[]
}

export function ReportsFilter({ departments }: Props) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [departmentId, setDepartmentId] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const buildUrl = () => {
    const params = new URLSearchParams()
    params.set('startDate', startDate)
    params.set('endDate', endDate)
    if (departmentId) params.set('departmentId', departmentId)
    return `/api/reports/export?${params.toString()}`
  }

  const handlePreview = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('startDate', startDate)
    params.set('endDate', endDate)
    if (departmentId) params.set('departmentId', departmentId)
    params.set('preview', 'true')

    const res = await fetch(`/api/reports/export?${params.toString()}`)
    const data = await res.json()
    setPreview(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Export & Preview</h2>
        <div className="flex gap-4 flex-wrap items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <button onClick={handlePreview} disabled={loading} className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300">
            {loading ? 'Loading...' : 'Preview'}
          </button>
          <a href={buildUrl()} className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700">
            Download Excel
          </a>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <p className="text-sm text-gray-600">{preview.length} submissions found</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2">Title</th>
                  <th className="text-left px-4 py-2">Template</th>
                  <th className="text-left px-4 py-2">Department</th>
                  <th className="text-left px-4 py-2">User</th>
                  <th className="text-left px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((s: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{s.title}</td>
                    <td className="px-4 py-2">{s.template}</td>
                    <td className="px-4 py-2">{s.department}</td>
                    <td className="px-4 py-2">{s.user}</td>
                    <td className="px-4 py-2">{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
