import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const templates = await prisma.sOPTemplate.findMany({
    where: { isActive: true },
    include: { department: { select: { name: true } } },
    orderBy: { department: { name: 'asc' } },
  })

  return NextResponse.json(templates.map(t => ({
    ...t,
    fields: JSON.parse(t.fields),
  })))
}
