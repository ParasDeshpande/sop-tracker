'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

interface Props {
  currentQuery: string
  currentStatus: string
}

export function SubmissionsFilter({ currentQuery, currentStatus }: Props) {
  const [query, setQuery] = useState(currentQuery)
  const router = useRouter()
  const pathname = usePathname()

  const applyFilters = (q: string, status: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (status && status !== 'ALL') params.set('status', status)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex gap-3 flex-wrap items-end">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyFilters(query, currentStatus)}
          placeholder="Search by title, user, or template..."
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <select
        value={currentStatus}
        onChange={e => applyFilters(query, e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="ALL">All Statuses</option>
        <option value="APPROVED">Approved</option>
        <option value="PENDING_APPROVAL">Pending Approval</option>
        <option value="REJECTED">Rejected</option>
        <option value="SUBMITTED">Submitted</option>
      </select>
      <button onClick={() => applyFilters(query, currentStatus)} className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700">
        Search
      </button>
      {(currentQuery || currentStatus !== 'ALL') && (
        <button onClick={() => { setQuery(''); applyFilters('', 'ALL') }} className="text-sm text-gray-500 hover:underline">
          Clear
        </button>
      )}
    </div>
  )
}
