import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)

  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // Mark as read
  await prisma.notification.updateMany({
    where: { userId: session!.user.id, read: false },
    data: { read: true },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="bg-white rounded-lg shadow">
        {notifications.length === 0 ? (
          <p className="p-6 text-gray-500">No notifications.</p>
        ) : (
          <ul className="divide-y">
            {notifications.map(n => (
              <li key={n.id} className={`px-6 py-4 ${!n.read ? 'bg-primary-50' : ''}`}>
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
