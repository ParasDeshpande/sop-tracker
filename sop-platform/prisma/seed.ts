import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function fid() { return 'f_' + Math.random().toString(36).substring(2, 10) }

async function main() {
  const deptNames = ['HR Department', 'Administration Department', 'Marketing Department', 'Structural Design Department', 'Tendering Department', 'Project Execution Department']
  const departments: Record<string, string> = {}
  for (const name of deptNames) {
    const dept = await prisma.department.upsert({ where: { name }, update: {}, create: { name } })
    departments[name] = dept.id
  }

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const superAdmin = await prisma.user.upsert({ where: { email: 'superadmin@sumedhainfra.com' }, update: {}, create: { email: 'superadmin@sumedhainfra.com', password: hashedPassword, name: 'Rajesh Kumar', role: 'SUPER_ADMIN', emailVerified: true, isActive: true } })
  const hrAdmin = await prisma.user.upsert({ where: { email: 'hr.admin@sumedhainfra.com' }, update: {}, create: { email: 'hr.admin@sumedhainfra.com', password: hashedPassword, name: 'Priya Sharma', role: 'ADMIN', departmentId: departments['HR Department'], emailVerified: true, isActive: true } })
  const execAdmin = await prisma.user.upsert({ where: { email: 'exec.admin@sumedhainfra.com' }, update: {}, create: { email: 'exec.admin@sumedhainfra.com', password: hashedPassword, name: 'Vikram Singh', role: 'ADMIN', departmentId: departments['Project Execution Department'], emailVerified: true, isActive: true } })
  const user1 = await prisma.user.upsert({ where: { email: 'ankit@sumedhainfra.com' }, update: {}, create: { email: 'ankit@sumedhainfra.com', password: hashedPassword, name: 'Ankit Patel', role: 'USER', departmentId: departments['Project Execution Department'], emailVerified: true, isActive: true } })
  const user2 = await prisma.user.upsert({ where: { email: 'meera@sumedhainfra.com' }, update: {}, create: { email: 'meera@sumedhainfra.com', password: hashedPassword, name: 'Meera Joshi', role: 'USER', departmentId: departments['HR Department'], emailVerified: true, isActive: true } })
  const user3 = await prisma.user.upsert({ where: { email: 'rahul@sumedhainfra.com' }, update: {}, create: { email: 'rahul@sumedhainfra.com', password: hashedPassword, name: 'Rahul Verma', role: 'USER', departmentId: departments['Marketing Department'], emailVerified: true, isActive: true } })

  // Projects
  await prisma.project.upsert({ where: { id: 'proj-highway-01' }, update: {}, create: { id: 'proj-highway-01', name: 'Mumbai-Pune Expressway Extension', client: 'NHAI', departmentId: departments['Project Execution Department'] } })
  await prisma.project.upsert({ where: { id: 'proj-bridge-01' }, update: {}, create: { id: 'proj-bridge-01', name: 'Godavari Bridge Construction', client: 'Telangana State Govt', departmentId: departments['Project Execution Department'] } })

  // Template 1: Employee Onboarding (Google Forms style)
  const onboardFields = [
    { id: fid(), type: 'section_header', label: 'Personal Information', required: false },
    { id: fid(), type: 'short_text', label: 'Employee Full Name', required: true },
    { id: fid(), type: 'date', label: 'Date of Joining', required: true },
    { id: fid(), type: 'dropdown', label: 'Designation', required: true, options: ['Site Engineer', 'Project Manager', 'Architect', 'Safety Officer', 'Accounts Executive', 'HR Executive'] },
    { id: fid(), type: 'image', label: 'Passport Photo', required: true },
    { id: fid(), type: 'section_header', label: 'Document Verification', required: false },
    { id: fid(), type: 'checkbox', label: 'Documents Collected', required: true, options: ['Aadhar Card', 'PAN Card', 'Educational Certificates', 'Previous Employment Letter', 'Bank Passbook'] },
    { id: fid(), type: 'file_upload', label: 'ID Proof Scan', required: true },
    { id: fid(), type: 'section_header', label: 'Onboarding Steps', required: false },
    { id: fid(), type: 'yes_no_na', label: 'Email account created', required: true },
    { id: fid(), type: 'yes_no_na', label: 'ID card issued', required: true },
    { id: fid(), type: 'yes_no_na', label: 'Workstation assigned', required: true },
    { id: fid(), type: 'yes_no_na', label: 'Orientation completed', required: true },
    { id: fid(), type: 'long_text', label: 'Remarks', required: false },
  ]

  const tmpl1 = await prisma.sOPTemplate.upsert({ where: { id: 'tmpl-onboarding' }, update: { fields: JSON.stringify(onboardFields) }, create: { id: 'tmpl-onboarding', title: 'Employee Onboarding', departmentId: departments['HR Department'], fields: JSON.stringify(onboardFields), createdBy: hrAdmin.id } })

  // Template 2: Daily Site Update (DAILY TRACKER - like the Excel sheet)
  const dailyFields = [
    { id: 'f_pourcard', type: 'yes_no_na', label: 'Pour Card signed by client', required: true },
    { id: 'f_checklist', type: 'yes_no_na', label: 'All Checklists signed by client', required: true },
    { id: 'f_hindrance', type: 'yes_no_na', label: 'Hindrance register updated & signed by PMC/Client', required: true },
    { id: 'f_dpr_sign', type: 'yes_no_na', label: 'DPR signed by PM', required: true },
    { id: 'f_dpr_erp', type: 'yes_no_na', label: 'DPR uploaded to ERP with PM approval', required: true },
    { id: 'f_earthwork', type: 'yes_no_na', label: 'Earthwork DPR uploaded to ERP', required: true },
    { id: 'f_cube', type: 'yes_no_na', label: 'Cube Register signed by PM & PMC', required: true },
    { id: 'f_progress', type: 'yes_no_na', label: 'Work progress tracked (L-section colored after casting)', required: true },
    { id: 'f_weekly', type: 'yes_no_na', label: 'Weekly progress sheet sent to HO', required: false },
    { id: 'f_meeting', type: 'yes_no_na', label: 'Daily meeting conducted by PM', required: true },
    { id: 'f_issues', type: 'long_text', label: 'Daily issues (if any)', required: false },
    { id: 'f_store_inward', type: 'yes_no_na', label: 'Inward material updated & signed by PM', required: true },
    { id: 'f_grn', type: 'yes_no_na', label: 'GRN uploaded to ERP with PM approval', required: true },
    { id: 'f_gin', type: 'yes_no_na', label: 'GIN uploaded to ERP with PM approval', required: true },
    { id: 'f_tbt', type: 'yes_no_na', label: 'TBT conducted on-site & confirmed by PM', required: true },
    { id: 'f_permit', type: 'yes_no_na', label: 'Daily work permit signed', required: true },
    { id: 'f_tools', type: 'yes_no_na', label: 'Tools & machinery inspected by safety officer', required: false },
    { id: 'f_site_photo', type: 'image', label: 'Site Photo', required: false },
    { id: 'f_remark', type: 'long_text', label: 'Remark', required: false },
  ]

  const tmpl2 = await prisma.sOPTemplate.upsert({ where: { id: 'tmpl-daily-site' }, update: { fields: JSON.stringify(dailyFields) }, create: { id: 'tmpl-daily-site', title: 'PM Daily Site Update', description: 'Daily data update sheet as per company SOP', departmentId: departments['Project Execution Department'], fields: JSON.stringify(dailyFields), createdBy: execAdmin.id, isDaily: true } })

  // Template 3: Safety Inspection
  const safetyFields = [
    { id: fid(), type: 'date', label: 'Inspection Date', required: true },
    { id: fid(), type: 'short_text', label: 'Site Location / Block', required: true },
    { id: fid(), type: 'yes_no_na', label: 'PPE compliance for all workers', required: true },
    { id: fid(), type: 'yes_no_na', label: 'Scaffolding stability checked', required: true },
    { id: fid(), type: 'yes_no_na', label: 'Fire extinguishers in place', required: true },
    { id: fid(), type: 'yes_no_na', label: 'Electrical connections safe', required: true },
    { id: fid(), type: 'yes_no_na', label: 'First aid kit available', required: true },
    { id: fid(), type: 'yes_no_na', label: 'Emergency exits clear', required: true },
    { id: fid(), type: 'yes_no_na', label: 'Safety signage in place', required: true },
    { id: fid(), type: 'image', label: 'Site Photo Evidence', required: true },
    { id: fid(), type: 'file_upload', label: 'Safety Audit Form (signed)', required: true },
    { id: fid(), type: 'long_text', label: 'Observations / Incidents', required: false },
  ]

  const tmpl3 = await prisma.sOPTemplate.upsert({ where: { id: 'tmpl-safety' }, update: { fields: JSON.stringify(safetyFields) }, create: { id: 'tmpl-safety', title: 'Site Safety Inspection', departmentId: departments['Project Execution Department'], fields: JSON.stringify(safetyFields), createdBy: execAdmin.id } })

  // Create demo submissions for daily tracker (last 12 days)
  for (let daysAgo = 0; daysAgo < 12; daysAgo++) {
    const submittedAt = new Date()
    submittedAt.setDate(submittedAt.getDate() - daysAgo)
    submittedAt.setHours(9 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60))

    const responses: Record<string, any> = {}
    for (const field of dailyFields) {
      if (field.type === 'yes_no_na') {
        const rand = Math.random()
        responses[field.id] = rand > 0.2 ? 'YES' : rand > 0.1 ? 'NO' : 'NA'
      } else if (field.type === 'long_text' && field.id === 'f_remark') {
        responses[field.id] = daysAgo % 3 === 0 ? 'Client representative not available for signature' : ''
      }
    }

    await prisma.sOPSubmission.create({
      data: {
        templateId: tmpl2.id,
        userId: user1.id,
        departmentId: departments['Project Execution Department'],
        projectId: 'proj-highway-01',
        title: `Daily Update - ${submittedAt.toLocaleDateString()}`,
        responses: JSON.stringify(responses),
        files: '[]',
        status: 'SUBMITTED',
        submittedAt,
      },
    })
  }

  // Create a few other submissions
  const otherSubs = [
    { tmpl: tmpl1, user: user2, dept: 'HR Department', title: 'Onboarding - Suresh Reddy', daysAgo: 1 },
    { tmpl: tmpl1, user: user2, dept: 'HR Department', title: 'Onboarding - Kavitha Nair', daysAgo: 3 },
    { tmpl: tmpl3, user: user1, dept: 'Project Execution Department', title: 'Safety Inspection - Block A', daysAgo: 2 },
    { tmpl: tmpl3, user: user1, dept: 'Project Execution Department', title: 'Safety Inspection - Bridge Site', daysAgo: 5 },
  ]

  for (const s of otherSubs) {
    const submittedAt = new Date()
    submittedAt.setDate(submittedAt.getDate() - s.daysAgo)
    const responses: Record<string, any> = {}
    const fields = JSON.parse(s.tmpl.fields) as any[]
    for (const f of fields) {
      if (f.type === 'yes_no_na') responses[f.id] = Math.random() > 0.15 ? 'YES' : 'NO'
      else if (f.type === 'short_text') responses[f.id] = 'Demo data'
      else if (f.type === 'date') responses[f.id] = submittedAt.toISOString().split('T')[0]
    }
    await prisma.sOPSubmission.create({
      data: { templateId: s.tmpl.id, userId: s.user.id, departmentId: departments[s.dept], title: s.title, responses: JSON.stringify(responses), files: '[]', submittedAt },
    })
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: superAdmin.id, message: 'New SOP "Daily Update" by Ankit Patel', link: '/dashboard/submissions' },
      { userId: superAdmin.id, message: 'New SOP "Onboarding - Suresh Reddy" by Meera Joshi', link: '/dashboard/submissions' },
      { userId: execAdmin.id, message: 'New SOP "Safety Inspection - Block A" by Ankit Patel', link: '/dashboard/submissions' },
    ],
  })

  console.log('✅ Seed completed')
  console.log('')
  console.log('Demo accounts (password: admin123):')
  console.log('  superadmin@sumedhainfra.com  |  hr.admin@sumedhainfra.com')
  console.log('  exec.admin@sumedhainfra.com  |  ankit@sumedhainfra.com')
  console.log('  meera@sumedhainfra.com       |  rahul@sumedhainfra.com')
  console.log('')
  console.log('Features: Google Forms builder, Daily Tracker grid, Image rendering, Full submission view + PDF')
}

main().catch(console.error).finally(() => prisma.$disconnect())
