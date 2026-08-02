import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const submission = await prisma.sOPSubmission.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      department: { select: { name: true } },
      template: true,
      project: { select: { name: true, client: true } },
    },
  })

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
  if (submission.userId !== session.user.id && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const fields = JSON.parse(submission.template.fields) as any[]
  const responses = JSON.parse(submission.responses) as Record<string, any>
  const files = JSON.parse(submission.files) as { fieldId: string; label: string; filename: string; path: string }[]

  // Build image data URIs for embedding in HTML
  const imageDataMap: Record<string, string> = {}
  for (const file of files) {
    const field = fields.find(f => f.id === file.fieldId)
    if (field?.type === 'image') {
      try {
        const filePath = join(process.cwd(), 'public', file.path)
        const buffer = await readFile(filePath)
        const ext = file.filename.split('.').pop()?.toLowerCase() || 'png'
        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/png'
        imageDataMap[file.fieldId] = `data:${mime};base64,${buffer.toString('base64')}`
      } catch {}
    }
  }

  // Generate response rows
  const responseRows = fields.map(field => {
    if (field.type === 'section_header') {
      return `<tr><td colspan="2" style="background:#f3f4f6;padding:12px;font-weight:bold;border-top:2px solid #ddd;">${field.label}</td></tr>`
    }

    const value = responses[field.id]
    const file = files.find(f => f.fieldId === field.id)
    let display = ''

    if (field.type === 'yes_no_na') {
      const color = value === 'YES' ? 'green' : value === 'NO' ? 'red' : '#666'
      display = `<span style="color:${color};font-weight:bold;">${value || '—'}</span>`
    } else if (field.type === 'checkbox') {
      display = Array.isArray(value) && value.length > 0 ? value.join(', ') : '—'
    } else if (field.type === 'image' && imageDataMap[field.id]) {
      display = `<img src="${imageDataMap[field.id]}" style="max-height:200px;max-width:100%;border-radius:4px;" />`
    } else if (field.type === 'file_upload' && file) {
      display = `📎 ${file.filename}`
    } else {
      display = value || '—'
    }

    return `<tr><td style="padding:8px;border-bottom:1px solid #eee;width:35%;vertical-align:top;font-weight:500;color:#555;">${field.label}${field.required ? ' *' : ''}</td><td style="padding:8px;border-bottom:1px solid #eee;">${display}</td></tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SOP - ${submission.title}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
    .header { text-align: center; border-bottom: 3px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #1d4ed8; margin: 0; font-size: 22px; }
    .header p { color: #666; margin: 5px 0 0; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 30px; font-size: 13px; background: #f9fafb; padding: 15px; border-radius: 8px; }
    .meta span { color: #666; }
    .meta strong { color: #333; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Sumedha Infra Developers Pvt Ltd</h1>
    <p>SOP Submission Report</p>
  </div>

  <h2 style="font-size:18px;margin-bottom:5px;">${submission.title}</h2>
  <p style="color:#666;font-size:13px;margin-top:0;">Template: ${submission.template.title}</p>

  <div class="meta">
    <div><span>Submitted by:</span> <strong>${submission.user.name}</strong></div>
    <div><span>Email:</span> <strong>${submission.user.email}</strong></div>
    <div><span>Department:</span> <strong>${submission.department.name}</strong></div>
    <div><span>Date:</span> <strong>${new Date(submission.submittedAt).toLocaleString()}</strong></div>
    ${submission.project ? `<div><span>Project:</span> <strong>${submission.project.name}</strong></div><div><span>Client:</span> <strong>${submission.project.client}</strong></div>` : ''}
  </div>

  <table>${responseRows}</table>

  <div class="footer">
    Generated on ${new Date().toLocaleString()} • Sumedha Infra SOP Platform
  </div>

  <div class="no-print" style="text-align:center;margin-top:20px;">
    <button onclick="window.print()" style="background:#1d4ed8;color:white;border:none;padding:10px 30px;border-radius:5px;cursor:pointer;font-size:14px;">Print / Save as PDF</button>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
