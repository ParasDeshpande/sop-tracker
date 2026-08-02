import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { templateId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const draft = await prisma.sOPDraft.findUnique({
    where: { templateId_userId: { templateId: params.templateId, userId: session.user.id } },
  })

  if (!draft) return NextResponse.json(null, { status: 404 })
  return NextResponse.json(draft)
}

export async function DELETE(req: Request, { params }: { params: { templateId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.sOPDraft.deleteMany({ where: { templateId: params.templateId, userId: session.user.id } })
  return NextResponse.json({ success: true })
}
