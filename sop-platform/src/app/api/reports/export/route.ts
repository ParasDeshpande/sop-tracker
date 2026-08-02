import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const departmentId = searchParams.get('departmentId')
  const isPreview = searchParams.get('preview') === 'true'

  // Build filter
  const where: any = {}
  if (startDate && endDate) {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    where.submittedAt = { gte: start, lte: end }
  }
  if (departmentId) {
    where.departmentId = departmentId
  }

  const submissions = await prisma.sOPSubmission.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      department: { select: { name: true } },
      template: { select: { title: true } },
      project: { select: { name: true, client: true } },
    },
    orderBy: { submittedAt: 'desc' },
  })

  // Preview mode - return JSON
  if (isPreview) {
    return NextResponse.json(submissions.map(s => ({
      title: s.title,
      template: s.template.title,
      department: s.department.name,
      user: s.user.name,
      email: s.user.email,
      project: s.project?.name || '-',
      client: s.project?.client || '-',
      date: new Date(s.submittedAt).toLocaleString(),
      status: s.status,
    })))
  }

  // Excel export
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('SOP Submissions')

  sheet.columns = [
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Template', key: 'template', width: 25 },
    { header: 'Department', key: 'department', width: 25 },
    { header: 'Project', key: 'project', width: 20 },
    { header: 'Client', key: 'client', width: 20 },
    { header: 'Submitted By', key: 'user', width: 20 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
  ]

  for (const s of submissions) {
    sheet.addRow({
      title: s.title,
      template: s.template.title,
      department: s.department.name,
      project: s.project?.name || '-',
      client: s.project?.client || '-',
      user: s.user.name,
      email: s.user.email,
      date: new Date(s.submittedAt).toLocaleString(),
      status: s.status,
    })
  }

  const buffer = await workbook.xlsx.writeBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="sop-report-${startDate}-to-${endDate}.xlsx"`,
    },
  })
}
