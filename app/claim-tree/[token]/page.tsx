import { createClient } from '@/lib/supabase/server';
import ClaimPageClient from './ClaimPageClient';
import { Metadata } from 'next';

type Props = {
    params: Promise<{ token: string }>
}

export const metadata: Metadata = {
    title: 'Claim Your Forest | IdleForest',
    description: 'Claim your free signup trees and start your reforestation journey.',
}

export default async function ClaimPage({ params }: Props) {
    const { token } = await params;
    const supabase = await createClient();

    const { data: claim } = await supabase
        .from('pending_tree_claims')
        .select('*')
        .eq('claim_token', token)
        .single();

    if (!claim) {
        // Should usually show 404, but passing to client is smoother for "Invalid Token" msg
        // But for now, let's treat invalid token as expired/error in client or just 404 here.
        // Let's pass blank props and let client handle "Invalid"?
        // Actually, if !claim, we probably shouldn't render the claim UI.
        // I'll pass a flag.
        return <ClaimPageClient token={token} isExpired={true} />;
    }

    const isExpired = new Date(claim.expires_at) < new Date();
    const isClaimed = !!claim.claimed_at;

    return (
        <ClaimPageClient
            token={token}
            userName={claim.user_name}
            referralCode={claim.referral_code} // Pass the stored code
            isExpired={isExpired}
            isClaimed={isClaimed}
        />
    );
}
