import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { companySetupPath } from '@/lib/desktop-setup'

export const runtime = 'nodejs'

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!))
}

export async function POST(request: Request) {
    // Only an explicit same-origin action can send a link to the signed-in account.
    if (request.headers.get('origin') !== new URL(request.url).origin) {
        return NextResponse.json({ error: 'Please request the link from the setup page.' }, { status: 403 })
    }
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user?.email) return NextResponse.json({ error: 'Please log in to email yourself a setup link.' }, { status: 401 })
        if (!user.email_confirmed_at) return NextResponse.json({ error: 'Please confirm your account email first.' }, { status: 403 })
        const body = await request.json()
        if (typeof body.companySlug !== 'string' || !/^[a-z0-9-]{1,100}$/.test(body.companySlug)) {
            return NextResponse.json({ error: 'Invalid community.' }, { status: 400 })
        }
        const admin = createAdminClient()
        const { data: company, error: companyError } = await admin.from('companies').select('id,name,slug').eq('slug', body.companySlug).maybeSingle()
        if (companyError) throw companyError
        if (!company) return NextResponse.json({ error: 'Community not found.' }, { status: 404 })
        const { data: profile, error: profileError } = await admin.from('profiles').select('company_id').eq('user_id', user.id).maybeSingle()
        if (profileError) throw profileError
        if (profile?.company_id !== company.id) return NextResponse.json({ error: 'Join this community before requesting a setup link.' }, { status: 403 })

        const segment = `requested_desktop_setup_${company.slug}`
        const { data: recent, error: recentError } = await admin.from('email_logs').select('id').eq('user_id', user.id).eq('segment', segment).in('status', ['sent', 'delivered', 'opened', 'clicked']).gte('created_at', new Date(Date.now() - 86400000).toISOString()).limit(1)
        if (recentError) throw recentError
        if (recent?.length) return NextResponse.json({ success: true })
        if (!process.env.RESEND_API_KEY) throw new Error('Email service unavailable')

        const path = companySetupPath(company.slug, typeof body.locale === 'string' ? body.locale : 'en')
        const setupUrl = new URL(path, process.env.NEXT_PUBLIC_APP_URL || 'https://www.idleforest.com')
        setupUrl.searchParams.set('utm_source', 'setup_email')
        setupUrl.searchParams.set('utm_medium', 'email')
        setupUrl.searchParams.set('utm_campaign', `${company.slug}_desktop_handoff`)
        const name = escapeHtml(company.name)
        const url = escapeHtml(setupUrl.toString())
        const subject = `Your IdleForest computer setup link — ${company.name}`
        const text = `You asked for a computer setup link for ${company.name}.\n\nOpen this link on your Windows, Mac, or Linux computer: ${setupUrl}\n\nLog in with the same account, download IdleForest, then open the app and log in. Your ${company.name} membership stays linked.\n\nThis is the one setup email you requested. If you did not request it, you can ignore it.`
        const { data, error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
            from: 'IdleForest <daniel@idleforest.com>', to: user.email, subject, text,
            html: `<div style="max-width:560px;margin:32px auto;font:16px/1.6 Arial,sans-serif;color:#0B101F;padding:24px;border:2px solid #0B101F"><h1 style="font-size:26px">Continue on your computer</h1><p>You asked for a setup link for <strong>${name}</strong>.</p><p>Open this email on your Windows, Mac, or Linux computer.</p><p><a href="${url}" style="display:inline-block;background:#E0F146;color:#0B101F;padding:14px 22px;font-weight:bold;text-decoration:none">Continue computer setup</a></p><ol><li>Log in with the same account.</li><li>Download and install IdleForest.</li><li>Open the app and log in to connect.</li></ol><p>Your ${name} membership stays linked.</p><p style="font-size:12px;color:#555">This is the one setup email you requested. If you did not request it, you can ignore it.</p></div>`,
        }, { idempotencyKey: `desktop-setup/${user.id}/${company.id}/${new Date().toISOString().slice(0, 10)}` })
        if (error || !data) throw new Error('Email delivery request failed')
        const { error: logError } = await admin.from('email_logs').insert({ user_id: user.id, email: user.email, subject, email_type: 'transactional', segment, status: 'sent', resend_id: data.id })
        // The email was accepted; a logging failure must not tell the user to send it again.
        if (logError) console.error('Desktop setup email log failed:', logError.code)
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Could not send the setup link. Please try again shortly.' }, { status: 500 })
    }
}
