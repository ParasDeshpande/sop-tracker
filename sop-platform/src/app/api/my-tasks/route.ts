import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tasks = await prisma.projectSOP.findMany({
    where: { assigneeId: session.user.id },
    include: {
      template: { select: { id: true, title: true } },
      project: { select: { name: true, client: true } },
    },
    orderBy: { assignedAt: 'desc' },
  })

  return NextResponse.json(tasks.map(t => ({ ...t, projectId: t.projectId })))
}
