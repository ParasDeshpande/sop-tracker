// Email notification utility
// In production: replace with nodemailer, resend, or AWS SES

export async function sendEmail(to: string, subject: string, body: string) {
  // TODO: Replace with real SMTP when ready
  // Example with nodemailer:
  // const transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 587, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
  // await transporter.sendMail({ from: 'noreply@sumedhainfra.com', to, subject, text: body })

  console.log(`\n📧 EMAIL NOTIFICATION`)
  console.log(`   To: ${to}`)
  console.log(`   Subject: ${subject}`)
  console.log(`   Body: ${body.substring(0, 100)}...`)
  console.log(`   ---\n`)
}

export async function sendEmailToMany(emails: string[], subject: string, body: string) {
  for (const email of emails) {
    await sendEmail(email, subject, body)
  }
}
