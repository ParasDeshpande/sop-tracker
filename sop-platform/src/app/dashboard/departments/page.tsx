import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DepartmentActions } from '@/components/DepartmentActions'
import { CreateDepartmentForm } from '@/components/CreateDepartmentForm'

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard')
  }

  const departments = await prisma.department.findMany({
    include: { _count: { select: { users: true, templates: true, submissions: true, projects: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Departments</h1>
      </div>

      <CreateDepartmentForm />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Users</th>
              <th className="text-left px-4 py-3">Templates</th>
              <th className="text-left px-4 py-3">Projects</th>
              <th className="text-left px-4 py-3">Submissions</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.id} className={`border-t ${!d.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3">{d._count.users}</td>
                <td className="px-4 py-3">{d._count.templates}</td>
                <td className="px-4 py-3">{d._count.projects}</td>
                <td className="px-4 py-3">{d._count.submissions}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${d.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {d.isActive ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <DepartmentActions id={d.id} name={d.name} isActive={d.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
