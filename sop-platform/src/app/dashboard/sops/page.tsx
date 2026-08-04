import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function SOPsPage() {
  const templates = await prisma.sOPTemplate.findMany({
    where: { isActive: true },
    include: { department: { select: { name: true } } },
    orderBy: { department: { name: 'asc' } },
  })

  const grouped = templates.reduce((acc, t) => {
    const dept = t.department.name
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(t)
    return acc
  }, {} as Record<string, typeof templates>)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Available SOPs</h1>
      <p className="text-sm text-gray-500">Select an SOP template to fill and submit. All departments are visible.</p>

      {Object.entries(grouped).map(([dept, tpls]) => (
        <div key={dept} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3 text-primary-700">{dept}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tpls.map(t => (
              <Link key={t.id} href={`/dashboard/sops/${t.id}`} className="border rounded p-4 hover:border-primary-300 hover:bg-primary-50 transition">
                <p className="font-medium">{t.title}</p>
                <p className="text-xs text-gray-500 mt-1">Click to fill & submit</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
      {templates.length === 0 && <p className="text-gray-500">No SOPs available yet. Admins need to create templates first.</p>}
    </div>
  )
}
