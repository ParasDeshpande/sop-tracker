'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { FormField } from '@/lib/field-types'

interface Template {
  title: string
  description?: string
  department: { name: string }
  fields?: FormField[]
}

export default function PreviewTemplatePage() {
  const params = useParams()
  const [template, setTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetch(`/api/templates/${params.id}`)
      .then(r => r.json())
      .then(setTemplate)
      .catch(() => setTemplate(null))
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
          {template.description && <p className="text-sm text-gray-500 mt-1">{template.description}</p>}
          <p className="text-sm text-gray-500 mt-2">{template.department?.name}</p>
        </div>

        {(template.fields || []).map((field, i) => (
          <div key={field.id || i} className="border rounded p-4 bg-gray-50">
            {field.type === 'section_header' ? (
              <div className="border-b-2 border-gray-200 pb-2">
                <h3 className="font-semibold text-gray-700">{field.label}</h3>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </p>
                {field.type === 'short_text' && <div className="mt-2 border-b border-gray-300 py-2 text-sm text-gray-400">Short answer text</div>}
                {field.type === 'long_text' && <div className="mt-2 border rounded p-2 text-sm text-gray-400 h-16">Long answer text</div>}
                {field.type === 'number' && <div className="mt-2 border-b border-gray-300 py-2 text-sm text-gray-400">123</div>}
                {field.type === 'phone_number' && <div className="mt-2 border-b border-gray-300 py-2 text-sm text-gray-400">+91 98765 43210</div>}
                {field.type === 'currency' && <div className="mt-2 border-b border-gray-300 py-2 text-sm text-gray-400">₹ 1,000.00</div>}
                {field.type === 'date' && <div className="mt-2 border rounded px-3 py-2 text-sm text-gray-400 w-40">mm/dd/yyyy</div>}
                {field.type === 'time' && <div className="mt-2 border rounded px-3 py-2 text-sm text-gray-400 w-32">--:-- --</div>}
                {field.type === 'file_upload' && <div className="mt-2 border border-dashed rounded p-3 text-sm text-gray-500">File upload area</div>}
                {field.type === 'image' && <div className="mt-2 border border-dashed rounded p-3 text-sm text-gray-500">Image upload area</div>}
                {(field.type === 'radio' || field.type === 'dropdown' || field.type === 'checkbox') && (
                  <div className="mt-2 space-y-2">
                    {field.options?.map((opt, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        {field.type === 'checkbox' ? <input type="checkbox" disabled /> : <input type="radio" disabled />}
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {field.type === 'yes_no_na' && (
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span>YES</span><span>NO</span><span>NA</span>
                  </div>
                )}
                {(field.type === 'number' || field.type === 'currency') && field.comparisonOperator && field.comparisonOperator !== 'none' && field.comparisonValue && (
                  <p className="mt-2 text-xs text-primary-600">Eligibility rule: value {field.comparisonOperator} {field.comparisonValue}</p>
                )}
              </>
            )}
          </div>
        ))}

        {(!template.fields || template.fields.length === 0) && <p className="text-sm text-gray-500">No fields yet for this template.</p>}

        <div className="text-xs text-gray-400 border-t pt-4">
          This is how the SOP form will appear to users. Required fields must be completed before submission.
        </div>
      </div>
    </div>
  )
}
