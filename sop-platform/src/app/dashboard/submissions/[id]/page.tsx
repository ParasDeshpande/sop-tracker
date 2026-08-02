import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { FormField } from '@/lib/field-types'
import Link from 'next/link'

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const submission = await prisma.sOPSubmission.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      department: { select: { name: true } },
      template: true,
      project: { select: { name: true, client: true } },
    },
  })

  if (!submission) redirect('/dashboard/submissions')

  // Users can only see their own, admins can see all
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
  if (!isAdmin && submission.userId !== session.user.id) redirect('/dashboard/submissions')

  const fields = JSON.parse(submission.template.fields) as FormField[]
  const responses = JSON.parse(submission.responses) as Record<string, any>
  const files = JSON.parse(submission.files) as { fieldId: string; label: string; filename: string; path: string }[]

  const getFileForField = (fieldId: string) => files.find(f => f.fieldId === fieldId)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{submission.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{submission.department.name} • {submission.template.title}</p>
        </div>
        <Link href={`/api/submissions/${submission.id}/pdf`} target="_blank" className="bg-primary-600 text-white px-4 py-2 rounded text-sm hover:bg-primary-700">
          Download PDF
        </Link>
      </div>

      {/* Metadata */}
      <div className="bg-white p-5 rounded-lg shadow mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Submitted by:</span> <span className="font-medium">{submission.user.name}</span></div>
          <div><span className="text-gray-500">Email:</span> {submission.user.email}</div>
          <div><span className="text-gray-500">Date:</span> {new Date(submission.submittedAt).toLocaleString()}</div>
          <div><span className="text-gray-500">Status:</span> <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{submission.status}</span></div>
          {submission.project && <div><span className="text-gray-500">Project:</span> {submission.project.name} ({submission.project.client})</div>}
        </div>
      </div>

      {/* Responses */}
      <div className="space-y-3">
        {fields.map(field => {
          if (field.type === 'section_header') {
            return (
              <div key={field.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                <h3 className="font-semibold text-gray-700">{field.label}</h3>
              </div>
            )
          }

          const value = responses[field.id]
          const file = getFileForField(field.id)

          return (
            <div key={field.id} className="bg-white p-5 rounded-lg shadow">
              <p className="text-sm font-medium text-gray-600 mb-2">{field.label}</p>

              {field.type === 'yes_no_na' && (
                <span className={`font-semibold ${value === 'YES' ? 'text-green-600' : value === 'NO' ? 'text-red-600' : 'text-gray-500'}`}>
                  {value || '—'}
                </span>
              )}

              {(field.type === 'short_text' || field.type === 'long_text') && (
                <p className="text-sm">{value || <span className="text-gray-400">No answer</span>}</p>
              )}

              {(field.type === 'radio' || field.type === 'dropdown') && (
                <p className="text-sm font-medium">{value || <span className="text-gray-400">Not selected</span>}</p>
              )}

              {field.type === 'checkbox' && (
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(value) && value.length > 0 ? value.map((v: string) => (
                    <span key={v} className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs">{v}</span>
                  )) : <span className="text-gray-400 text-sm">None selected</span>}
                </div>
              )}

              {field.type === 'date' && <p className="text-sm">{value || '—'}</p>}
              {field.type === 'time' && <p className="text-sm">{value || '—'}</p>}

              {(field.type === 'file_upload') && (
                file ? <a href={file.path} target="_blank" className="text-primary-600 text-sm hover:underline">📎 {file.filename}</a>
                     : <span className="text-gray-400 text-sm">No file uploaded</span>
              )}

              {field.type === 'image' && (
                file ? <img src={file.path} alt={file.label} className="max-h-64 rounded border mt-1" />
                     : <span className="text-gray-400 text-sm">No image uploaded</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
