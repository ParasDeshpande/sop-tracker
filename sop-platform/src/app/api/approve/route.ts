import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyApprovalToken } from '@/lib/approval-token'
import { sendEmail, sendEmailToMany } from '@/lib/email'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const action = searchParams.get('action') // approve or reject
  const reason = searchParams.get('reason') || 'No reason provided'

  if (!token || !action) {
    return htmlResponse('Invalid Link', 'This approval link is invalid or missing parameters.', 'error')
  }

  const decoded = verifyApprovalToken(token)
  if (!decoded) {
    return htmlResponse('Link Expired', 'This approval link has expired or is invalid. Please contact the admin.', 'error')
  }

  const submission = await prisma.sOPSubmission.findUnique({
    where: { id: decoded.submissionId },
    include: {
      user: { select: { name: true, email: true } },
      template: { select: { title: true, departmentId: true } },
    },
  })

  if (!submission) {
    return htmlResponse('Not Found', 'This submission no longer exists.', 'error')
  }

  if (submission.status !== 'PENDING_APPROVAL') {
    return htmlResponse('Already Processed', `This SOP has already been ${submission.status.toLowerCase()}.`, 'info')
  }

  const approver = await prisma.user.findUnique({ where: { id: decoded.approverId } })

  if (action === 'approve') {
    await prisma.sOPSubmission.update({
      where: { id: submission.id },
      data: { status: 'APPROVED', approvedBy: decoded.approverId, approvedAt: new Date() },
    })

    // If linked to project SOP, mark completed
    if (submission.projectSOPId) {
      await prisma.projectSOP.update({
        where: { id: submission.projectSOPId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      })
    }

    // Notify dept admin + super admin
    const admins = await prisma.user.findMany({
      where: { isActive: true, OR: [{ role: 'ADMIN', departmentId: submission.template.departmentId }, { role: 'SUPER_ADMIN' }] },
    })

    for (const admin of admins) {
      await prisma.notification.create({
        data: { userId: admin.id, message: `SOP "${submission.title}" approved by ${approver?.name || 'approver'}`, link: `/dashboard/submissions/${submission.id}` },
      })
    }

    await sendEmailToMany(
      admins.map(a => a.email),
      `SOP Approved: ${submission.title}`,
      `"${submission.title}" by ${submission.user.name} has been APPROVED by ${approver?.name || 'approver'}.\n\nLog in to view the submission.`
    )

    // Notify submitter
    await prisma.notification.create({
      data: { userId: submission.userId, message: `Your SOP "${submission.title}" has been approved!`, link: `/dashboard/submissions/${submission.id}` },
    })

    await sendEmail(submission.user.email, `Your SOP Approved: ${submission.title}`, `Hi ${submission.user.name},\n\nYour SOP "${submission.title}" has been approved by ${approver?.name || 'the approver'}.\n\n— Sumedha Infra SOP Platform`)

    return htmlResponse('Approved ✓', `You have approved "${submission.title}" submitted by ${submission.user.name}. The relevant admins have been notified.`, 'success')

  } else if (action === 'reject') {
    await prisma.sOPSubmission.update({
      where: { id: submission.id },
      data: { status: 'REJECTED', approvedBy: decoded.approverId, rejectionNote: reason },
    })

    // Notify submitter
    await prisma.notification.create({
      data: { userId: submission.userId, message: `Your SOP "${submission.title}" was rejected. Reason: ${reason}`, link: `/dashboard/submissions/${submission.id}` },
    })

    await sendEmail(submission.user.email, `SOP Rejected: ${submission.title}`, `Hi ${submission.user.name},\n\nYour SOP "${submission.title}" was rejected by ${approver?.name || 'the approver'}.\nReason: ${reason}\n\nPlease revise and resubmit.\n\n— Sumedha Infra SOP Platform`)

    return htmlResponse('Rejected', `You have rejected "${submission.title}". The submitter has been notified.`, 'warning')
  }

  return htmlResponse('Invalid Action', 'Action must be "approve" or "reject".', 'error')
}

function htmlResponse(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') {
  const colors = { success: '#16a34a', error: '#dc2626', warning: '#d97706', info: '#2563eb' }
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="font-family:system-ui;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f9fafb;">
<div style="text-align:center;padding:40px;max-width:400px;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
<h1 style="color:${colors[type]};font-size:24px;margin-bottom:12px;">${title}</h1>
<p style="color:#4b5563;line-height:1.5;">${message}</p>
<p style="margin-top:24px;color:#9ca3af;font-size:12px;">Sumedha Infra SOP Platform</p>
</div></body></html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}
