import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    include: { department: { select: { name: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(projects)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { name, client, departmentId } = await req.json()
  if (!name || !client || !departmentId) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }

  const project = await prisma.project.create({ data: { name, client, departmentId } })
  return NextResponse.json(project)
}
