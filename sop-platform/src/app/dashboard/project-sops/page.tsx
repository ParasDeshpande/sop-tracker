import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProjectSOPsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
  if (!isAdmin) redirect('/dashboard')

  const projectSOPs = await prisma.projectSOP.findMany({
    include: {
      project: { select: { name: true, client: true } },
      template: { select: { title: true } },
      assignee: { select: { name: true } },
      submission: { select: { id: true, submittedAt: true } },
    },
    orderBy: { assignedAt: 'desc' },
  })

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
  }

  const pending = projectSOPs.filter(p => p.status !== 'COMPLETED')
  const completed = projectSOPs.filter(p => p.status === 'COMPLETED')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Project SOPs</h1>
        <p className="text-sm text-gray-500">{pending.length} pending • {completed.length} completed</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">SOP</th>
              <th className="text-left px-4 py-3">Project</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Assigned To</th>
              <th className="text-left px-4 py-3">Due</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Submission</th>
            </tr>
          </thead>
          <tbody>
            {projectSOPs.map(ps => (
              <tr key={ps.id} className="border-t">
                <td className="px-4 py-3 font-medium">{ps.template.title}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/projects/${ps.projectId}`} className="text-primary-600 hover:underline">{ps.project.name}</Link>
                </td>
                <td className="px-4 py-3">{ps.project.client}</td>
                <td className="px-4 py-3">{ps.assignee.name}</td>
                <td className="px-4 py-3">{ps.dueDate || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[ps.status]}`}>{ps.status}</span>
                </td>
                <td className="px-4 py-3">
                  {ps.submission ? (
                    <Link href={`/dashboard/submissions/${ps.submission.id}`} className="text-primary-600 text-xs hover:underline">
                      View ({new Date(ps.submission.submittedAt).toLocaleDateString()})
                    </Link>
                  ) : <span className="text-gray-400 text-xs">Awaiting</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projectSOPs.length === 0 && <p className="p-4 text-center text-gray-500">No project SOPs assigned yet. Go to Projects → click a project → assign SOPs.</p>}
      </div>
    </div>
  )
}
