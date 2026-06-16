import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/resend';
import { randomUUID } from 'crypto';
import { attributePendingTreeClaim, resolveSignupReferrer } from '@/lib/referral-attribution';

export async function POST(request: Request) {
  try {
    const { userId, email, userName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    const supabase = createAdminClient();
    let referredBy: string | null = null;

    try {
      const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(userId);

      if (authUserError) {
        console.error('Error fetching auth user for referral attribution', authUserError);
      } else {
        referredBy = await resolveSignupReferrer(
          supabase,
          userId,
          authUser.user?.user_metadata || {}
        );
      }
    } catch (referralError) {
      console.error('Error resolving signup referrer', referralError);
    }

    // Check if user already has a pending or completed claim?
    // For now, assume one per user.
    const { data: existing } = await supabase.from('pending_tree_claims')
      .select('id, referred_by')
      .eq('user_id', userId)
      .single();

    if (existing) {
      if (!existing.referred_by) {
        await attributePendingTreeClaim(supabase, userId, referredBy);
      }

      return NextResponse.json({ message: 'Claim already exists' }, { status: 200 }); // Idempotency
    }

    const token = randomUUID();
    // Simple referral code generation (could be better)
    const referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // 1. Create Pending Claim
    const { error: insertError } = await supabase.from('pending_tree_claims').insert({
      user_id: userId,
      email: email,
      user_name: userName,
      claim_token: token,
      referral_code: referralCode,
      referred_by: referredBy
    });

    if (insertError) {
      console.error('Error creating claim record', insertError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // 2. Send Email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://idleforest.com';
    const claimUrl = `${baseUrl}/claim-tree/${token}`;
    const desktopOnboardingUrl = `${baseUrl}/welcome`;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.7; color: #0B101F; margin: 0; padding: 40px 20px; background-color: #D9D9D9;">
  
  <div style="max-width: 580px; margin: 0 auto;">
    
    <div style="background-color: #E0F146; padding: 20px 24px; border: 2px solid #000000; border-bottom: none;">
      <img src="https://idleforest.com/logo.png" alt="IdleForest" style="height: 28px;">
    </div>
    
    <div style="background-color: #ffffff; padding: 32px; border: 2px solid #000000;">
      <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${userName || 'Friend'},</p>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">Thanks for joining IdleForest! Your account is the key to unlocking desktop bonus trees.</p>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">Next, download IdleForest for Windows or Mac, open the app, and log in with this account. Once the desktop app syncs, we will automatically detect it and award your desktop bonus trees.</p>

      <p style="margin: 0 0 20px 0; font-size: 16px;">Start on the onboarding page so we can wait for the desktop app to connect.</p>
      
      <div style="text-align: center; margin: 28px 0;">
        <a href="${desktopOnboardingUrl}" style="display: inline-block; padding: 14px 32px; background-color: #E0F146; color: #0B101F; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border: 2px solid #000000;">Unlock Desktop Bonus</a>
      </div>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">After downloading, use your personal claim link to get your free starter trees: <a href="${claimUrl}" style="color: #0B101F; font-weight: 700;">Claim My Forest</a>.</p>

      <p style="margin: 0 0 20px 0; font-size: 16px;">You can still earn more trees by joining a team or inviting friends, but the biggest long-term impact comes from running the desktop app.</p>
      
      <p style="margin: 0 0 0 0; font-size: 16px;">See you in the forest,</p>
      
      <div style="margin-top: 28px; padding-top: 20px; border-top: 3px solid #E0F146;">
        <p style="margin: 0; font-weight: 700; color: #0B101F; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Daniel Ibanez Becker</p>
        <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Founder & CEO, IdleForest</p>
      </div>
    </div>
    
    <div style="background-color: #0B101F; padding: 20px 24px; border: 2px solid #000000; border-top: none; text-align: center;">
      <p style="margin: 0 0 6px 0; font-size: 12px; color: #E0F146; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Turn your idle internet into real trees</p>
      <p style="margin: 0 0 16px 0;"><a href="https://idleforest.com" style="color: #E0F146; text-decoration: none; font-size: 13px;">idleforest.com</a></p>
      <p style="margin: 0; font-size: 12px; color: #888;">Link expires in 7 days.</p>
    </div>
    
  </div>
  
</body>
</html>
    `;

    const { success, error: emailError } = await sendEmail(
      email,
      'Download the desktop app to earn more trees 🌲',
      emailHtml
    );

    if (!success) {
      console.error('Failed to send claim email', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 }); // Should we retry?
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Send Claim Email Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
