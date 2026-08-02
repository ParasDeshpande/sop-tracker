import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardCharts } from '@/components/DashboardCharts'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalSubmissions = await prisma.sOPSubmission.count()
  const todaySubmissions = await prisma.sOPSubmission.count({
    where: { submittedAt: { gte: today } },
  })
  const totalUsers = await prisma.user.count({ where: { isActive: true } })
  const totalTemplates = await prisma.sOPTemplate.count({ where: { isActive: true } })

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: { _count: { select: { submissions: true } } },
  })

  // Last 7 days data for chart - single query instead of N+1
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const recentSubs = await prisma.sOPSubmission.findMany({
    where: { submittedAt: { gte: sevenDaysAgo } },
    select: { submittedAt: true },
  })

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })

  const dailyCounts = last7Days.map(day => {
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    const count = recentSubs.filter(s => s.submittedAt >= day && s.submittedAt < nextDay).length
    return { date: day.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }), count }
  })

  const recentSubmissions = await prisma.sOPSubmission.findMany({
    take: 10,
    orderBy: { submittedAt: 'desc' },
    include: { user: { select: { name: true } }, department: { select: { name: true } }, template: { select: { title: true } } },
  })

  const chartData = {
    dailyCounts,
    departmentData: departments.map(d => ({ name: d.name.replace(' Department', ''), count: d._count.submissions })),
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Submissions</p>
          <p className="text-3xl font-bold text-primary-600">{totalSubmissions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Submitted Today</p>
          <p className="text-3xl font-bold text-green-600">{todaySubmissions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="text-3xl font-bold text-purple-600">{totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Active Templates</p>
          <p className="text-3xl font-bold text-orange-600">{totalTemplates}</p>
        </div>
      </div>

      {isAdmin && <DashboardCharts data={chartData} />}

      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Department-wise Submissions</h2>
          <div className="space-y-2">
            {departments.map(dept => (
              <div key={dept.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm">{dept.name}</span>
                <span className="text-sm font-medium bg-primary-50 text-primary-700 px-2 py-1 rounded">{dept._count.submissions}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Submissions</h2>
        {recentSubmissions.length === 0 ? (
          <p className="text-gray-500 text-sm">No submissions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2">SOP</th>
                <th className="pb-2">User</th>
                <th className="pb-2">Department</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map(sub => (
                <tr key={sub.id} className="border-b last:border-0">
                  <td className="py-2">{sub.template.title}</td>
                  <td className="py-2">{sub.user.name}</td>
                  <td className="py-2">{sub.department.name}</td>
                  <td className="py-2">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
