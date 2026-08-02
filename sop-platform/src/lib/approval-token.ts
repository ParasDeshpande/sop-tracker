import crypto from 'crypto'

const SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'

// Simple HMAC-based token (no external dep needed)
export function createApprovalToken(submissionId: string, approverId: string): string {
  const payload = JSON.stringify({ submissionId, approverId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }) // 7 days
  const encoded = Buffer.from(payload).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url')
  return `${encoded}.${sig}`
}

export function verifyApprovalToken(token: string): { submissionId: string; approverId: string } | null {
  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return null

  const expectedSig = crypto.createHmac('sha256', SECRET).update(encoded).digest('base64url')
  if (sig !== expectedSig) return null

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString())
    if (payload.exp < Date.now()) return null // expired
    return { submissionId: payload.submissionId, approverId: payload.approverId }
  } catch {
    return null
  }
}
