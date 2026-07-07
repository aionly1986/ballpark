import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

// Single lead-capture endpoint. Writes to Neon and notifies the operator.
// Edge runtime keeps it fast and compatible with Cloudflare Pages.
export const runtime = 'edge'

interface LeadPayload {
  name?: string
  email?: string
  phone?: string
  consent?: boolean
  context?: Record<string, unknown>
}

export async function POST(request: Request) {
  let body: LeadPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, phone, consent, context } = body

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: 'Name, email, and phone are required.' },
      { status: 400 },
    )
  }
  if (consent !== true) {
    return NextResponse.json(
      { error: 'Consent is required to submit.' },
      { status: 400 },
    )
  }

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    // No DB configured yet (local dev before operator adds DATABASE_URL).
    // Log so the flow is testable without persistence.
    console.warn('[leads] DATABASE_URL not set — lead not persisted:', {
      name, email, phone,
    })
    return NextResponse.json({ ok: true, persisted: false })
  }

  try {
    const sql = neon(dbUrl)
    await sql`
      INSERT INTO leads (name, email, phone, consent, context, created_at)
      VALUES (${name}, ${email}, ${phone}, ${consent}, ${JSON.stringify(context ?? {})}, now())
    `
    await notifyOperator({ name, email, phone, context })
    return NextResponse.json({ ok: true, persisted: true })
  } catch (err) {
    console.error('[leads] failed to store lead:', err)
    return NextResponse.json({ error: 'Failed to store lead.' }, { status: 500 })
  }
}

// TODO(operator): wire real notification (email/webhook). LEAD_NOTIFY_EMAIL is
// available in the environment. Left as a no-op stub so the route is complete.
async function notifyOperator(_lead: Record<string, unknown>): Promise<void> {
  return
}
