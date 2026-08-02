import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TrackerPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
  if (!isAdmin) redirect('/dashboard')

  // Get daily tracker templates
  const templates = await prisma.sOPTemplate.findMany({
    where: { isDaily: true, isActive: true },
    include: { department: { select: { name: true } } },
  })

  // Current month date range
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = now.toLocaleString('en', { month: 'long', year: 'numeric' })

  // Get all submissions for daily templates this month
  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

  const submissions = await prisma.sOPSubmission.findMany({
    where: {
      templateId: { in: templates.map(t => t.id) },
      submittedAt: { gte: startOfMonth, lte: endOfMonth },
    },
    include: { user: { select: { name: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daily Tracker — {monthName}</h1>
      </div>

      {templates.length === 0 ? (
        <p className="text-gray-500">No daily tracker templates configured. Create a template and mark it as "Daily Tracker".</p>
      ) : (
        templates.map(template => {
          const fields = JSON.parse(template.fields) as any[]
          const taskFields = fields.filter(f => f.type === 'yes_no_na' || (f.type !== 'section_header'))
          const templateSubs = submissions.filter(s => s.templateId === template.id)

          return (
            <div key={template.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="font-semibold">{template.title}</h2>
                <p className="text-xs text-gray-500">{template.department.name}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="text-xs border-collapse w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1 text-left sticky left-0 bg-gray-100 min-w-[200px]">Task</th>
                      {Array.from({ length: daysInMonth }, (_, i) => (
                        <th key={i} className="border px-1 py-1 text-center min-w-[32px]">{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {taskFields.filter(f => f.type !== 'section_header').map((field: any) => (
                      <tr key={field.id}>
                        <td className="border px-2 py-1 font-medium sticky left-0 bg-white">{field.label}</td>
                        {Array.from({ length: daysInMonth }, (_, dayIdx) => {
                          const day = dayIdx + 1
                          // Find submission for this day
                          const sub = templateSubs.find(s => {
                            const d = new Date(s.submittedAt)
                            return d.getDate() === day
                          })
                          let cellValue = ''
                          let cellColor = ''
                          if (sub) {
                            const responses = JSON.parse(sub.responses)
                            const val = responses[field.id]
                            if (val === 'YES') { cellValue = '✓'; cellColor = 'bg-green-100 text-green-700' }
                            else if (val === 'NO') { cellValue = '✗'; cellColor = 'bg-red-100 text-red-700' }
                            else if (val === 'NA') { cellValue = '—'; cellColor = 'bg-gray-100 text-gray-400' }
                            else if (val) { cellValue = '●'; cellColor = 'bg-blue-50 text-blue-600' }
                          }
                          return (
                            <td key={dayIdx} className={`border px-1 py-1 text-center font-bold ${cellColor}`}>
                              {cellValue}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 flex gap-4">
                <span>✓ = YES</span><span className="text-red-600">✗ = NO</span><span>— = NA</span><span className="text-blue-600">● = Answered</span>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
