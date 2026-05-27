import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCanonicalSilveiraCompanySlug } from '@/lib/company-partners'
import { getCompanyGeneratedPointStats } from '@/lib/company-node-points'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
    try {
        const admin = createAdminClient()
        const companySlug = getCanonicalSilveiraCompanySlug(params.slug)

        const { data: company, error: companyError } = await admin
            .from('companies')
            .select('id')
            .eq('slug', companySlug)
            .single()

        if (companyError || !company) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }

        const stats = await getCompanyGeneratedPointStats(admin, company.id)

        return NextResponse.json({
            memberCount: stats.memberCount,
            generatedPoints: stats.generatedPoints,
        })
    } catch (error) {
        console.error('Company stats error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
