import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AssignSOPForm } from '@/components/AssignSOPForm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) redirect('/dashboard')

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { department: { select: { name: true } } },
  })
  if (!project) redirect('/dashboard/projects')

  const projectSOPs = await prisma.projectSOP.findMany({
    where: { projectId: params.id },
    include: {
      template: { select: { title: true } },
      assignee: { select: { name: true, email: true } },
      submission: { select: { id: true, submittedAt: true } },
    },
    orderBy: { assignedAt: 'desc' },
  })

  const templates = await prisma.sOPTemplate.findMany({
    where: { isActive: true },
    select: { id: true, title: true, department: { select: { name: true } } },
    orderBy: { title: 'asc' },
  })

  const templatesWithDept = templates.map((template) => ({
    id: template.id,
    title: template.title,
    departmentName: template.department.name,
  }))

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-gray-500">{project.client} • {project.department.name}</p>
      </div>

      {/* Assign SOP form */}
      <AssignSOPForm projectId={params.id} templates={templatesWithDept} users={users} />

      {/* Timeline / assigned SOPs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h2 className="font-semibold">Project SOPs Timeline</h2>
          <p className="text-xs text-gray-500">{projectSOPs.length} SOPs assigned</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2">SOP</th>
              <th className="text-left px-4 py-2">Assigned To</th>
              <th className="text-left px-4 py-2">Due Date</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {projectSOPs.map(ps => (
              <tr key={ps.id} className="border-t">
                <td className="px-4 py-3 font-medium">{ps.template.title}</td>
                <td className="px-4 py-3">{ps.assignee.name}</td>
                <td className="px-4 py-3">{ps.dueDate || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[ps.status] || ''}`}>{ps.status}</span>
                </td>
                <td className="px-4 py-3">
                  {ps.submission ? (
                    <Link href={`/dashboard/submissions/${ps.submission.id}`} className="text-primary-600 text-xs hover:underline">
                      {new Date(ps.submission.submittedAt).toLocaleDateString()}
                    </Link>
                  ) : <span className="text-gray-400 text-xs">Not yet</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projectSOPs.length === 0 && <p className="p-4 text-center text-gray-500 text-sm">No SOPs assigned yet. Use the form above to assign.</p>}
      </div>
    </div>
  )
}
