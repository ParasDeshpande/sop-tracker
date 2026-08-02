import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await req.json()
  const dept = await prisma.department.findUnique({ where: { id } })
  if (!dept) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.department.update({ where: { id }, data: { isActive: !dept.isActive } })
  return NextResponse.json({ success: true })
}
