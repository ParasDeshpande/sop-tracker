import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, sendEmailToMany } from '@/lib/email'
import { createApprovalToken } from '@/lib/approval-token'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const templateId = formData.get('templateId') as string
  const title = formData.get('title') as string
  const responsesStr = formData.get('responses') as string
  const rawProjectId = (formData.get('projectId') as string) || ''
  const projectId = rawProjectId.trim() || null
  const rawProjectSOPId = (formData.get('projectSOPId') as string) || ''
  const projectSOPId = rawProjectSOPId.trim() || null

  const template = await prisma.sOPTemplate.findUnique({ where: { id: templateId } })
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  // Determine if approval is needed
  const approverIds: string[] = template.approverIds ? JSON.parse(template.approverIds) : []
  const needsApproval = approverIds.length > 0

  const fields = JSON.parse(template.fields) as any[]
  const uploadedFiles: { fieldId: string; label: string; filename: string; path: string }[] = []

  const uploadDir = join(process.cwd(), 'public', 'uploads', session.user.id)
  await mkdir(uploadDir, { recursive: true })

  for (const field of fields) {
    if (field.type === 'file_upload' || field.type === 'image') {
      const file = formData.get(field.id) as File | null
      if (file && file.size > 0) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ error: `File "${field.label}" exceeds 10MB limit` }, { status: 400 })
        }
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const filename = `${Date.now()}-${safeName}`
        await writeFile(join(uploadDir, filename), buffer)
        uploadedFiles.push({ fieldId: field.id, label: field.label, filename: file.name, path: `/uploads/${session.user.id}/${filename}` })
      }
    }
  }

  try {
    const submission = await prisma.sOPSubmission.create({
      data: {
        templateId,
        userId: session.user.id,
        departmentId: template.departmentId,
        projectId,
        projectSOPId,
        title,
        responses: responsesStr,
        files: JSON.stringify(uploadedFiles),
        status: needsApproval ? 'PENDING_APPROVAL' : 'APPROVED',
      },
    })

    if (projectSOPId) {
      await prisma.projectSOP.update({
        where: { id: projectSOPId },
        data: { status: needsApproval ? 'IN_PROGRESS' : 'COMPLETED', completedAt: needsApproval ? undefined : new Date() },
      })
    }

    if (needsApproval) {
      // Send approval emails to each approver
      for (const approverId of approverIds) {
        const approver = await prisma.user.findUnique({ where: { id: approverId } })
        if (!approver) continue

        const token = createApprovalToken(submission.id, approverId)

        // Save token on submission (use first approver's token)
        if (!submission.approvalToken) {
          await prisma.sOPSubmission.update({
            where: { id: submission.id },
            data: { approvalToken: token },
          })
        }

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const approveUrl = `${baseUrl}/api/approve?token=${token}&action=approve`
        const rejectUrl = `${baseUrl}/api/approve?token=${token}&action=reject`

        await sendEmail(
          approver.email,
          `Approval Required: ${title}`,
          `Hi ${approver.name},\n\n${session.user.name} has submitted "${title}" which requires your approval.\n\nTo APPROVE: ${approveUrl}\n\nTo REJECT: ${rejectUrl}\n\nThis link expires in 7 days.\n\n— Sumedha Infra SOP Platform`
        )

        await prisma.notification.create({
          data: { userId: approverId, message: `Approval needed: "${title}" by ${session.user.name}`, link: `/dashboard/submissions/${submission.id}` },
        })
      }
    } else {
      // No approval needed — notify admins directly
      const admins = await prisma.user.findMany({
        where: { isActive: true, OR: [{ role: 'ADMIN', departmentId: template.departmentId }, { role: 'SUPER_ADMIN' }] },
      })

      for (const admin of admins) {
        await prisma.notification.create({
          data: { userId: admin.id, message: `New SOP "${title}" by ${session.user.name}`, link: `/dashboard/submissions/${submission.id}` },
        })
      }

      await sendEmailToMany(
        admins.map(a => a.email),
        `SOP Submitted: ${title}`,
        `${session.user.name} has submitted "${title}" (Template: ${template.title}). No approval required — auto-approved.\n\nLog in to view.`
      )
    }

    return NextResponse.json(submission)
  } catch (err: any) {
    console.error('Submission error:', err.message, err.meta)
    return NextResponse.json({ error: 'Submission failed', details: err.meta }, { status: 500 })
  }
}
