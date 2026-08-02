import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CreateProjectForm } from '@/components/CreateProjectForm'

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN'
  if (!session || !isAdmin) redirect('/dashboard')

  const projects = await prisma.project.findMany({
    include: {
      department: { select: { name: true } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects / Clients</h1>

      <CreateProjectForm departments={departments} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Project Name</th>
              <th className="text-left px-4 py-3">Client</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Submissions</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(p => (
              <tr key={p.id} className={`border-t ${!p.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium">
                  <a href={`/dashboard/projects/${p.id}`} className="text-primary-600 hover:underline">{p.name}</a>
                </td>
                <td className="px-4 py-3">{p.client}</td>
                <td className="px-4 py-3">{p.department.name}</td>
                <td className="px-4 py-3">{p._count.submissions}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.isActive ? 'Active' : 'Closed'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && <p className="p-4 text-center text-gray-500">No projects created yet.</p>}
      </div>
    </div>
  )
}
