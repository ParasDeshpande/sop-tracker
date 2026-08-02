'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Template {
  title: string
  department: { name: string }
  checklist: { item: string; required: boolean }[]
  fileLabels: { label: string; required: boolean }[]
}

export default function PreviewTemplatePage() {
  const params = useParams()
  const [template, setTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetch(`/api/templates/${params.id}`).then(r => r.json()).then(setTemplate)
  }, [params.id])

  if (!template) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Template Preview</h1>
        <Link href="/dashboard/templates" className="text-sm text-gray-600 hover:underline">← Back to Templates</Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold">{template.title}</h2>
          <p className="text-sm text-gray-500">{template.department.name}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">SOP Title</p>
          <div className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-400 text-sm">User will enter title here...</div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Checklist</p>
          {template.checklist.map((c, i) => (
            <label key={i} className="flex items-center gap-2 py-1">
              <input type="checkbox" disabled className="rounded" />
              <span className="text-sm">{c.item}</span>
              {c.required && <span className="text-xs text-red-500">*required</span>}
            </label>
          ))}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Document Uploads</p>
          {template.fileLabels.map((f, i) => (
            <div key={i} className="mb-2 p-3 border rounded bg-gray-50">
              <p className="text-sm text-gray-600">{f.label} {f.required && <span className="text-red-500">*required</span>}</p>
              <p className="text-xs text-gray-400 mt-1">File upload field</p>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-400 border-t pt-4">
          This is how the SOP form will appear to users. Required fields must be completed before submission.
        </div>
      </div>
    </div>
  )
}
