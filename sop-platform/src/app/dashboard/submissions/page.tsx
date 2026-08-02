import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SubmissionsFilter } from '@/components/SubmissionsFilter'

export const dynamic = 'force-dynamic'

export default async function SubmissionsPage({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN'

  const where: any = isAdmin ? {} : { userId: session!.user.id }

  if (searchParams.status && searchParams.status !== 'ALL') {
    where.status = searchParams.status
  }

  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { user: { name: { contains: searchParams.q } } },
      { template: { title: { contains: searchParams.q } } },
    ]
  }

  const submissions = await prisma.sOPSubmission.findMany({
    where,
    include: {
      user: { select: { name: true } },
      department: { select: { name: true } },
      template: { select: { title: true } },
    },
    orderBy: { submittedAt: 'desc' },
    take: 100,
  })

  const statusColors: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
    SUBMITTED: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{isAdmin ? 'All Submissions' : 'My Submissions'}</h1>

      <SubmissionsFilter currentQuery={searchParams.q || ''} currentStatus={searchParams.status || 'ALL'} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              {isAdmin && <th className="text-left px-4 py-3">Submitted By</th>}
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Template</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map(s => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.title}</td>
                {isAdmin && <td className="px-4 py-3">{s.user.name}</td>}
                <td className="px-4 py-3">{s.department.name}</td>
                <td className="px-4 py-3">{s.template.title}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[s.status] || 'bg-gray-100 text-gray-600'}`}>
                    {s.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">{new Date(s.submittedAt).toLocaleString()}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/dashboard/submissions/${s.id}`} className="text-primary-600 hover:underline text-xs">View</Link>
                  <Link href={`/api/submissions/${s.id}/pdf`} target="_blank" className="text-green-600 hover:underline text-xs">PDF</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {submissions.length === 0 && <p className="p-4 text-center text-gray-500">No submissions match your filters.</p>}
      </div>
    </div>
  )
}
