'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

interface TemplateItem {
  id: string
  title: string
  departmentName: string
}

interface SOPSearchProps {
  templates: TemplateItem[]
}

export default function SOPSearch({ templates }: SOPSearchProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return templates
    return templates.filter((template) =>
      template.title.toLowerCase().includes(term) || template.departmentName.toLowerCase().includes(term)
    )
  }, [query, templates])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">SOP Library</h2>
          <p className="text-sm text-gray-500">Search by title or department. Partial queries and single letters match.</p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search SOPs..."
          className="w-full sm:w-80 rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((template) => (
          <Link
            key={template.id}
            href={`/dashboard/sops/${template.id}`}
            className="border rounded-3xl bg-white p-6 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <p className="font-medium text-slate-900">{template.title}</p>
            <p className="mt-2 text-xs text-slate-500">{template.departmentName}</p>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">No SOPs match your search.</p>
      )}
    </div>
  )
}
