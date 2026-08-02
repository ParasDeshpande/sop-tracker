'use client'

interface Props {
  data: {
    dailyCounts: { date: string; count: number }[]
    departmentData: { name: string; count: number }[]
  }
}

export function DashboardCharts({ data }: Props) {
  const maxDaily = Math.max(...data.dailyCounts.map(d => d.count), 1)
  const maxDept = Math.max(...data.departmentData.map(d => d.count), 1)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Daily submissions bar chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Submissions - Last 7 Days</h3>
        <div className="flex items-end gap-2 h-40">
          {data.dailyCounts.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">{d.count}</span>
              <div
                className="w-full bg-primary-500 rounded-t transition-all"
                style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: d.count > 0 ? '4px' : '0' }}
              />
              <span className="text-xs text-gray-400 mt-1 truncate w-full text-center">{d.date.split(',')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Department-wise horizontal bar chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">By Department</h3>
        <div className="space-y-3">
          {data.departmentData.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{d.name}</span>
                <span>{d.count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded h-4">
                <div
                  className="h-4 bg-primary-400 rounded transition-all"
                  style={{ width: `${(d.count / maxDept) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
