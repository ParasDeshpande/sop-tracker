import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { projectId, templateId, assigneeId, dueDate, notes } = await req.json()

  const [project, template, assignee] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.sOPTemplate.findUnique({ where: { id: templateId } }),
    prisma.user.findUnique({ where: { id: assigneeId } }),
  ])

  if (!project || !template || !assignee) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const projectSOP = await prisma.projectSOP.create({
    data: { projectId, templateId, assigneeId, dueDate, notes },
  })

  // Notify assignee (in-app + email)
  await prisma.notification.create({
    data: {
      userId: assigneeId,
      message: `You have been assigned "${template.title}" for project "${project.name}". ${dueDate ? `Due: ${dueDate}` : ''}`,
      link: `/dashboard/my-tasks`,
    },
  })

  await sendEmail(
    assignee.email,
    `SOP Assigned: ${template.title}`,
    `Hi ${assignee.name},\n\nYou have been assigned the SOP "${template.title}" for project "${project.name}" (Client: ${project.client}).\n${dueDate ? `Due Date: ${dueDate}\n` : ''}${notes ? `Notes: ${notes}\n` : ''}\nPlease log in to the SOP Platform to complete it.\n\n— Sumedha Infra SOP Platform`
  )

  return NextResponse.json(projectSOP)
}
