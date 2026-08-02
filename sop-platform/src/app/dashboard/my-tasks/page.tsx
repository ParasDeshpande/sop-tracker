import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MyTasksPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const tasks = await prisma.projectSOP.findMany({
    where: { assigneeId: session.user.id },
    include: {
      template: { select: { id: true, title: true } },
      project: { select: { name: true, client: true } },
      submission: { select: { id: true } },
    },
    orderBy: { assignedAt: 'desc' },
  })

  const pending = tasks.filter(t => t.status !== 'COMPLETED')
  const completed = tasks.filter(t => t.status === 'COMPLETED')

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Assigned Tasks</h1>

      {pending.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 bg-yellow-50 border-b"><h2 className="font-semibold text-yellow-800">Pending ({pending.length})</h2></div>
          <div className="divide-y">
            {pending.map(task => (
              <div key={task.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{task.template.title}</p>
                  <p className="text-xs text-gray-500">{task.project.name} — {task.project.client}</p>
                  {task.dueDate && <p className="text-xs text-red-600 mt-1">Due: {task.dueDate}</p>}
                  {task.notes && <p className="text-xs text-gray-400 mt-1">{task.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[task.status]}`}>{task.status}</span>
                  <Link href={`/dashboard/sops/${task.template.id}?projectSOPId=${task.id}&projectId=${task.projectId}`} className="bg-primary-600 text-white px-3 py-1 rounded text-xs hover:bg-primary-700">
                    Fill SOP
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 bg-green-50 border-b"><h2 className="font-semibold text-green-800">Completed ({completed.length})</h2></div>
          <div className="divide-y">
            {completed.map(task => (
              <div key={task.id} className="p-4 flex justify-between items-center opacity-70">
                <div>
                  <p className="font-medium">{task.template.title}</p>
                  <p className="text-xs text-gray-500">{task.project.name} — {task.project.client}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">COMPLETED</span>
                  {task.submission && <Link href={`/dashboard/submissions/${task.submission.id}`} className="text-primary-600 text-xs hover:underline">View</Link>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && <p className="text-gray-500">No tasks assigned to you yet.</p>}
    </div>
  )
}
