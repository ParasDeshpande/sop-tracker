'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormField, FieldType, FIELD_TYPE_LABELS, generateFieldId } from '@/lib/field-types'

export default function NewTemplatePage() {
  const router = useRouter()
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [isDaily, setIsDaily] = useState(false)
  const [fields, setFields] = useState<FormField[]>([])
  const [approverIds, setApproverIds] = useState<string[]>([])
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(setDepartments)
    fetch('/api/users-list').then(r => r.json()).then(setUsers)
  }, [])

  const addField = (type: FieldType) => {
    setFields([...fields, {
      id: generateFieldId(),
      type,
      label: '',
      required: false,
      options: type === 'radio' || type === 'dropdown' || type === 'checkbox' ? ['Option 1'] : undefined,
    }])
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = [...fields]
    updated[index] = { ...updated[index], ...updates }
    setFields(updated)
  }

  const removeField = (index: number) => setFields(fields.filter((_, i) => i !== index))

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= fields.length) return
    const updated = [...fields]
    ;[updated[index], updated[newIndex]] = [updated[newIndex], updated[index]]
    setFields(updated)
  }

  const addOption = (fieldIndex: number) => {
    const field = fields[fieldIndex]
    updateField(fieldIndex, { options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`] })
  }

  const updateOption = (fieldIndex: number, optIndex: number, value: string) => {
    const field = fields[fieldIndex]
    const options = [...(field.options || [])]
    options[optIndex] = value
    updateField(fieldIndex, { options })
  }

  const removeOption = (fieldIndex: number, optIndex: number) => {
    const field = fields[fieldIndex]
    updateField(fieldIndex, { options: field.options?.filter((_, i) => i !== optIndex) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !departmentId || fields.length === 0) return
    setLoading(true)
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, departmentId, isDaily, fields, approverIds: approverIds.length > 0 ? approverIds : null }),
    })
    if (res.ok) router.push('/dashboard/templates')
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create SOP Template</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header card */}
        <div className="bg-white p-6 rounded-lg shadow border-t-4 border-primary-600">
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Untitled Form" className="w-full text-2xl font-medium border-b border-gray-200 pb-2 mb-3 focus:border-primary-500 outline-none" required />
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Form description (optional)" className="w-full text-sm text-gray-600 border-b border-gray-200 pb-2 mb-3 focus:border-primary-500 outline-none" />
          <div className="flex gap-4 flex-wrap">
            <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} required className="border rounded px-3 py-2 text-sm">
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isDaily} onChange={e => setIsDaily(e.target.checked)} />
              Daily Tracker (grid view on dashboard)
            </label>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Approval Required From (optional)</label>
            <p className="text-xs text-gray-400 mb-2">If set, submissions need approval before reaching admins. Leave empty for auto-approval.</p>
            <div className="flex flex-wrap gap-2">
              {users.map(u => (
                <label key={u.id} className={`flex items-center gap-1 text-xs border rounded px-2 py-1 cursor-pointer ${approverIds.includes(u.id) ? 'bg-primary-50 border-primary-300' : 'border-gray-200'}`}>
                  <input type="checkbox" checked={approverIds.includes(u.id)} onChange={() => setApproverIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])} className="rounded" />
                  {u.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Fields */}
        {fields.map((field, i) => (
          <div key={field.id} className="bg-white p-5 rounded-lg shadow border-l-4 border-gray-200 hover:border-primary-400 transition">
            <div className="flex gap-3 mb-3">
              <input type="text" value={field.label} onChange={e => updateField(i, { label: e.target.value })} placeholder="Question" className="flex-1 text-sm font-medium border-b border-gray-200 pb-1 focus:border-primary-500 outline-none" />
              <select value={field.type} onChange={e => updateField(i, { type: e.target.value as FieldType, options: ['radio', 'dropdown', 'checkbox'].includes(e.target.value) ? field.options || ['Option 1'] : undefined })} className="text-xs border rounded px-2 py-1">
                {Object.entries(FIELD_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            {/* Preview of field type */}
            <div className="mb-3 text-sm text-gray-400">
              {field.type === 'short_text' && <div className="border-b border-dotted border-gray-300 w-2/3 py-1">Short answer text</div>}
              {field.type === 'long_text' && <div className="border border-dotted border-gray-300 rounded w-full h-16 p-2">Long answer text</div>}
              {field.type === 'date' && <div className="border border-gray-200 rounded px-3 py-1 w-40">mm/dd/yyyy</div>}
              {field.type === 'time' && <div className="border border-gray-200 rounded px-3 py-1 w-32">--:-- --</div>}
              {field.type === 'file_upload' && <div className="border border-dashed border-gray-300 rounded p-3 text-center">File upload area</div>}
              {field.type === 'image' && <div className="border border-dashed border-gray-300 rounded p-3 text-center">Image upload (will render in response)</div>}
              {field.type === 'section_header' && <div className="border-b-2 border-gray-300 pb-1 font-semibold text-gray-600">Section divider</div>}
              {field.type === 'yes_no_na' && (
                <div className="flex gap-4">
                  {['YES', 'NO', 'NA'].map(opt => <label key={opt} className="flex items-center gap-1"><input type="radio" disabled />{opt}</label>)}
                </div>
              )}
              {(field.type === 'radio' || field.type === 'dropdown' || field.type === 'checkbox') && (
                <div className="space-y-2">
                  {field.options?.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      {field.type === 'checkbox' ? <input type="checkbox" disabled /> : <input type="radio" disabled />}
                      <input type="text" value={opt} onChange={e => updateOption(i, oi, e.target.value)} className="border-b border-gray-200 text-sm text-gray-700 focus:border-primary-500 outline-none flex-1" />
                      {(field.options?.length || 0) > 1 && <button type="button" onClick={() => removeOption(i, oi)} className="text-red-400 text-xs">✕</button>}
                    </div>
                  ))}
                  <button type="button" onClick={() => addOption(i)} className="text-primary-600 text-xs hover:underline">+ Add option</button>
                </div>
              )}
            </div>

            {/* Field controls */}
            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex gap-2">
                <button type="button" onClick={() => moveField(i, -1)} disabled={i === 0} className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30">↑</button>
                <button type="button" onClick={() => moveField(i, 1)} disabled={i === fields.length - 1} className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30">↓</button>
                <button type="button" onClick={() => removeField(i)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <span>Required</span>
                <input type="checkbox" checked={field.required} onChange={e => updateField(i, { required: e.target.checked })} className="rounded" />
              </label>
            </div>
          </div>
        ))}

        {/* Add field buttons */}
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-xs text-gray-500 mb-2">Add field:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FIELD_TYPE_LABELS).map(([type, label]) => (
              <button key={type} type="button" onClick={() => addField(type as FieldType)} className="text-xs border border-gray-200 rounded px-3 py-1.5 hover:bg-primary-50 hover:border-primary-300 transition">
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading || fields.length === 0} className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Template'}
          </button>
          <span className="text-sm text-gray-500 self-center">{fields.length} field(s)</span>
        </div>
      </form>
    </div>
  )
}
