import { prisma } from '@/lib/prisma'
import SOPSearch from '@/components/SOPSearch'

export default async function SOPsPage() {
  const templates = await prisma.sOPTemplate.findMany({
    where: { isActive: true },
    include: { department: { select: { name: true } } },
    orderBy: { department: { name: 'asc' }, title: 'asc' },
  })

  const mappedTemplates = templates.map((template) => ({
    id: template.id,
    title: template.title,
    departmentName: template.department.name,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Available SOPs</h1>
      <p className="text-sm text-gray-500">Select an SOP template to fill and submit. All departments are visible.</p>
      <SOPSearch templates={mappedTemplates} />
    </div>
  )
}
