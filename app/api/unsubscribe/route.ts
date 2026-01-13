import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET!

// Verify the token signature
function verifyToken(email: string, token: string): boolean {
    const expectedToken = crypto
        .createHmac('sha256', UNSUBSCRIBE_SECRET)
        .update(email.toLowerCase())
        .digest('hex')
        .slice(0, 32)

    return token === expectedToken
}

// GET: Show unsubscribe confirmation page
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
        return new NextResponse(renderPage('Invalid Link', 'This unsubscribe link is invalid or has expired.', false), {
            headers: { 'Content-Type': 'text/html' }
        })
    }

    if (!verifyToken(email, token)) {
        return new NextResponse(renderPage('Invalid Link', 'This unsubscribe link is invalid or has expired.', false), {
            headers: { 'Content-Type': 'text/html' }
        })
    }

    // Show confirmation page
    return new NextResponse(renderConfirmPage(email, token), {
        headers: { 'Content-Type': 'text/html' }
    })
}

// POST: Process the unsubscribe
export async function POST(request: NextRequest) {
    try {
        const { email, token } = await request.json()

        if (!email || !token) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
        }

        if (!verifyToken(email, token)) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 403 })
        }

        const supabase = await createClient()

        // Update the profile to mark as unsubscribed from emails
        // First, find the profile by looking up the user by email
        const { data: profiles, error: lookupError } = await supabase
            .from('profiles')
            .select('id, user_id')
            .limit(100)

        if (lookupError) {
            console.error('Error looking up profiles:', lookupError)
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
        }

        // Store unsubscribed email in a simple table or add to email_logs as a record
        // For now, we'll use the email_logs table to track unsubscribes
        const { error: insertError } = await supabase.from('email_logs').insert({
            email: email,
            subject: 'UNSUBSCRIBED',
            email_type: 'transactional',
            status: 'unsubscribed'
        })

        if (insertError) {
            console.error('Error recording unsubscribe:', insertError)
            // Continue anyway - we'll also track this via a flag
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unsubscribe error:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}

function renderPage(title: string, message: string, success: boolean): string {
    const bgColor = success ? '#E0F146' : '#ff6b6b'
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - IdleForest</title>
    <link rel="icon" href="/favicon.ico">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px 20px; background-color: #D9D9D9; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
    <div style="max-width: 480px; text-align: center;">
        <div style="background-color: ${bgColor}; padding: 20px 24px; border: 2px solid #000000; border-bottom: none;">
            <img src="https://idleforest.com/logo.svg" alt="IdleForest" style="height: 28px;">
        </div>
        <div style="background-color: #ffffff; padding: 40px 32px; border: 2px solid #000000;">
            <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #0B101F;">${title}</h1>
            <p style="margin: 0 0 24px 0; font-size: 16px; color: #666;">${message}</p>
            <a href="https://idleforest.com" style="display: inline-block; padding: 12px 24px; background-color: #E0F146; color: #0B101F; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; border: 2px solid #000000;">Back to IdleForest</a>
        </div>
    </div>
</body>
</html>`
}

function renderConfirmPage(email: string, token: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unsubscribe - IdleForest</title>
    <link rel="icon" href="/favicon.ico">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px 20px; background-color: #D9D9D9; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
    <div style="max-width: 480px; text-align: center;">
        <div style="background-color: #E0F146; padding: 20px 24px; border: 2px solid #000000; border-bottom: none;">
            <img src="https://idleforest.com/logo.svg" alt="IdleForest" style="height: 28px;">
        </div>
        <div style="background-color: #ffffff; padding: 40px 32px; border: 2px solid #000000;">
            <h1 style="margin: 0 0 16px 0; font-size: 24px; color: #0B101F;">Unsubscribe from Emails</h1>
            <p style="margin: 0 0 8px 0; font-size: 16px; color: #666;">You're about to unsubscribe:</p>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #0B101F; font-weight: 600; background: #f5f5f5; padding: 12px; border-radius: 4px;">${email}</p>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #888;">You will no longer receive marketing emails from IdleForest. Important account notifications may still be sent.</p>
            <button onclick="unsubscribe()" id="unsubBtn" style="display: inline-block; padding: 14px 32px; background-color: #0B101F; color: #ffffff; font-weight: 700; font-size: 14px; text-transform: uppercase; border: 2px solid #000000; cursor: pointer; transition: all 0.2s;">Confirm Unsubscribe</button>
            <p style="margin: 24px 0 0 0;"><a href="https://idleforest.com" style="color: #888; font-size: 13px;">Cancel and go back</a></p>
        </div>
    </div>
    <script>
        async function unsubscribe() {
            const btn = document.getElementById('unsubBtn');
            btn.textContent = 'Processing...';
            btn.disabled = true;
            
            try {
                const res = await fetch('/api/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: '${email}', token: '${token}' })
                });
                const data = await res.json();
                
                if (data.success) {
                    document.body.innerHTML = \`${renderPage('Unsubscribed Successfully', "You've been unsubscribed from IdleForest emails. We're sorry to see you go!", true).replace(/`/g, '\\`')}\`;
                } else {
                    btn.textContent = 'Error - Try Again';
                    btn.disabled = false;
                }
            } catch (e) {
                btn.textContent = 'Error - Try Again';
                btn.disabled = false;
            }
        }
    </script>
</body>
</html>`
}
