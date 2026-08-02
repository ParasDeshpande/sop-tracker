import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { templateId, title, responses, projectId } = await req.json()

  await prisma.sOPDraft.upsert({
    where: { templateId_userId: { templateId, userId: session.user.id } },
    update: { title, responses: responses || '{}', files: '[]', projectId },
    create: { templateId, userId: session.user.id, title, responses: responses || '{}', files: '[]', projectId },
  })

  return NextResponse.json({ success: true })
}
