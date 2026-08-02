import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { title, description, departmentId, isDaily, fields, approverIds } = await req.json()

  if (session.user.role === 'ADMIN' && session.user.departmentId && session.user.departmentId !== departmentId) {
    return NextResponse.json({ error: 'You can only create templates for your department' }, { status: 403 })
  }

  const template = await prisma.sOPTemplate.create({
    data: {
      title,
      description,
      departmentId,
      isDaily: isDaily || false,
      fields: JSON.stringify(fields),
      approverIds: approverIds ? JSON.stringify(approverIds) : null,
      createdBy: session.user.id,
    },
  })

  return NextResponse.json(template)
}
