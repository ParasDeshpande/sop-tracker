import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const template = await prisma.sOPTemplate.findUnique({
    where: { id: params.id },
    include: { department: { select: { name: true } } },
  })
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({
    ...template,
    fields: JSON.parse(template.fields),
  })
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { title, description, departmentId, isActive, isDaily, fields } = await req.json()

  const template = await prisma.sOPTemplate.update({
    where: { id: params.id },
    data: { title, description, departmentId, isActive, isDaily, fields: JSON.stringify(fields) },
  })

  return NextResponse.json(template)
}
