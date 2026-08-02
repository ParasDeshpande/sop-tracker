'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { FormField } from '@/lib/field-types'

export default function FillSOPPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectSOPId = searchParams.get('projectSOPId') || ''
  const urlProjectId = searchParams.get('projectId') || ''
  const [template, setTemplate] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [savingDraft, setSavingDraft] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`/api/templates/${params.id}`).then(r => r.json()),
      fetch('/api/projects').then(r => r.json()),
      fetch(`/api/drafts/${params.id}`).then(r => r.ok ? r.json() : null),
    ]).then(([tmpl, projs, draft]) => {
      setTemplate(tmpl)
      setProjects(projs.filter((p: any) => p.departmentId === tmpl.departmentId))
      setTitle(tmpl.title)
      if (draft) {
        setTitle(draft.title || tmpl.title)
        setProjectId(draft.projectId || '')
        try { setResponses(JSON.parse(draft.responses)) } catch {}
      }
      setLoading(false)
    })
  }, [params.id])

  const updateResponse = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }))
  }

  const toggleCheckbox = (fieldId: string, option: string) => {
    const current = responses[fieldId] || []
    const updated = current.includes(option) ? current.filter((o: string) => o !== option) : [...current, option]
    updateResponse(fieldId, updated)
  }

  const validate = (): string[] => {
    const errs: string[] = []
    if (!title.trim()) errs.push('Title is required')
    for (const field of template.fields as FormField[]) {
      if (!field.required) continue
      if (field.type === 'section_header') continue
      const val = responses[field.id]
      if (field.type === 'file_upload' || field.type === 'image') {
        if (!files[field.id]) errs.push(`"${field.label}" is required`)
      } else if (field.type === 'checkbox') {
        if (!val || val.length === 0) errs.push(`"${field.label}" is required`)
      } else if (!val || (typeof val === 'string' && !val.trim())) {
        errs.push(`"${field.label}" is required`)
      }
    }
    return errs
  }

  const handleSaveDraft = async () => {
    setSavingDraft(true)
    await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: params.id, title, projectId: projectId || null, responses: JSON.stringify(responses), }),
    })
    setSavingDraft(false)
    alert('Draft saved!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (errs.length > 0) { setErrors(errs); return }
    setErrors([])
    setSubmitting(true)

    const formData = new FormData()
    formData.append('templateId', params.id as string)
    formData.append('title', title)
    formData.append('projectId', urlProjectId || projectId)
    formData.append('projectSOPId', projectSOPId)
    formData.append('responses', JSON.stringify(responses))

    Object.entries(files).forEach(([fieldId, file]) => {
      if (file) formData.append(fieldId, file)
    })

    const res = await fetch('/api/submissions', { method: 'POST', body: formData })
    if (res.ok) {
      await fetch(`/api/drafts/${params.id}`, { method: 'DELETE' })
      router.refresh()
      router.push('/dashboard/submissions')
    }
    setSubmitting(false)
  }

  if (loading || !template) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow border-t-4 border-primary-600 mb-4">
        <h1 className="text-xl font-bold">{template.title}</h1>
        {template.description && <p className="text-sm text-gray-500 mt-1">{template.description}</p>}
        <p className="text-xs text-gray-400 mt-2">{template.department.name}</p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <ul className="text-sm text-red-600 list-disc pl-4">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <label className="block text-sm font-medium mb-1">SOP Title <span className="text-red-500">*</span></label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded px-3 py-2" required />
        </div>

        {projects.length > 0 && (
          <div className="bg-white p-5 rounded-lg shadow">
            <label className="block text-sm font-medium mb-1">Project / Client</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="">Select (optional)</option>
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name} — {p.client}</option>)}
            </select>
          </div>
        )}

        {(template.fields as FormField[]).map((field) => (
          <div key={field.id} className="bg-white p-5 rounded-lg shadow">
            {field.type === 'section_header' ? (
              <div className="border-b-2 border-gray-200 pb-2">
                <h3 className="font-semibold text-gray-700">{field.label}</h3>
                {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
              </div>
            ) : (
              <>
                <label className="block text-sm font-medium mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'short_text' && (
                  <input type="text" value={responses[field.id] || ''} onChange={e => updateResponse(field.id, e.target.value)} className="w-full border-b border-gray-300 pb-1 focus:border-primary-500 outline-none" placeholder="Your answer" />
                )}

                {field.type === 'long_text' && (
                  <textarea value={responses[field.id] || ''} onChange={e => updateResponse(field.id, e.target.value)} className="w-full border border-gray-300 rounded p-2 h-24 focus:border-primary-500 outline-none" placeholder="Your answer" />
                )}

                {field.type === 'radio' && (
                  <div className="space-y-2">
                    {field.options?.map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input type="radio" name={field.id} checked={responses[field.id] === opt} onChange={() => updateResponse(field.id, opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'checkbox' && (
                  <div className="space-y-2">
                    {field.options?.map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={(responses[field.id] || []).includes(opt)} onChange={() => toggleCheckbox(field.id, opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'dropdown' && (
                  <select value={responses[field.id] || ''} onChange={e => updateResponse(field.id, e.target.value)} className="w-full border rounded px-3 py-2">
                    <option value="">Choose</option>
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}

                {field.type === 'yes_no_na' && (
                  <div className="flex gap-6">
                    {['YES', 'NO', 'NA'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-sm font-medium">
                        <input type="radio" name={field.id} checked={responses[field.id] === opt} onChange={() => updateResponse(field.id, opt)} />
                        <span className={opt === 'YES' ? 'text-green-600' : opt === 'NO' ? 'text-red-600' : 'text-gray-500'}>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === 'date' && (
                  <input type="date" value={responses[field.id] || ''} onChange={e => updateResponse(field.id, e.target.value)} className="border rounded px-3 py-2" />
                )}

                {field.type === 'time' && (
                  <input type="time" value={responses[field.id] || ''} onChange={e => updateResponse(field.id, e.target.value)} className="border rounded px-3 py-2" />
                )}

                {(field.type === 'file_upload' || field.type === 'image') && (
                  <div>
                    <input type="file" accept={field.type === 'image' ? 'image/*' : undefined} onChange={e => setFiles(prev => ({ ...prev, [field.id]: e.target.files?.[0] || null }))} className="text-sm" />
                    {field.type === 'image' && files[field.id] && (
                      <img src={URL.createObjectURL(files[field.id]!)} alt="preview" className="mt-2 max-h-48 rounded border" />
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        <div className="flex gap-3 pb-8">
          <button type="button" onClick={handleSaveDraft} disabled={savingDraft} className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm">
            {savingDraft ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="submit" disabled={submitting} className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}
