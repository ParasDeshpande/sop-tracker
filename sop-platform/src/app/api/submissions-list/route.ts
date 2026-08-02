import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'

  const submissions = await prisma.sOPSubmission.findMany({
    where: isAdmin ? {} : { userId: session.user.id },
    include: {
      template: { select: { title: true } },
      department: { select: { name: true } },
      user: { select: { name: true } },
    },
    orderBy: { submittedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(submissions)
}
