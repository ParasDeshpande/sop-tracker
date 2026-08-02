'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({
    title: '',
    departmentId: '',
    isActive: true,
    checklist: [{ item: '', required: true }],
    fileLabels: [{ label: '', required: false }],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/departments').then(r => r.json()),
      fetch(`/api/templates/${params.id}`).then(r => r.json()),
    ]).then(([depts, template]) => {
      setDepartments(depts)
      setForm({
        title: template.title,
        departmentId: template.departmentId,
        isActive: template.isActive,
        checklist: template.checklist.map((c: any) => typeof c === 'string' ? { item: c, required: true } : c),
        fileLabels: template.fileLabels.map((f: any) => typeof f === 'string' ? { label: f, required: false } : f),
      })
      setLoading(false)
    })
  }, [params.id])

  const addChecklistItem = () => setForm({ ...form, checklist: [...form.checklist, { item: '', required: true }] })
  const removeChecklistItem = (i: number) => setForm({ ...form, checklist: form.checklist.filter((_, idx) => idx !== i) })
  const updateChecklistItem = (i: number, field: string, val: any) => {
    const updated = [...form.checklist]
    updated[i] = { ...updated[i], [field]: val }
    setForm({ ...form, checklist: updated })
  }

  const addFileLabel = () => setForm({ ...form, fileLabels: [...form.fileLabels, { label: '', required: false }] })
  const removeFileLabel = (i: number) => setForm({ ...form, fileLabels: form.fileLabels.filter((_, idx) => idx !== i) })
  const updateFileLabel = (i: number, field: string, val: any) => {
    const updated = [...form.fileLabels]
    updated[i] = { ...updated[i], [field]: val }
    setForm({ ...form, fileLabels: updated })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/templates/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        departmentId: form.departmentId,
        isActive: form.isActive,
        checklist: form.checklist.filter(c => c.item),
        fileLabels: form.fileLabels.filter(f => f.label),
      }),
    })
    if (res.ok) router.push('/dashboard/templates')
    setSaving(false)
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Template</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Template Title</label>
          <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <select required value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className="w-full border rounded px-3 py-2">
            <option value="">Select department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
            <span className="text-sm font-medium text-gray-700">Active (visible to users)</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Checklist Steps</label>
          {form.checklist.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input type="text" value={item.item} onChange={e => updateChecklistItem(i, 'item', e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm" />
              <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                <input type="checkbox" checked={item.required} onChange={e => updateChecklistItem(i, 'required', e.target.checked)} />
                Required
              </label>
              {form.checklist.length > 1 && <button type="button" onClick={() => removeChecklistItem(i)} className="text-red-500 text-sm">✕</button>}
            </div>
          ))}
          <button type="button" onClick={addChecklistItem} className="text-primary-600 text-sm hover:underline">+ Add Step</button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">File Upload Tabs</label>
          {form.fileLabels.map((f, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <input type="text" value={f.label} onChange={e => updateFileLabel(i, 'label', e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm" />
              <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                <input type="checkbox" checked={f.required} onChange={e => updateFileLabel(i, 'required', e.target.checked)} />
                Required
              </label>
              {form.fileLabels.length > 1 && <button type="button" onClick={() => removeFileLabel(i)} className="text-red-500 text-sm">✕</button>}
            </div>
          ))}
          <button type="button" onClick={addFileLabel} className="text-primary-600 text-sm hover:underline">+ Add File Tab</button>
        </div>

        <button type="submit" disabled={saving} className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
