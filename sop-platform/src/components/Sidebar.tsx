'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface SidebarProps {
  user: { name: string; role: string; email: string }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
  const isSuperAdmin = user.role === 'SUPER_ADMIN'
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = () => {
      fetch('/api/notifications').then(r => r.json()).then(d => setUnreadCount(d.unread || 0))
    }
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const links = [
    { href: '/dashboard', label: 'Dashboard', show: true },
    { href: '/dashboard/sops', label: 'SOPs', show: true },
    { href: '/dashboard/my-tasks', label: 'My Tasks', show: user.role === 'USER' },
    { href: '/dashboard/submissions', label: isAdmin ? 'All Submissions' : 'My Submissions', show: true },
    { href: '/dashboard/project-sops', label: 'Project SOPs', show: isAdmin },
    { href: '/dashboard/tracker', label: 'Daily Tracker', show: isAdmin },
    { href: '/dashboard/templates', label: 'Manage Templates', show: isAdmin },
    { href: '/dashboard/projects', label: 'Projects / Clients', show: isAdmin },
    { href: '/dashboard/users', label: 'Manage Users', show: isSuperAdmin },
    { href: '/dashboard/departments', label: 'Departments', show: isSuperAdmin },
    { href: '/dashboard/reports', label: 'Reports', show: isAdmin },
    { href: '/dashboard/notifications', label: 'Notifications', show: true, badge: unreadCount },
  ]

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold text-primary-700">Sumedha Infra</h1>
        <p className="text-xs text-gray-500">SOP Platform</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.filter(l => l.show).map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center justify-between px-3 py-2 rounded text-sm ${pathname === link.href ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <span>{link.label}</span>
            {'badge' in link && link.badge! > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{link.badge}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-gray-500">{user.role.replace('_', ' ')}</p>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="mt-2 text-xs text-red-600 hover:underline">
          Sign Out
        </button>
      </div>
    </aside>
  )
}
