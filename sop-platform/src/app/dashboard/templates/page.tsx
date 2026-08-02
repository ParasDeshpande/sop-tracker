import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    redirect('/dashboard')
  }

  // Admins see templates for their department, super admins see all
  const where = session.user.role === 'ADMIN' && session.user.departmentId
    ? { departmentId: session.user.departmentId }
    : {}

  const templates = await prisma.sOPTemplate.findMany({
    where,
    include: { department: { select: { name: true } }, _count: { select: { submissions: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SOP Templates</h1>
        <Link href="/dashboard/templates/new" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-sm">
          Create Template
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Submissions</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Created</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-3 font-medium">{t.title}</td>
                <td className="px-4 py-3">{t.department.name}</td>
                <td className="px-4 py-3">{t._count.submissions}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/dashboard/templates/${t.id}/edit`} className="text-xs text-primary-600 hover:underline">Edit</Link>
                  <Link href={`/dashboard/templates/${t.id}/preview`} className="text-xs text-green-600 hover:underline">Preview</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {templates.length === 0 && <p className="p-4 text-center text-gray-500">No templates yet. Create one to get started.</p>}
      </div>
    </div>
  )
}
